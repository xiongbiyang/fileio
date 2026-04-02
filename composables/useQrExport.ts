type QrEccLevel = 'L' | 'M' | 'Q' | 'H'

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement('a')
  link.download = fileName
  link.href = dataUrl
  link.click()
}

function exportCanvasDataUrl(
  sourceCanvas: HTMLCanvasElement,
  width: number,
  mimeType: 'image/png' | 'image/webp',
) {
  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = width
  exportCanvas.height = width
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return null
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(sourceCanvas, 0, 0, width, width)
  return exportCanvas.toDataURL(mimeType)
}

export function useQrExport() {
  function downloadPngFromCanvas(sourceCanvas: HTMLCanvasElement, width: number) {
    const dataUrl = exportCanvasDataUrl(sourceCanvas, width, 'image/png')
    if (!dataUrl) return
    downloadDataUrl(dataUrl, 'qrcode.png')
  }

  function downloadWebpFromCanvas(sourceCanvas: HTMLCanvasElement, width: number) {
    const dataUrl = exportCanvasDataUrl(sourceCanvas, width, 'image/webp')
    if (!dataUrl) return
    downloadDataUrl(dataUrl, 'qrcode.webp')
  }

  async function downloadSvgFromText(options: {
    text: string
    width: number
    errorCorrection: QrEccLevel
    darkColor: string
    lightColor: string
  }) {
    const QRCode = await import('qrcode')
    const svg = await QRCode.toString(options.text, {
      type: 'svg',
      width: options.width,
      errorCorrectionLevel: options.errorCorrection,
      color: { dark: options.darkColor, light: options.lightColor },
    })
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    downloadDataUrl(url, 'qrcode.svg')
    URL.revokeObjectURL(url)
  }

  return { downloadPngFromCanvas, downloadWebpFromCanvas, downloadSvgFromText }
}
