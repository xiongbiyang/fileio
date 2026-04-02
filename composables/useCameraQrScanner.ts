import { onBeforeUnmount, ref, type Ref } from 'vue'

interface UseCameraQrScannerOptions {
  cameraVideoMobile: Ref<HTMLVideoElement | undefined>
  cameraVideoDesktop: Ref<HTMLVideoElement | undefined>
  decodeQrFromImageData: (imageData: ImageData) => Promise<{ data?: string } | null | undefined>
  onDetected: (raw: string) => void
  getMessages: () => { notSupported: string; permissionDenied: string }
}

export function useCameraQrScanner(options: UseCameraQrScannerOptions) {
  const cameraActive = ref(false)
  const cameraErrorMessage = ref('')
  const scanLoopRaf = ref<number | null>(null)
  let cameraStream: MediaStream | null = null

  function stopCameraScan() {
    if (scanLoopRaf.value) {
      cancelAnimationFrame(scanLoopRaf.value)
      scanLoopRaf.value = null
    }
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop())
      cameraStream = null
    }
    if (options.cameraVideoMobile.value) options.cameraVideoMobile.value.srcObject = null
    if (options.cameraVideoDesktop.value) options.cameraVideoDesktop.value.srcObject = null
    cameraActive.value = false
  }

  function tickCameraScan() {
    const video = options.cameraVideoMobile.value ?? options.cameraVideoDesktop.value
    if (!cameraActive.value || !video || video.readyState < 2) {
      scanLoopRaf.value = requestAnimationFrame(tickCameraScan)
      return
    }
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      scanLoopRaf.value = requestAnimationFrame(tickCameraScan)
      return
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    options.decodeQrFromImageData(imageData)
      .then((code) => {
        if (code?.data) {
          options.onDetected(code.data)
          stopCameraScan()
        }
        else {
          scanLoopRaf.value = requestAnimationFrame(tickCameraScan)
        }
      })
      .catch(() => {
        scanLoopRaf.value = requestAnimationFrame(tickCameraScan)
      })
  }

  async function startCameraScan() {
    const { notSupported, permissionDenied } = options.getMessages()
    if (!import.meta.client || !navigator.mediaDevices?.getUserMedia) {
      cameraErrorMessage.value = notSupported
      return
    }

    cameraErrorMessage.value = ''
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      const targetVideo = options.cameraVideoMobile.value ?? options.cameraVideoDesktop.value
      if (!targetVideo) {
        cameraStream.getTracks().forEach(track => track.stop())
        cameraStream = null
        cameraErrorMessage.value = notSupported
        return
      }
      targetVideo.srcObject = cameraStream
      await targetVideo.play()
      cameraActive.value = true
      scanLoopRaf.value = requestAnimationFrame(tickCameraScan)
    }
    catch {
      cameraErrorMessage.value = permissionDenied
      stopCameraScan()
    }
  }

  onBeforeUnmount(() => {
    stopCameraScan()
  })

  return {
    cameraActive,
    cameraErrorMessage,
    startCameraScan,
    stopCameraScan,
  }
}
