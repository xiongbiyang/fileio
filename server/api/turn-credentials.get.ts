/**
 * TURN/STUN credential endpoint.
 *
 * Region awareness:
 *   - Mainland China (CN): Google STUN is blocked; return China-accessible STUN servers.
 *     Symmetric NAT is very common on CN ISPs — TURN is strongly recommended.
 *   - Other regions: include Google STUN (fast globally) + Cloudflare STUN.
 *
 * Cloudflare TURN (optional):
 *   Set NUXT_CLOUDFLARE_TURN_KEY_ID and NUXT_CLOUDFLARE_TURN_API_TOKEN in env.
 *   Cloudflare TURN is served globally including CN (via their CN partner network).
 *   Credentials expire after 5 minutes (ttl: 300).
 *
 * NEVER expose the Cloudflare API token to the frontend.
 */
export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // CF-IPCountry is injected by Cloudflare Workers on every request
  const country = getRequestHeader(event, 'cf-ipcountry') ?? ''
  const isChina = country === 'CN'

  // STUN servers — region-aware
  // China: skip Google (blocked), prioritise low-latency CN/HK endpoints
  // Global: Google STUN is fastest for most users outside China
  const iceServers: Array<RTCIceServer> = isChina
    ? [
        { urls: 'stun:stun.miwifi.com:3478' },       // Xiaomi — reliable in CN
        { urls: 'stun:stun.cloudflare.com:3478' },    // Cloudflare CN partner network
        { urls: 'stun:stun.stunprotocol.org:3478' },  // Neutral backup
      ]
    : [
        { urls: 'stun:stun.l.google.com:19302' },     // Fast globally, blocked in CN
        { urls: 'stun:stun1.l.google.com:19302' },    // Google backup
        { urls: 'stun:stun.cloudflare.com:3478' },
      ]

  // Cloudflare TURN — works globally including CN via partner network
  // Without TURN, users behind symmetric NAT (very common on CN mobile ISPs) cannot connect.
  if (config.cloudflareTurnKeyId && config.cloudflareTurnApiToken) {
    try {
      const response = await $fetch<{
        iceServers: { urls: string[]; username: string; credential: string }
      }>(
        `https://rtc.live.cloudflare.com/v1/turn/keys/${config.cloudflareTurnKeyId}/credentials/generate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.cloudflareTurnApiToken}`,
            'Content-Type': 'application/json',
          },
          body: { ttl: 300 },
        },
      )

      if (response.iceServers) {
        // Prepend TURN so it is tried before STUN — critical for CN symmetric NAT users
        iceServers.unshift(response.iceServers as unknown as RTCIceServer)
      }
    }
    catch {
      // TURN unavailable — fall back to STUN only
    }
  }

  return { iceServers, region: isChina ? 'CN' : 'global' }
})
