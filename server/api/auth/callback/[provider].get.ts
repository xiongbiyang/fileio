import { createError, getQuery, sendRedirect } from 'h3'
import { exchangeCodeForEmail, getOAuthProvider } from '~/server/utils/oauth'
import { normalizeUserId } from '~/server/utils/auth'
import { setAuthSession } from '~/server/utils/session'

function getSigninPathByRedirect(redirectPath: string) {
  const normalized = String(redirectPath || '').trim()
  const [firstSegment] = normalized.split('/').filter(Boolean)
  if (firstSegment === 'zh-CN' || firstSegment === 'zh-TW') {
    return `/${firstSegment}/auth/signin`
  }
  return '/auth/signin'
}

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const fallbackSigninPath = '/auth/signin'
  if (!runtimeConfig.public.oauthEnabled) {
    return sendRedirect(event, `${fallbackSigninPath}?oauth=disabled`, 302)
  }

  const provider = getOAuthProvider(event)
  const query = getQuery(event)
  const code = String(query.code || '').trim()
  const state = String(query.state || '').trim()
  const error = String(query.error || '').trim()

  if (error) {
    return sendRedirect(event, `${fallbackSigninPath}?oauth=error&provider=${encodeURIComponent(provider)}`, 302)
  }
  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'Missing OAuth callback parameters' })
  }

  const { email, redirect } = await exchangeCodeForEmail(event, provider, code, state)
  const signinPath = getSigninPathByRedirect(redirect)
  await setAuthSession(event, {
    id: normalizeUserId(email),
    email,
  })
  const qs = new URLSearchParams({
    oauth: 'success',
    provider,
    email,
  })
  if (redirect) qs.set('redirect', redirect)

  return sendRedirect(event, `${signinPath}?${qs.toString()}`, 302)
})
