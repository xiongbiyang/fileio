import { createError, deleteCookie, getCookie, getRequestURL, setCookie } from 'h3'
import { randomBytes } from 'node:crypto'
import type { H3Event } from 'h3'

export type OAuthProvider = 'google' | 'github'

export interface OAuthProviderConfig {
  provider: OAuthProvider
  authorizeUrl: string
  tokenUrl: string
  userInfoUrl: string
  scope: string
  clientId: string
  clientSecret: string
}

const STATE_COOKIE = 'tp_oauth_state'

function randomToken(size = 24) {
  return randomBytes(size).toString('hex')
}

function parseState(raw: string) {
  try {
    const parsed = JSON.parse(raw) as { nonce?: string, redirect?: string }
    if (!parsed.nonce) return null
    return {
      nonce: String(parsed.nonce),
      redirect: String(parsed.redirect || '').trim(),
    }
  }
  catch {
    return null
  }
}

function normalizeRedirectPath(path: string) {
  if (!path || !path.startsWith('/')) return '/tools/clipboard'
  if (path.startsWith('//')) return '/tools/clipboard'
  return path
}

export function getOAuthProvider(event: H3Event): OAuthProvider {
  const provider = event.context.params?.provider || getQueryValue(event, 'provider')
  if (provider === 'google' || provider === 'github') return provider
  throw createError({ statusCode: 400, statusMessage: 'Unsupported provider' })
}

function getQueryValue(event: H3Event, key: string) {
  const value = getRequestURL(event).searchParams.get(key)
  return value ? String(value).toLowerCase() : ''
}

function baseUrlFromRequest(event: H3Event) {
  const reqUrl = getRequestURL(event)
  return `${reqUrl.protocol}//${reqUrl.host}`
}

function getProviderConfig(event: H3Event, provider: OAuthProvider): OAuthProviderConfig {
  const runtimeConfig = useRuntimeConfig(event)
  if (provider === 'google') {
    return {
      provider,
      authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
      tokenUrl: 'https://oauth2.googleapis.com/token',
      userInfoUrl: 'https://openidconnect.googleapis.com/v1/userinfo',
      scope: 'openid email profile',
      clientId: runtimeConfig.oauthGoogleClientId,
      clientSecret: runtimeConfig.oauthGoogleClientSecret,
    }
  }
  return {
    provider,
    authorizeUrl: 'https://github.com/login/oauth/authorize',
    tokenUrl: 'https://github.com/login/oauth/access_token',
    userInfoUrl: 'https://api.github.com/user',
    scope: 'read:user user:email',
    clientId: runtimeConfig.oauthGithubClientId,
    clientSecret: runtimeConfig.oauthGithubClientSecret,
  }
}

export function buildAuthorizeUrl(event: H3Event, provider: OAuthProvider, redirectPath: string) {
  const config = getProviderConfig(event, provider)
  if (!config.clientId || !config.clientSecret) {
    throw createError({ statusCode: 503, statusMessage: `${provider} OAuth is not configured` })
  }

  const nonce = randomToken()
  const statePayload = JSON.stringify({ nonce, redirect: normalizeRedirectPath(redirectPath) })
  setCookie(event, STATE_COOKIE, statePayload, {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 60 * 10,
  })

  const callbackUrl = `${baseUrlFromRequest(event)}/api/auth/callback/${provider}`
  const url = new URL(config.authorizeUrl)
  url.searchParams.set('client_id', config.clientId)
  url.searchParams.set('redirect_uri', callbackUrl)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', config.scope)
  url.searchParams.set('state', nonce)
  if (provider === 'google')
    url.searchParams.set('prompt', 'select_account')

  return url.toString()
}

export async function exchangeCodeForEmail(event: H3Event, provider: OAuthProvider, code: string, state: string) {
  const config = getProviderConfig(event, provider)
  if (!config.clientId || !config.clientSecret) {
    throw createError({ statusCode: 503, statusMessage: `${provider} OAuth is not configured` })
  }

  const stateCookie = getCookie(event, STATE_COOKIE)
  const parsedState = stateCookie ? parseState(stateCookie) : null
  deleteCookie(event, STATE_COOKIE, { path: '/' })
  if (!parsedState || state !== parsedState.nonce) {
    throw createError({ statusCode: 400, statusMessage: 'OAuth state mismatch' })
  }

  const callbackUrl = `${baseUrlFromRequest(event)}/api/auth/callback/${provider}`
  const tokenResponse = await fetch(config.tokenUrl, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'toolport-auth',
    },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: callbackUrl,
    }),
  })

  if (!tokenResponse.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to exchange OAuth code' })
  }

  const tokenData = await tokenResponse.json() as { access_token?: string }
  const accessToken = tokenData.access_token
  if (!accessToken) {
    throw createError({ statusCode: 502, statusMessage: 'Missing OAuth access token' })
  }

  let email = ''
  if (provider === 'google') {
    const profileResponse = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (!profileResponse.ok) throw createError({ statusCode: 502, statusMessage: 'Failed to load Google profile' })
    const profile = await profileResponse.json() as { email?: string }
    email = String(profile.email || '').trim().toLowerCase()
  }
  else {
    const profileResponse = await fetch(config.userInfoUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/vnd.github+json',
        'User-Agent': 'toolport-auth',
      },
    })
    if (!profileResponse.ok) throw createError({ statusCode: 502, statusMessage: 'Failed to load GitHub profile' })
    const profile = await profileResponse.json() as { email?: string, login?: string }
    email = String(profile.email || '').trim().toLowerCase()
    if (!email) {
      const emailsResponse = await fetch('https://api.github.com/user/emails', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'toolport-auth',
        },
      })
      if (emailsResponse.ok) {
        const emails = await emailsResponse.json() as Array<{ email?: string, primary?: boolean, verified?: boolean }>
        const primary = emails.find(item => item.primary && item.verified) || emails.find(item => item.verified)
        email = String(primary?.email || '').trim().toLowerCase()
      }
      if (!email && profile.login) {
        email = `${String(profile.login).trim().toLowerCase()}@users.noreply.github.com`
      }
    }
  }

  if (!email) {
    throw createError({ statusCode: 502, statusMessage: 'Could not resolve account email' })
  }

  return { email, redirect: normalizeRedirectPath(parsedState.redirect) }
}
