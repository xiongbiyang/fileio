interface ConfirmDialogState {
  visible: boolean
  title: string
  message: string
  confirmText: string
  cancelText: string
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmDialogState>({
  visible: false,
  title: '',
  message: '',
  confirmText: '',
  cancelText: '',
  resolve: null,
})

export function useConfirmDialog() {
  function confirm(options: {
    title: string
    message: string
    confirmText?: string
    cancelText?: string
  }): Promise<boolean> {
    return new Promise((resolve) => {
      state.title = options.title
      state.message = options.message
      state.confirmText = options.confirmText || 'Confirm'
      state.cancelText = options.cancelText || 'Cancel'
      state.resolve = resolve
      state.visible = true
    })
  }

  function handleConfirm() {
    state.visible = false
    state.resolve?.(true)
    state.resolve = null
  }

  function handleCancel() {
    state.visible = false
    state.resolve?.(false)
    state.resolve = null
  }

  return {
    state: readonly(state),
    confirm,
    handleConfirm,
    handleCancel,
  }
}
