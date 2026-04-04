type QrEccLevel = 'L' | 'M' | 'Q' | 'H'
type QrDotsType = 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'square' | 'extra-rounded'
type QrCornerSquareType = 'dot' | 'square' | 'extra-rounded'
type QrCornerDotType = 'dot' | 'square'

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

  function esc(value: string) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }

  function getFinderKind(row: number, col: number, size: number): 'outer' | 'inner' | null {
    const origins = [
      { r: 0, c: 0 },
      { r: 0, c: size - 7 },
      { r: size - 7, c: 0 },
    ]
    for (const origin of origins) {
      const dr = row - origin.r
      const dc = col - origin.c
      if (dr < 0 || dr > 6 || dc < 0 || dc > 6) continue
      const isInner = dr >= 2 && dr <= 4 && dc >= 2 && dc <= 4
      if (isInner) return 'inner'
      const isOuter = dr === 0 || dr === 6 || dc === 0 || dc === 6
      if (isOuter) return 'outer'
    }
    return null
  }

  function getShapeSvg(
    x: number,
    y: number,
    size: number,
    style: QrDotsType | 'dot' | 'square' | 'extra-rounded',
    row: number,
    col: number,
  ) {
    if (style === 'square') {
      return `<rect x="${x}" y="${y}" width="${size}" height="${size}" />`
    }
    if (style === 'dot' || style === 'dots') {
      const cx = x + size / 2
      const cy = y + size / 2
      const r = size / 2
      return `<circle cx="${cx}" cy="${cy}" r="${r}" />`
    }
    let radius = size * 0.25
    if (style === 'rounded') radius = size * 0.32
    if (style === 'classy') radius = (row + col) % 2 === 0 ? size * 0.5 : size * 0.2
    if (style === 'classy-rounded') radius = (row + col) % 2 === 0 ? size * 0.5 : size * 0.35
    if (style === 'extra-rounded') radius = size * 0.5
    return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${radius}" ry="${radius}" />`
  }

  async function downloadSvgFromText(options: {
    text: string
    width: number
    errorCorrection: QrEccLevel
    darkColor: string
    lightColor: string
    margin?: number
    cornersSquareColor?: string
    cornersDotColor?: string
    dotsType?: QrDotsType
    cornersSquareType?: QrCornerSquareType
    cornersDotType?: QrCornerDotType
    logoDataUrl?: string | null
    logoPadding?: number
    logoSizeRatio?: number
  }) {
    const QRCode = await import('qrcode')
    const model = QRCode.create(options.text, {
      errorCorrectionLevel: options.errorCorrection,
    })
    const modules = model.modules as { size: number; data: ArrayLike<number>; get?: (row: number, col: number) => boolean }
    const moduleCount = modules.size
    const margin = Math.max(0, Number.isFinite(options.margin) ? Number(options.margin) : 0)
    const totalModules = moduleCount + margin * 2
    const moduleSize = options.width / totalModules
    const offset = margin * moduleSize
    const bgTransparent = options.lightColor === '#0000'

    const dotsType = options.dotsType ?? 'square'
    const cornersSquareColor = options.cornersSquareColor ?? options.darkColor
    const cornersDotColor = options.cornersDotColor ?? options.darkColor
    const cornersSquareType = options.cornersSquareType ?? 'square'
    const cornersDotType = options.cornersDotType ?? 'square'

    const body: string[] = []
    body.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${options.width}" height="${options.width}" viewBox="0 0 ${options.width} ${options.width}" shape-rendering="geometricPrecision">`)
    if (!bgTransparent) {
      body.push(`<rect x="0" y="0" width="${options.width}" height="${options.width}" fill="${esc(options.lightColor)}" />`)
    }

    const dotParts: string[] = []
    const cornerOuterParts: string[] = []
    const cornerInnerParts: string[] = []
    for (let row = 0; row < moduleCount; row++) {
      for (let col = 0; col < moduleCount; col++) {
        const isDark = typeof modules.get === 'function'
          ? modules.get(row, col)
          : Boolean(modules.data[row * moduleCount + col])
        if (!isDark) continue
        const x = offset + col * moduleSize
        const y = offset + row * moduleSize
        const finderKind = getFinderKind(row, col, moduleCount)
        if (finderKind === 'outer') {
          cornerOuterParts.push(getShapeSvg(x, y, moduleSize, cornersSquareType === 'dot' ? 'dot' : cornersSquareType, row, col))
          continue
        }
        if (finderKind === 'inner') {
          cornerInnerParts.push(getShapeSvg(x, y, moduleSize, cornersDotType === 'dot' ? 'dot' : 'square', row, col))
          continue
        }
        dotParts.push(getShapeSvg(x, y, moduleSize, dotsType, row, col))
      }
    }

    if (dotParts.length) {
      body.push(`<g fill="${esc(options.darkColor)}">${dotParts.join('')}</g>`)
    }
    if (cornerOuterParts.length) {
      body.push(`<g fill="${esc(cornersSquareColor)}">${cornerOuterParts.join('')}</g>`)
    }
    if (cornerInnerParts.length) {
      body.push(`<g fill="${esc(cornersDotColor)}">${cornerInnerParts.join('')}</g>`)
    }

    const logoDataUrl = options.logoDataUrl?.trim()
    if (logoDataUrl) {
      const logoSizeRatio = Number.isFinite(options.logoSizeRatio) ? Number(options.logoSizeRatio) : 0.22
      const logoSize = options.width * Math.max(0.05, Math.min(0.4, logoSizeRatio))
      const logoPadding = Math.max(0, Number.isFinite(options.logoPadding) ? Number(options.logoPadding) : 5)
      const x = (options.width - logoSize) / 2
      const y = (options.width - logoSize) / 2
      const bgX = x - logoPadding
      const bgY = y - logoPadding
      const bgSize = logoSize + logoPadding * 2
      const bgRadius = Math.min(8, bgSize / 2)
      body.push(`<rect x="${bgX}" y="${bgY}" width="${bgSize}" height="${bgSize}" rx="${bgRadius}" ry="${bgRadius}" fill="#ffffff" />`)
      body.push(`<image x="${x}" y="${y}" width="${logoSize}" height="${logoSize}" href="${esc(logoDataUrl)}" preserveAspectRatio="xMidYMid meet" />`)
    }
    body.push('</svg>')
    const svg = body.join('')
    const blob = new Blob([svg], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    downloadDataUrl(url, 'qrcode.svg')
    URL.revokeObjectURL(url)
  }

  return { downloadPngFromCanvas, downloadWebpFromCanvas, downloadSvgFromText }
}
