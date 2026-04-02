import { createError, getQuery, sendRedirect } from 'h3'
import { exchangeCodeForEmail, getOAuthProvider } from '~/server/utils/oauth'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  const localePath = '/auth/signin'
  if (!runtimeConfig.public.oauthEnabled) {
    return sendRedirect(event, `${localePath}?oauth=disabled`, 302)
  }

  const provider = getOAuthProvider(event)
  const query = getQuery(event)
  const code = String(query.code || '').trim()
  const state = String(query.state || '').trim()
  const error = String(query.error || '').trim()

  if (error) {
    return sendRedirect(event, `${localePath}?oauth=error&provider=${encodeURIComponent(provider)}`, 302)
  }
  if (!code || !state) {
    throw createError({ statusCode: 400, statusMessage: 'Missing OAuth callback parameters' })
  }

  const { email, redirect } = await exchangeCodeForEmail(event, provider, code, state)
  const qs = new URLSearchParams({
    oauth: 'success',
    provider,
    email,
  })
  if (redirect) qs.set('redirect', redirect)

  return sendRedirect(event, `${localePath}?${qs.toString()}`, 302)
})
