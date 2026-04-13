interface ConfirmDialogState {
  visible: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  resolve: ((value: boolean) => void) | null
}

// Use useState to safely share state across SSR/client and avoid module-scope reactive() issues
export function useConfirmDialog() {
  const dialogState = useState<ConfirmDialogState>('confirm-dialog', () => ({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    resolve: null,
  }))

  function confirm(options: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
  }): Promise<boolean> {
    return new Promise((resolve) => {
      dialogState.value.title = options.title
      dialogState.value.message = options.message
      dialogState.value.confirmText = options.confirmText || 'Confirm'
      dialogState.value.cancelText = options.cancelText || 'Cancel'
      dialogState.value.resolve = resolve
      dialogState.value.visible = true
    })
  }

  function handleConfirm() {
    dialogState.value.visible = false
    dialogState.value.resolve?.(true)
    dialogState.value.resolve = null
  }

  function handleCancel() {
    dialogState.value.visible = false
    dialogState.value.resolve?.(false)
    dialogState.value.resolve = null
  }

  return {
    state: dialogState,
    confirm,
    handleConfirm,
    handleCancel,
  }
}
