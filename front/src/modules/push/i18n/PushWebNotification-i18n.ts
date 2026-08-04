const messages = {
  en: {
    push: {
      web: {
        title: 'Web Notifications',
        fields: {
          guestLabel: 'Guest label',
        },
        hints: {
          guestLabel: 'Optional identifier for guest subscriptions.',
        },
        actions: {
          enable: 'Enable',
        },
        enableDescription: 'Enable web notifications in this browser to receive push messages from LifeOps.',
        permission: {
          default: 'Pending',
          granted: 'Allowed',
          denied: 'Blocked',
        },
        status: {
          current: 'Current browser permission: {status}',
          enabled: 'Web notifications enabled. Device id: {id}',
          unsupported: 'Not supported',
        },
        unsupported: 'This browser does not support web notifications.',
        ios: {
          homeScreenRequired: 'On iPhone, web push only works from the installed Home Screen web app. Open this page in Safari, tap Share, choose Add to Home Screen, then open LifeOps from the Home Screen and enable notifications there.',
          versionUnsupported: 'On iPhone, web push requires iOS 16.4 or later.',
        },
        serviceWorkerUnsupported: 'This browser does not support service workers.',
        secureContextRequired: 'Web notifications require HTTPS or localhost.',
        firebaseConfigMissing: 'Firebase web configuration is missing.',
        vapidKeyMissing: 'Firebase VAPID key is missing.',
        permissionDenied: 'The browser did not grant notification permission.',
        tokenUnavailable: 'Firebase did not return a browser token.',
        error: 'Web notifications could not be enabled.',
      },
      reception: {
        loading: 'Loading push message...',
        title: 'Push received',
        idLabel: 'Push ID',
        messageTitle: 'Title',
        messageBody: 'Message',
        technicalNote: 'You arrived here from a web push notification with ID {id}. This confirms the notification opened a specific URL generated for that push.',
        openLink: 'Open configured link',
        notFound: 'The push message could not be loaded.',
      },
    },
  },
  es: {
    push: {
      web: {
        title: 'Notificaciones Web',
        fields: {
          guestLabel: 'Label invitado',
        },
        hints: {
          guestLabel: 'Identificador opcional para suscripciones invitadas.',
        },
        actions: {
          enable: 'Activar',
        },
        enableDescription: 'Habilita las notificaciones web en este navegador para recibir mensajes push de LifeOps.',
        permission: {
          default: 'Pendiente',
          granted: 'Permitido',
          denied: 'Bloqueado',
        },
        status: {
          current: 'Permiso actual del navegador: {status}',
          enabled: 'Notificaciones web habilitadas. Id del dispositivo: {id}',
          unsupported: 'No soportado',
        },
        unsupported: 'Este navegador no soporta notificaciones web.',
        ios: {
          homeScreenRequired: 'En iPhone, las notificaciones web push solo funcionan desde la web app instalada en la pantalla de inicio. Abri esta pagina en Safari, toca Compartir, elegi Agregar a pantalla de inicio, despues abri LifeOps desde la pantalla de inicio y habilita las notificaciones ahi.',
          versionUnsupported: 'En iPhone, las notificaciones web push requieren iOS 16.4 o superior.',
        },
        serviceWorkerUnsupported: 'Este navegador no soporta service workers.',
        secureContextRequired: 'Las notificaciones web requieren HTTPS o localhost.',
        firebaseConfigMissing: 'Falta la configuracion web de Firebase.',
        vapidKeyMissing: 'Falta la VAPID key de Firebase.',
        permissionDenied: 'El navegador no otorgo permiso para notificaciones.',
        tokenUnavailable: 'Firebase no devolvio un token de navegador.',
        error: 'No se pudieron habilitar las notificaciones web.',
      },
      reception: {
        loading: 'Cargando push...',
        title: 'Push recibido',
        idLabel: 'ID del push',
        messageTitle: 'Titulo',
        messageBody: 'Mensaje',
        technicalNote: 'Llegaste hasta aca desde una notificacion web push con ID {id}. Esto confirma que la notificacion pudo abrir una URL especifica generada para ese push.',
        openLink: 'Abrir link configurado',
        notFound: 'No se pudo cargar el push.',
      },
    },
  },
}

export default messages
