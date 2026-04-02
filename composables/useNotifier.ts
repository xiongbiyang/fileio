interface AppNotification {
  id: string
  message: string
  tone: 'success' | 'error'
}

const NOTIFICATION_LIFETIME_MS = 2400

export function useNotifier() {
  const notifications = useState<AppNotification[]>('app-notifications', () => [])

  function notify(message: string, tone: AppNotification['tone'] = 'success') {
    const id = crypto.randomUUID()
    notifications.value.push({ id, message, tone })
    setTimeout(() => dismiss(id), NOTIFICATION_LIFETIME_MS)
  }

  function dismiss(id: string) {
    notifications.value = notifications.value.filter(notification => notification.id !== id)
  }

  return {
    dismiss,
    notifications,
    notify,
  }
}
