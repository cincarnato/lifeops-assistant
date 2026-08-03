importScripts('https://www.gstatic.com/firebasejs/12.17.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.17.0/firebase-messaging-compat.js')

const params = new URL(self.location.href).searchParams
const firebaseConfig = {
  apiKey: params.get('apiKey'),
  authDomain: params.get('authDomain') || undefined,
  projectId: params.get('projectId'),
  storageBucket: params.get('storageBucket') || undefined,
  messagingSenderId: params.get('messagingSenderId'),
  appId: params.get('appId'),
  measurementId: params.get('measurementId') || undefined,
}

firebase.initializeApp(firebaseConfig)

const messaging = firebase.messaging()

messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || payload.data?.title || 'LifeOps'
  const options = {
    body: payload.notification?.body || payload.data?.body,
    data: payload.data || {},
  }

  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', event => {
  event.notification.close()

  const link = event.notification?.data?.link
  if (!link) return

  const targetUrl = new URL(link, self.location.origin).href
  event.waitUntil(
    clients.matchAll({type: 'window', includeUncontrolled: true}).then(windowClients => {
      const focusedClient = windowClients.find(client => client.url === targetUrl)
      if (focusedClient) {
        return focusedClient.focus()
      }

      return clients.openWindow(targetUrl)
    })
  )
})
