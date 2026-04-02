import { createError, getQuery } from 'h3'
import { buildAuthorizeUrl, getOAuthProvider } from '~/server/utils/oauth'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig(event)
  if (!runtimeConfig.public.oauthEnabled) {
    throw createError({ statusCode: 503, statusMessage: 'OAuth login is currently disabled' })
  }

  const provider = getOAuthProvider(event)
  const query = getQuery(event)
  const redirect = String(query.redirect || '').trim() || '/tools/clipboard'

  return {
    url: buildAuthorizeUrl(event, provider, redirect),
  }
})
