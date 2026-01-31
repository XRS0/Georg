type TelegramWebApp = {
  ready: () => void
  expand: () => void
  initData: string
  initDataUnsafe?: {
    user?: {
      first_name?: string
      last_name?: string
      username?: string
    }
  }
}

declare global {
  interface Window {
    Telegram?: {
      WebApp?: TelegramWebApp
    }
  }
}

export const initTelegram = () => {
  const webApp = window.Telegram?.WebApp
  if (webApp) {
    webApp.ready()
    webApp.expand()
  }
}

export const getInitData = () => {
  return window.Telegram?.WebApp?.initData ?? ''
}

export const getTelegramUserName = () => {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user
  if (!user) return ''
  return [user.first_name, user.last_name].filter(Boolean).join(' ')
}
