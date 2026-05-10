<script setup lang="ts">
import {computed, nextTick, ref} from 'vue'
import ChatbotTaskProvider from '../providers/ChatbotTaskProvider'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

const sessionId = ref<string>()
const messages = ref<ChatMessage[]>([
  {
    role: 'assistant',
    content: 'Hola. Decime que tarea queres registrar y la guardo por vos.',
  },
])
const input = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)

const canSend = computed(() => input.value.trim().length > 0 && !loading.value)

async function startNewSession() {
  loading.value = true
  error.value = null

  try {
    const response = await ChatbotTaskProvider.instance.startSession()
    sessionId.value = response.sessionId
    messages.value = [
      {
        role: 'assistant',
        content: 'Nueva sesion iniciada. Que tarea queres registrar?',
      },
    ]
  } catch (e: any) {
    error.value = e?.message ?? 'No se pudo iniciar una nueva sesion.'
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

async function sendMessage() {
  if (!canSend.value) {
    return
  }

  const message = input.value.trim()
  input.value = ''
  error.value = null
  loading.value = true
  messages.value.push({role: 'user', content: message})
  await scrollToBottom()

  try {
    const response = await ChatbotTaskProvider.instance.sendMessage(message, sessionId.value)
    sessionId.value = response.sessionId
    messages.value.push({role: 'assistant', content: response.message})
  } catch (e: any) {
    error.value = e?.message ?? 'No se pudo enviar el mensaje.'
    messages.value.push({
      role: 'assistant',
      content: 'No pude procesar el pedido. Proba de nuevo en unos segundos.',
    })
  } finally {
    loading.value = false
    await scrollToBottom()
  }
}

async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

</script>

<template>
  <section class="chatbot-task">
    <header class="chatbot-task__header">
      <div>
        <h1>Asistente de tareas</h1>
        <p v-if="sessionId">Sesion {{ sessionId.slice(0, 8) }}</p>
      </div>

      <v-btn
        color="primary"
        variant="tonal"
        prepend-icon="mdi-plus"
        :loading="loading"
        @click="startNewSession"
      >
        Nueva sesion
      </v-btn>
    </header>

    <v-alert
      v-if="error"
      type="error"
      variant="tonal"
      density="compact"
      class="mb-3"
    >
      {{ error }}
    </v-alert>

    <div ref="messagesContainer" class="chatbot-task__messages">
      <div
        v-for="(message, index) in messages"
        :key="index"
        class="chatbot-task__message-row"
        :class="`chatbot-task__message-row--${message.role}`"
      >
        <div class="chatbot-task__message">
          {{ message.content }}
        </div>
      </div>

      <div v-if="loading" class="chatbot-task__message-row chatbot-task__message-row--assistant">
        <div class="chatbot-task__message chatbot-task__message--loading">
          Procesando...
        </div>
      </div>
    </div>

    <form class="chatbot-task__composer" @submit.prevent="sendMessage">
      <v-textarea
        v-model="input"
        label="Mensaje"
        placeholder="Ej: Registrame una tarea para llamar al cliente manana a las 10"
        rows="2"
        auto-grow
        max-rows="5"
        hide-details
        :disabled="loading"
        @keydown.enter.exact.prevent="sendMessage"
      />

      <v-btn
        color="primary"
        icon="mdi-send"
        type="submit"
        :disabled="!canSend"
        :loading="loading"
        aria-label="Enviar"
      />
    </form>
  </section>
</template>

<style scoped>
.chatbot-task {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 128px);
  min-height: 560px;
  padding: 24px;
  background: rgb(var(--v-theme-surface));
}

.chatbot-task__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.chatbot-task__header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.chatbot-task__header p {
  margin: 4px 0 0;
  color: rgba(var(--v-theme-on-surface), 0.64);
  font-size: 0.875rem;
}

.chatbot-task__messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgba(var(--v-theme-on-surface), 0.025);
}

.chatbot-task__message-row {
  display: flex;
  margin-bottom: 12px;
}

.chatbot-task__message-row--user {
  justify-content: flex-end;
}

.chatbot-task__message-row--assistant {
  justify-content: flex-start;
}

.chatbot-task__message {
  max-width: min(720px, 82%);
  padding: 10px 12px;
  border-radius: 8px;
  white-space: pre-wrap;
  line-height: 1.45;
}

.chatbot-task__message-row--user .chatbot-task__message {
  color: rgb(var(--v-theme-on-primary));
  background: rgb(var(--v-theme-primary));
}

.chatbot-task__message-row--assistant .chatbot-task__message {
  color: rgb(var(--v-theme-on-surface));
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.chatbot-task__message--loading {
  color: rgba(var(--v-theme-on-surface), 0.68);
}

.chatbot-task__composer {
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  gap: 12px;
  margin-top: 16px;
}

@media (max-width: 700px) {
  .chatbot-task {
    height: calc(100vh - 88px);
    min-height: 480px;
    padding: 12px;
  }

  .chatbot-task__header {
    align-items: flex-start;
    flex-direction: column;
  }

  .chatbot-task__messages {
    padding: 12px;
  }

  .chatbot-task__message {
    max-width: 92%;
  }
}
</style>
