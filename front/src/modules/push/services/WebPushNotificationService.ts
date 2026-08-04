import {FirebaseApp, getApp, getApps, initializeApp} from 'firebase/app'
import {getMessaging, getToken, isSupported, Messaging, onMessage} from 'firebase/messaging'
import PushDeviceProvider from '../providers/PushDeviceProvider'

interface WebPushFirebaseConfig {
  apiKey: string
  projectId: string
  messagingSenderId: string
  appId: string
}

interface WebPushRegisterResult {
  permission: NotificationPermission
  token: string
  pushDeviceId?: string
}

interface WebPushSupportStatus {
  supported: boolean
  reason?: string
  iosHomeScreenRequired?: boolean
}

class WebPushNotificationService {
  static singleton: WebPushNotificationService
  private app: FirebaseApp | null = null
  private messaging: Messaging | null = null

  static get instance(): WebPushNotificationService {
    if (!WebPushNotificationService.singleton) {
      WebPushNotificationService.singleton = new WebPushNotificationService()
    }

    return WebPushNotificationService.singleton
  }

  async registerBrowser(guestLabel?: string): Promise<WebPushRegisterResult> {
    this.assertBrowserSupport()

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      throw new Error('push.web.permissionDenied')
    }

    const messaging = await this.getMessagingInstance()
    const serviceWorkerRegistration = await this.registerServiceWorker()
    const token = await getToken(messaging, {
      vapidKey: this.getVapidKey(),
      serviceWorkerRegistration,
    })

    if (!token) {
      throw new Error('push.web.tokenUnavailable')
    }

    const device = await PushDeviceProvider.instance.register({
      platform: 'web',
      token,
      deviceName: this.getDeviceName(),
      guestLabel: guestLabel?.trim() || undefined,
      enabled: true,
    })

    this.listenForegroundMessages(messaging)

    return {
      permission,
      token,
      pushDeviceId: device?._id,
    }
  }

  getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.hasNotificationApi()) {
      return 'unsupported'
    }

    return Notification.permission
  }

  getSupportStatus(): WebPushSupportStatus {
    if (this.isIOS() && !this.isStandaloneWebApp()) {
      return {
        supported: false,
        reason: 'push.web.ios.homeScreenRequired',
        iosHomeScreenRequired: true,
      }
    }

    if (!this.isSupportedIOSVersion()) {
      return {
        supported: false,
        reason: 'push.web.ios.versionUnsupported',
      }
    }

    if (!this.hasNotificationApi()) {
      return {
        supported: false,
        reason: 'push.web.unsupported',
      }
    }

    if (!('serviceWorker' in navigator)) {
      return {
        supported: false,
        reason: 'push.web.serviceWorkerUnsupported',
      }
    }

    if (!('PushManager' in window)) {
      return {
        supported: false,
        reason: 'push.web.unsupported',
      }
    }

    if (!window.isSecureContext) {
      return {
        supported: false,
        reason: 'push.web.secureContextRequired',
      }
    }

    return {supported: true}
  }

  private async getMessagingInstance(): Promise<Messaging> {
    if (this.messaging) {
      return this.messaging
    }

    if (!await isSupported()) {
      throw new Error('push.web.unsupported')
    }

    this.app = getApps().length ? getApp() : initializeApp(this.getFirebaseConfig())
    this.messaging = getMessaging(this.app)

    return this.messaging
  }

  private async registerServiceWorker(): Promise<ServiceWorkerRegistration> {
    if (!('serviceWorker' in navigator)) {
      throw new Error('push.web.serviceWorkerUnsupported')
    }

    const params = new URLSearchParams()
    Object.entries(this.getFirebaseConfig()).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      }
    })

    const registration = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${params.toString()}`, {
      scope: '/',
    })

    await navigator.serviceWorker.ready
    return registration
  }

  private listenForegroundMessages(messaging: Messaging) {
    onMessage(messaging, payload => {
      const title = payload.notification?.title || payload.data?.title
      const body = payload.notification?.body || payload.data?.body
      const link = payload.data?.link

      if (!title || Notification.permission !== 'granted') {
        return
      }

      const notification = new Notification(title, {
        body,
        data: payload.data,
      })

      notification.onclick = () => {
        if (link) {
          window.open(link, '_blank')
        }
      }
    })
  }

  private assertBrowserSupport() {
    const support = this.getSupportStatus()
    if (!support.supported) {
      throw new Error(support.reason || 'push.web.unsupported')
    }
  }

  private hasNotificationApi(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window
  }

  private isIOS(): boolean {
    const platform = navigator.platform || ''
    const userAgent = navigator.userAgent || ''
    return /iPad|iPhone|iPod/.test(userAgent) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }

  private isStandaloneWebApp(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone === true
  }

  private isSupportedIOSVersion(): boolean {
    if (!this.isIOS()) {
      return true
    }

    const match = navigator.userAgent.match(/OS (\d+)_(\d+)/)
    if (!match) {
      return true
    }

    const major = Number(match[1])
    const minor = Number(match[2])
    return major > 16 || (major === 16 && minor >= 4)
  }

  private getFirebaseConfig(): WebPushFirebaseConfig {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
    }

    if (!config.apiKey || !config.projectId || !config.messagingSenderId || !config.appId) {
      throw new Error('push.web.firebaseConfigMissing')
    }

    return config
  }

  private getVapidKey(): string {
    const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY
    if (!vapidKey) {
      throw new Error('push.web.vapidKeyMissing')
    }

    return vapidKey
  }

  private getDeviceName(): string {
    const platform = (navigator as any).userAgentData?.platform || navigator.platform || 'Web'
    return `${platform} - ${navigator.userAgent}`
  }
}

export default WebPushNotificationService
export {WebPushNotificationService}
export type {WebPushRegisterResult, WebPushSupportStatus}
