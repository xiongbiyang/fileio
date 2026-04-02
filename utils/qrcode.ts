interface RenderQrCodeOptions {
  dark?: string
  light?: string
  margin?: number
  width: number
}

export async function renderQrCodeToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  options: RenderQrCodeOptions,
) {
  const QRCode = await import('qrcode')
  await QRCode.toCanvas(canvas, text, {
    width: options.width,
    margin: options.margin ?? 1,
    color: {
      dark: options.dark ?? '#000000',
      light: options.light ?? '#ffffff',
    },
  })
}
