const DARK_VARS: Record<string, string> = {
  '--color-surface-container-lowest': '14 17 17',
  '--color-surface-container-low': '25 28 29',
  '--color-surface-container': '29 33 32',
  '--color-surface-container-high': '39 43 42',
  '--color-surface-container-highest': '50 54 54',
  '--color-on-surface-variant': '188 201 197',
  '--color-outline': '136 148 145',
  '--color-outline-variant': '62 73 70',
}

const LIGHT_VARS: Record<string, string> = {
  '--color-surface-container-lowest': '255 255 255',
  '--color-surface-container-low': '243 244 245',
  '--color-surface-container': '237 238 240',
  '--color-surface-container-high': '231 232 234',
  '--color-surface-container-highest': '225 227 228',
  '--color-on-surface-variant': '62 73 70',
  '--color-outline': '111 121 119',
  '--color-outline-variant': '190 201 197',
}

export function useTheme() {
  const isDark = useState('theme-dark', () => false)

  function toggle() {
    isDark.value = !isDark.value
    applyTheme()
  }

  function applyTheme() {
    if (import.meta.client) {
      document.documentElement.classList.toggle('dark', isDark.value)
      localStorage.setItem('tp_theme', isDark.value ? 'dark' : 'light')
      const vars = isDark.value ? DARK_VARS : LIGHT_VARS
      const style = document.documentElement.style
      for (const [key, val] of Object.entries(vars)) {
        style.setProperty(key, val)
      }
    }
  }

  function init() {
    if (import.meta.client) {
      const stored = localStorage.getItem('tp_theme')
      if (stored) {
        isDark.value = stored === 'dark'
      } else {
        isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
      }
      applyTheme()
    }
  }

  onMounted(() => {
    init()
  })

  return { isDark, toggle }
}
