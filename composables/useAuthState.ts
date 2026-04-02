interface AuthUser {
  id: string
  email: string
}

const AUTH_STORAGE_KEY = 'tp_auth_user'

function readStoredUser(): AuthUser | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<AuthUser>
    if (!parsed.id || !parsed.email) return null
    return { id: parsed.id, email: parsed.email }
  }
  catch {
    return null
  }
}

function writeStoredUser(user: AuthUser | null) {
  if (!import.meta.client) return
  if (!user) {
    localStorage.removeItem(AUTH_STORAGE_KEY)
    return
  }
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
}

function normalizeUserId(email: string) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_')
}

export function useAuthState() {
  const user = useState<AuthUser | null>('auth-user', () => null)
  const isInitialized = useState<boolean>('auth-user-initialized', () => false)

  if (import.meta.client && !isInitialized.value) {
    user.value = readStoredUser()
    isInitialized.value = true
  }

  const isLoggedIn = computed(() => !!user.value)
  const userId = computed(() => user.value?.id || '')

  function signIn(email: string) {
    const normalizedEmail = email.trim().toLowerCase()
    const nextUser: AuthUser = {
      id: normalizeUserId(normalizedEmail),
      email: normalizedEmail,
    }
    user.value = nextUser
    writeStoredUser(nextUser)
  }

  function signOut() {
    user.value = null
    writeStoredUser(null)
  }

  return {
    isLoggedIn,
    signIn,
    signOut,
    user,
    userId,
  }
}
