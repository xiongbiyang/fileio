export type QrScanType = 'url' | 'wifi' | 'text'

export interface QrScanMetaItem {
  label: string
  value: string
}

export interface ParsedQrScanResult {
  type: QrScanType
  title: string
  meta: QrScanMetaItem[]
}

export function useQrScan() {
  async function decodeQrFromImageData(imageData: ImageData) {
    const jsQR = (await import('jsqr')).default
    return jsQR(imageData.data, imageData.width, imageData.height)
  }

  function parseQrScanRaw(raw: string, textDetectedLabel: string): ParsedQrScanResult {
    if (raw.startsWith('WIFI:')) {
      const ssidMatch = raw.match(/S:([^;]*)/)
      const secMatch = raw.match(/T:([^;]*)/)
      return {
        type: 'wifi',
        title: ssidMatch?.[1] || 'WiFi Network',
        meta: [
          { label: 'Security', value: secMatch?.[1] || 'Unknown' },
          { label: 'Hidden', value: raw.includes('H:true') ? 'Yes' : 'No' },
        ],
      }
    }

    if (/^https?:\/\//i.test(raw)) {
      try {
        const u = new URL(raw)
        return {
          type: 'url',
          title: u.hostname,
          meta: [
            { label: 'Protocol', value: u.protocol.replace(':', '').toUpperCase() },
            { label: 'Domain', value: u.hostname },
          ],
        }
      }
      catch {
        return {
          type: 'url',
          title: raw.substring(0, 40),
          meta: [{ label: 'Type', value: 'URL' }],
        }
      }
    }

    return {
      type: 'text',
      title: textDetectedLabel,
      meta: [
        { label: 'Length', value: `${raw.length} chars` },
        { label: 'Encoding', value: 'UTF-8' },
      ],
    }
  }

  return { decodeQrFromImageData, parseQrScanRaw }
}
