<script setup lang="ts">
import {computed, onBeforeUnmount, onMounted, ref} from 'vue'
import type {ComputedRef, Ref} from 'vue'
import {useDraxAgent} from '@drax/ai-vue'
import type {ITask} from '../interfaces/ITask'
import TaskProvider from '../providers/TaskProvider'

const draxAgent = useDraxAgent()
const {
  agentSelectItems,
  agentsLoading,
  canSend,
  currentAssistantMessage,
  error,
  input,
  interimSpeech,
  loading,
  messages,
  messagesContainer,
  navigationEnabled,
  selectAgent,
  selectedAgent,
  selectedAgentIdentifier,
  selectedVoiceName,
  sendMessage,
  sessionId,
  showAgentSelector,
  speechAutoSendEnabled,
  speechAutoSendLabel,
  speechEnabled,
  speechError,
  speechPressToTalkActive,
  speechSupported,
  startNewSession,
  startPressToTalk,
  stopPressToTalk,
  stopTextToSpeech,
  textToSpeechEnabled,
  textToSpeechSpeaking,
  textToSpeechSupported,
  toggleNavigation,
  toggleSpeechAutoSend,
  toggleSpeechRecognition,
  toggleTextToSpeech,
  toggleVisualBot,
  visualBotButtonLabel,
  visualBotVisible,
} = draxAgent

const draxAgentWithTextToSpeechProviders = draxAgent as typeof draxAgent & {
  selectTextToSpeechProvider?: (provider: string) => void
  selectedTextToSpeechProvider?: Ref<string>
  selectedTextToSpeechProviderLabel?: Ref<string>
  textToSpeechProviderItems?: ComputedRef<TextToSpeechProviderItem[]> | Ref<TextToSpeechProviderItem[]>
  textToSpeechProvidersLoading?: Ref<boolean>
}

type TextToSpeechProviderItem = {
  props?: {
    disabled?: boolean
  }
  title: string
  value: string
}

type Particle = {
  alpha: number
  size: number
  speedX: number
  speedY: number
  x: number
  y: number
}

const particlesCanvas = ref<HTMLCanvasElement | null>(null)
const activePointerId = ref<number | null>(null)
const textToSpeechProviderMenuOpen = ref(false)
const selectedTextToSpeechProvider = draxAgentWithTextToSpeechProviders.selectedTextToSpeechProvider ?? ref('browser')
const selectedTextToSpeechProviderLabel = draxAgentWithTextToSpeechProviders.selectedTextToSpeechProviderLabel ?? selectedVoiceName
const textToSpeechProvidersLoading = draxAgentWithTextToSpeechProviders.textToSpeechProvidersLoading ?? ref(false)
const textToSpeechProviderItems = draxAgentWithTextToSpeechProviders.textToSpeechProviderItems ?? computed(() => [{
  props: {disabled: true},
  title: selectedTextToSpeechProviderLabel.value,
  value: selectedTextToSpeechProvider.value,
}])
const taskProvider = TaskProvider.instance
const taskItems = ref<ITask[]>([])
const taskPage = ref(1)
const taskTotalPages = ref(1)
const taskTotal = ref(0)
const tasksLoading = ref(false)
const tasksError = ref('')
let particles: Particle[] = []
let animationFrameId = 0
let taskRefreshIntervalId = 0

const TASK_PAGE_SIZE = 3

const selectedAgentLabel = computed(() => selectedAgent.value?.identifier ?? selectedAgentIdentifier.value ?? 'default')
const sessionLabel = computed(() => sessionId.value ? sessionId.value.slice(0, 8).toUpperCase() : 'LOCAL')
const neuralLoad = computed(() => loading.value ? 96 : textToSpeechSpeaking.value ? 84 : speechEnabled.value ? 78 : 42)
const synapticBandwidth = computed(() => loading.value ? 91 : speechEnabled.value ? 72 : 38)
const latencyJitter = computed(() => speechError.value ? 'ERR' : loading.value ? '18MS' : '12MS')
const coreTemp = computed(() => textToSpeechSpeaking.value ? 39 : loading.value ? 37 : 34)
const coreStatusLabel = computed(() => {
  if (speechError.value || error.value) {
    return 'Agent requiere atencion'
  }

  if (loading.value) {
    return 'Procesando solicitud'
  }

  if (textToSpeechSpeaking.value) {
    return 'Agent respondiendo'
  }

  if (speechPressToTalkActive.value || speechEnabled.value) {
    return 'Agent escuchando'
  }

  return 'Agent active core'
})
const coreCaption = computed(() => {
  if (speechError.value) {
    return speechError.value
  }

  if (error.value) {
    return error.value
  }

  if (interimSpeech.value) {
    return interimSpeech.value
  }

  return currentAssistantMessage.value
})
const activeTools = computed(() => [
  {icon: '◈', label: `AGENT ${selectedAgentLabel.value.toUpperCase()}`},
  {icon: navigationEnabled.value ? '⌖' : '⊘', label: navigationEnabled.value ? 'AUTO NAVIGATION' : 'NAVIGATION OFF'},
  {
    icon: textToSpeechEnabled.value ? '▰' : '▱',
    label: textToSpeechEnabled.value ? `VOICE ${selectedTextToSpeechProviderLabel.value}` : 'TEXT ONLY MODE',
  },
])
const taskPageLabel = computed(() => `${taskPage.value}/${taskTotalPages.value}`)

function startHoldToTalk(event: PointerEvent) {
  if (event.button !== 0 || !speechSupported.value || loading.value || textToSpeechSpeaking.value) {
    return
  }

  activePointerId.value = event.pointerId
  const target = event.currentTarget as HTMLElement | null
  target?.setPointerCapture?.(event.pointerId)
  startPressToTalk()
}

function stopHoldToTalk(event?: Event) {
  const pointerEvent = typeof PointerEvent !== 'undefined' && event instanceof PointerEvent ? event : null

  if (pointerEvent && activePointerId.value !== null && pointerEvent.pointerId !== activePointerId.value) {
    return
  }

  activePointerId.value = null
  stopPressToTalk()
}

function handleAgentChange(event: Event) {
  const target = event.target as HTMLSelectElement | null
  selectAgent(target?.value)
}

function toggleTextToSpeechProviderMenu() {
  if (textToSpeechProvidersLoading.value) {
    return
  }

  textToSpeechProviderMenuOpen.value = !textToSpeechProviderMenuOpen.value
}

function handleTextToSpeechProviderSelect(provider: string) {
  draxAgentWithTextToSpeechProviders.selectTextToSpeechProvider?.(provider)
  textToSpeechProviderMenuOpen.value = false
}

async function loadTaskPage(page: number) {
  if (tasksLoading.value) {
    return
  }

  tasksLoading.value = true
  tasksError.value = ''

  try {
    const result = await taskProvider.paginate({
      page,
      limit: TASK_PAGE_SIZE,
      orderBy: 'createdAt',
      order: 'desc',
    })
    const total = result.total || 0
    const totalPages = Math.max(1, Math.ceil(total / (result.limit || TASK_PAGE_SIZE)))

    if (page > totalPages && total > 0) {
      taskPage.value = totalPages
      tasksLoading.value = false
      await loadTaskPage(totalPages)
      return
    }

    taskItems.value = result.items || []
    taskPage.value = result.page || page
    taskTotal.value = total
    taskTotalPages.value = totalPages
  } catch (taskError: any) {
    tasksError.value = taskError?.message || 'No se pudieron cargar las tareas'
  } finally {
    tasksLoading.value = false
  }
}

function loadNextTaskPage() {
  const nextPage = taskPage.value >= taskTotalPages.value ? 1 : taskPage.value + 1
  void loadTaskPage(nextPage)
}

function taskDateLabel(task: ITask) {
  const value = task.createdAt || task.updatedAt
  if (!value) {
    return 'SIN FECHA'
  }

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    month: '2-digit',
  }).format(new Date(value)).toUpperCase()
}

function taskMetaLabel(task: ITask) {
  return [task.status, task.priority, task.lifeArea].filter(Boolean).join(' / ') || 'SIN CLASIFICAR'
}

function resizeParticlesCanvas() {
  const canvas = particlesCanvas.value
  const parent = canvas?.parentElement
  if (!canvas || !parent) {
    return
  }

  const rect = parent.getBoundingClientRect()
  const pixelRatio = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.floor(rect.width * pixelRatio))
  canvas.height = Math.max(1, Math.floor(rect.height * pixelRatio))
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`

  const context = canvas.getContext('2d')
  context?.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
}

function resetParticle(particle: Particle, width: number, height: number) {
  particle.x = Math.random() * width
  particle.y = Math.random() * height
  particle.size = Math.random() * 2.5
  particle.speedX = (Math.random() - 0.5) * 0.35
  particle.speedY = (Math.random() - 0.5) * 0.35
  particle.alpha = Math.random() * 0.6
}

function createParticles() {
  const canvas = particlesCanvas.value
  if (!canvas) {
    return
  }

  const rect = canvas.getBoundingClientRect()
  particles = Array.from({length: 180}, () => {
    const particle = {alpha: 0, size: 0, speedX: 0, speedY: 0, x: 0, y: 0}
    resetParticle(particle, rect.width, rect.height)
    return particle
  })
}

function drawParticles() {
  const canvas = particlesCanvas.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context) {
    return
  }

  const rect = canvas.getBoundingClientRect()
  context.clearRect(0, 0, rect.width, rect.height)

  particles.forEach((particle) => {
    particle.x += particle.speedX
    particle.y += particle.speedY

    if (particle.x < 0 || particle.x > rect.width || particle.y < 0 || particle.y > rect.height) {
      resetParticle(particle, rect.width, rect.height)
    }

    context.fillStyle = `rgba(0, 242, 255, ${particle.alpha})`
    context.beginPath()
    context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
    context.fill()
  })

  animationFrameId = window.requestAnimationFrame(drawParticles)
}

function setupParticles() {
  resizeParticlesCanvas()
  createParticles()
  drawParticles()
}

onMounted(() => {
  if (navigationEnabled.value) {
    toggleNavigation()
  }

  setupParticles()
  void loadTaskPage(1)
  taskRefreshIntervalId = window.setInterval(loadNextTaskPage, 15000)
  window.addEventListener('resize', setupParticles)
})

onBeforeUnmount(() => {
  stopPressToTalk()
  window.removeEventListener('resize', setupParticles)
  if (taskRefreshIntervalId) {
    window.clearInterval(taskRefreshIntervalId)
  }
  if (animationFrameId) {
    window.cancelAnimationFrame(animationFrameId)
  }
})
</script>

<template>
  <section
    class="agent-cine"
    :class="{
      'agent-cine--listening': speechPressToTalkActive || speechEnabled,
      'agent-cine--loading': loading,
      'agent-cine--speaking': textToSpeechSpeaking,
      'agent-cine--error': error || speechError,
    }"
  >
    <canvas ref="particlesCanvas" class="agent-cine__particles" aria-hidden="true" />

    <header class="agent-cine__top-actions">
      <select
        v-if="showAgentSelector"
        :value="selectedAgentIdentifier"
        :disabled="loading || agentsLoading"
        aria-label="Seleccionar agente"
        @change="handleAgentChange"
      >
        <option
          v-for="agent in agentSelectItems"
          :key="agent.value"
          :value="agent.value"
        >
          {{ agent.title }}
        </option>
      </select>

      <button type="button" :title="visualBotButtonLabel" @click="toggleVisualBot">
        {{ visualBotVisible ? 'CORE' : 'HIDE' }}
      </button>
      <button
        v-if="textToSpeechSupported"
        type="button"
        :title="textToSpeechEnabled ? 'Apagar lectura de respuestas' : 'Prender lectura de respuestas'"
        @click="toggleTextToSpeech"
      >
        {{ textToSpeechEnabled ? 'VOICE' : 'TEXT' }}
      </button>
      <div v-if="textToSpeechSupported" class="agent-cine__tts-provider">
        <button
          type="button"
          aria-haspopup="menu"
          :aria-expanded="textToSpeechProviderMenuOpen"
          :disabled="textToSpeechProvidersLoading"
          :title="`Elegir proveedor de voz: ${selectedTextToSpeechProviderLabel}`"
          @click="toggleTextToSpeechProviderMenu"
        >
          {{ textToSpeechProvidersLoading ? 'VOICE ...' : 'VOICE SYS' }}
        </button>

        <div
          v-if="textToSpeechProviderMenuOpen"
          class="agent-cine__tts-provider-menu"
          role="menu"
        >
          <span>VOICE PROVIDER</span>
          <button
            v-for="provider in textToSpeechProviderItems"
            :key="provider.value"
            type="button"
            role="menuitemradio"
            :aria-checked="provider.value === selectedTextToSpeechProvider"
            :disabled="provider.props?.disabled"
            @click="handleTextToSpeechProviderSelect(provider.value)"
          >
            <i>{{ provider.value === selectedTextToSpeechProvider ? '✓' : '◇' }}</i>
            <strong>{{ provider.title }}</strong>
          </button>
        </div>
      </div>
      <button class="agent-cine__new-session" type="button" :disabled="loading" @click="startNewSession">
        NEW SESSION
      </button>
    </header>

    <main class="agent-cine__main">
      <section class="agent-cine__wing agent-cine__wing--left">
        <div class="agent-cine__panel agent-cine__panel--compact">
          <div class="agent-cine__panel-header">
            <h3>NEURAL LOAD</h3>
            <span>{{ neuralLoad }}.4%</span>
          </div>

          <div class="agent-cine__metric">
            <div><span>SYNAPTIC BANDWIDTH</span><strong>{{ synapticBandwidth }}%</strong></div>
            <i :style="{width: `${synapticBandwidth}%`}" />
          </div>

          <div class="agent-cine__metric agent-cine__metric--violet">
            <div><span>LATENCY JITTER</span><strong>{{ latencyJitter }}</strong></div>
            <i :style="{width: speechError ? '86%' : '34%'}" />
          </div>

          <div class="agent-cine__metric agent-cine__metric--soft">
            <div><span>CORE TEMP</span><strong>{{ coreTemp }}C</strong></div>
            <i :style="{width: `${coreTemp + 14}%`}" />
          </div>
        </div>

        <div class="agent-cine__panel agent-cine__panel--memory">
          <h3>MEMORY CONTEXT</h3>
          <div class="agent-cine__memory-core">
            <span class="agent-cine__ring agent-cine__ring--one" />
            <span class="agent-cine__ring agent-cine__ring--two" />
            <span class="agent-cine__ring agent-cine__ring--three" />
            <div>
              <strong>{{ messages.length }}</strong>
              <span>MESSAGE CACHE</span>
            </div>
          </div>

          <div class="agent-cine__micro-grid">
            <div>
              <span>SESSION</span>
              <strong>{{ sessionLabel }}</strong>
            </div>
            <div>
              <span>BUFFERS</span>
              <strong>{{ loading ? 'BUSY' : 'READY' }}</strong>
            </div>
          </div>
        </div>

        <div class="agent-cine__panel agent-cine__panel--tools">
          <h3>ACTIVE TOOLS</h3>
          <div class="agent-cine__tool-list">
            <button
              v-for="tool in activeTools"
              :key="tool.label"
              class="agent-cine__tool"
              type="button"
            >
              <span>{{ tool.icon }}</span>
              <strong>{{ tool.label }}</strong>
            </button>
          </div>
        </div>
      </section>

      <section class="agent-cine__core-panel">
        <div class="agent-cine__hud" aria-hidden="true">
          <span class="agent-cine__hud-ring agent-cine__hud-ring--one" />
          <span class="agent-cine__hud-ring agent-cine__hud-ring--two" />
          <span class="agent-cine__hud-glow" />
        </div>

        <div class="agent-cine__ghost" aria-hidden="true">
          <div class="agent-cine__particle agent-cine__particle--one" />
          <div class="agent-cine__particle agent-cine__particle--two" />
          <div class="agent-cine__particle agent-cine__particle--three" />
          <div class="agent-cine__particle agent-cine__particle--four" />
          <span class="agent-cine__aura agent-cine__aura--cyan" />
          <span class="agent-cine__aura agent-cine__aura--violet" />
          <div class="agent-cine__ghost-core">
            <span class="agent-cine__eye" />
            <span class="agent-cine__eye" />
          </div>
          <svg class="agent-cine__orbital" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="48" stroke="rgba(0,242,255,.16)" stroke-dasharray="2 10" stroke-width=".3" />
          </svg>
        </div>

        <div class="agent-cine__status-chip">
          <span />
          <strong>{{ coreStatusLabel }}</strong>
        </div>
        <p class="agent-cine__caption">{{ coreCaption }}</p>
      </section>

      <section class="agent-cine__wing agent-cine__wing--right">
        <div class="agent-cine__panel agent-cine__panel--radar">
          <h3>GOAL ALIGNMENT</h3>
          <div class="agent-cine__radar">
            <span class="agent-cine__scanner" />
            <svg viewBox="0 0 100 100">
              <polygon fill="none" points="50,10 90,40 70,90 30,90 10,40" stroke="rgba(0,242,255,.25)" stroke-width=".5" />
              <polygon fill="rgba(0,242,255,.25)" points="50,25 80,45 65,80 35,75 20,45" stroke="#00f2ff" stroke-width="1" />
            </svg>
            <span>EFFICIENCY</span>
            <span>CREATIVITY</span>
            <span>RISK</span>
            <span>STABILITY</span>
          </div>
        </div>

        <div class="agent-cine__panel agent-cine__panel--tasks">
          <div class="agent-cine__panel-header">
            <h3>TAREAS RECIENTES</h3>
            <span>{{ taskTotal }} / PAG {{ taskPageLabel }}</span>
          </div>

          <div class="agent-cine__tasks">
            <p v-if="tasksError" class="agent-cine__tasks-state">{{ tasksError }}</p>
            <p v-else-if="tasksLoading && taskItems.length === 0" class="agent-cine__tasks-state">Cargando tareas...</p>
            <p v-else-if="taskItems.length === 0" class="agent-cine__tasks-state">Sin tareas registradas</p>

            <template v-else>
              <article
                v-for="task in taskItems"
                :key="task._id"
                class="agent-cine__task"
              >
                <span>{{ taskDateLabel(task) }}</span>
                <strong>{{ task.title }}</strong>
                <small>{{ taskMetaLabel(task) }}</small>
              </article>
            </template>
          </div>
        </div>

        <div class="agent-cine__panel agent-cine__panel--matrix">
          <div class="agent-cine__panel-header">
            <h3>DECISION MATRIX</h3>
            <span>QS</span>
          </div>
          <div class="agent-cine__bars" aria-hidden="true">
            <i v-for="index in 7" :key="index" :style="{'--bar-index': index}" />
          </div>
          <small>REAL-TIME HEURISTICS ENGINE v9.1.2</small>
        </div>
      </section>
    </main>

    <aside class="agent-cine__console">
      <header class="agent-cine__console-header">
        <div>
          <strong>TRANSMISSION LOG</strong>
          <span>{{ selectedAgentLabel }} / {{ sessionLabel }}</span>
        </div>
      </header>

      <div ref="messagesContainer" class="agent-cine__messages">
        <article
          v-for="(message, index) in messages"
          :key="index"
          class="agent-cine__message"
          :class="`agent-cine__message--${message.role}`"
        >
          <span>{{ message.role === 'assistant' ? 'DRAX' : 'USER' }}</span>
          <p>{{ message.content }}</p>
        </article>

        <article v-if="loading" class="agent-cine__message agent-cine__message--assistant">
          <span>DRAX</span>
          <p>Procesando...</p>
        </article>
      </div>
    </aside>

    <footer class="agent-cine__voice-bar">
      <div class="agent-cine__voice-shell">
        <div class="agent-cine__voice-control">
          <button
            class="agent-cine__mic"
            type="button"
            :disabled="!speechSupported || loading || textToSpeechSpeaking"
            :aria-pressed="speechPressToTalkActive || speechEnabled"
            :title="speechSupported ? 'Mantener presionado para hablar' : 'Microfono no disponible'"
            @pointerdown.prevent="startHoldToTalk"
            @pointerup.prevent="stopHoldToTalk"
            @pointercancel.prevent="stopHoldToTalk"
            @lostpointercapture="stopHoldToTalk"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
              <path d="M19 11a7 7 0 0 1-14 0" />
              <path d="M12 18v4" />
              <path d="M8 22h8" />
            </svg>
            <span class="agent-cine__sr-only">Microfono</span>
          </button>
        </div>

        <form class="agent-cine__composer" @submit.prevent="sendMessage">
          <textarea
            v-model="input"
            rows="1"
            :disabled="loading"
            placeholder="Transmitir instruccion a Agent..."
            @keydown.enter.exact.prevent="sendMessage"
          />
          <button type="submit" :disabled="!canSend">{{ loading ? '...' : 'SEND' }}</button>
        </form>

        <div class="agent-cine__voice-tools">
          <button
            v-if="speechSupported"
            type="button"
            :disabled="loading || textToSpeechSpeaking"
            :title="speechEnabled ? 'Apagar escucha continua' : 'Prender escucha continua'"
            @click="toggleSpeechRecognition"
          >
            {{ speechEnabled ? 'MIC OFF' : 'LIVE MIC' }}
          </button>
          <button
            v-if="speechSupported"
            type="button"
            :title="speechAutoSendLabel"
            @click="toggleSpeechAutoSend"
          >
            {{ speechAutoSendEnabled ? 'AUTO' : 'MANUAL' }}
          </button>
          <button
            v-if="textToSpeechSpeaking"
            type="button"
            @click="stopTextToSpeech"
          >
            MUTE
          </button>
        </div>
      </div>
    </footer>
  </section>
</template>

<style scoped>
.agent-cine {
  --background: #080a0f;
  --surface: rgba(13, 18, 28, 0.45);
  --surface-strong: rgba(18, 24, 34, 0.82);
  --surface-low: #0a0e14;
  --surface-high: #1c222d;
  --cyan: #00f2ff;
  --cyan-dim: #00dbe7;
  --cyan-soft: #74f5ff;
  --violet: #ebb2ff;
  --text: #e1e2e7;
  --muted: #b0c0cf;
  --outline: #2a3441;
  --voice-bar-height: 94px;
  --console-height: 154px;
  --console-gap: 12px;
  --center-dock-width: clamp(520px, 44vw, 760px);
  position: relative;
  height: 100vh;
  min-height: 720px;
  overflow: hidden;
  color: var(--text);
  background:
    linear-gradient(rgba(0, 242, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 242, 255, 0.04) 1px, transparent 1px),
    radial-gradient(circle at 50% 35%, rgba(0, 242, 255, 0.11), transparent 36%),
    var(--background);
  background-size: 40px 40px, 40px 40px, 100% 100%, auto;
  font-family: Geist, Inter, system-ui, sans-serif;
  isolation: isolate;
}

.agent-cine,
.agent-cine * {
  box-sizing: border-box;
}

.agent-cine button,
.agent-cine select,
.agent-cine textarea {
  font: inherit;
}

.agent-cine__particles {
  position: absolute;
  inset: 0;
  z-index: -1;
  opacity: 0.3;
  pointer-events: none;
}

.agent-cine__main {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) minmax(360px, 2fr) minmax(220px, 1fr);
  gap: 24px;
  height: calc(100% - var(--voice-bar-height) - var(--console-height) - var(--console-gap));
  padding: 76px 40px 20px;
}

.agent-cine__top-actions {
  position: absolute;
  top: 24px;
  right: 40px;
  z-index: 10;
  display: flex;
  max-width: calc(100% - 80px);
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
}

.agent-cine__top-actions select {
  max-width: min(260px, 38vw);
}

.agent-cine__tts-provider {
  position: relative;
}

.agent-cine__tts-provider-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  z-index: 20;
  display: flex;
  width: min(320px, calc(100vw - 32px));
  max-height: 320px;
  overflow-y: auto;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(8, 10, 15, 0.96);
  border: 1px solid rgba(0, 242, 255, 0.22);
  border-radius: 8px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.42), 0 0 24px rgba(0, 242, 255, 0.12);
  backdrop-filter: blur(16px);
}

.agent-cine__tts-provider-menu > span {
  padding: 4px 8px 6px;
  color: rgba(225, 226, 231, 0.42);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 9px;
  letter-spacing: 0.12em;
}

.agent-cine__tts-provider-menu button {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 6px;
  text-align: left;
}

.agent-cine__tts-provider-menu button[aria-checked="true"] {
  color: var(--cyan);
  background: rgba(0, 242, 255, 0.08);
  border-color: rgba(0, 242, 255, 0.42);
}

.agent-cine__tts-provider-menu i {
  color: var(--cyan);
  font-style: normal;
}

.agent-cine__tts-provider-menu strong {
  overflow: hidden;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10px;
  font-weight: 600;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.agent-cine__new-session {
  color: var(--background) !important;
  background: var(--cyan) !important;
  border-color: var(--cyan) !important;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 800;
  box-shadow: 0 0 18px rgba(0, 242, 255, 0.22);
}

.agent-cine__wing {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 24px;
}

.agent-cine__panel,
.agent-cine__console,
.agent-cine__voice-shell {
  position: relative;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid rgba(0, 242, 255, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(16px);
}

.agent-cine__panel::after,
.agent-cine__console::after,
.agent-cine__voice-shell::after {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 1px;
  content: '';
  background: linear-gradient(90deg, transparent, rgba(0, 242, 255, 0.45), transparent);
}

.agent-cine__panel {
  padding: 20px;
}

.agent-cine h3,
.agent-cine__panel-header h3,
.agent-cine__console strong,
.agent-cine__voice-control strong {
  margin: 0;
  font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.agent-cine__panel h3 {
  color: var(--muted);
}

.agent-cine__panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}

.agent-cine__panel-header span {
  color: var(--cyan-dim);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10px;
}

.agent-cine__metric {
  margin-top: 16px;
}

.agent-cine__metric div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 5px;
  color: rgba(225, 226, 231, 0.42);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10px;
}

.agent-cine__metric strong {
  color: rgba(225, 226, 231, 0.68);
}

.agent-cine__metric::after {
  display: block;
  height: 4px;
  overflow: hidden;
  content: '';
  background: var(--surface-low);
  border-radius: 999px;
}

.agent-cine__metric i {
  display: block;
  height: 4px;
  margin-top: -4px;
  background: var(--cyan);
  border-radius: 999px;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.25);
  transform-origin: left;
  animation: neural-fluctuate 4s ease-in-out infinite;
}

.agent-cine__metric--violet i {
  background: var(--violet);
  box-shadow: 0 0 10px rgba(235, 178, 255, 0.4);
  animation-delay: 0.5s;
}

.agent-cine__metric--soft i {
  background: var(--cyan-soft);
  animation-delay: 1s;
}

.agent-cine__panel--memory {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.agent-cine__memory-core {
  position: relative;
  display: grid;
  flex: 1;
  min-height: 190px;
  place-items: center;
}

.agent-cine__ring {
  position: absolute;
  border: 1px solid rgba(0, 242, 255, 0.28);
  border-radius: 999px;
}

.agent-cine__ring--one {
  width: 160px;
  height: 160px;
  animation: rotate-slow 15s linear infinite;
}

.agent-cine__ring--two {
  width: 126px;
  height: 126px;
  border-color: rgba(235, 178, 255, 0.3);
  animation: rotate-slow 10s linear infinite reverse;
}

.agent-cine__ring--three {
  width: 94px;
  height: 94px;
  border-color: rgba(255, 255, 255, 0.14);
}

.agent-cine__memory-core div,
.agent-cine__micro-grid div {
  position: relative;
  z-index: 1;
  text-align: center;
}

.agent-cine__memory-core strong {
  display: block;
  color: var(--cyan-dim);
  font-family: Sora, Inter, system-ui, sans-serif;
  font-size: 24px;
  font-weight: 700;
}

.agent-cine__memory-core span,
.agent-cine__micro-grid span,
.agent-cine__micro-grid strong {
  display: block;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.1em;
}

.agent-cine__memory-core span,
.agent-cine__micro-grid span {
  color: rgba(225, 226, 231, 0.42);
}

.agent-cine__micro-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.agent-cine__micro-grid div {
  padding: 10px;
  background: rgba(28, 34, 45, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.agent-cine__micro-grid strong {
  margin-top: 4px;
  color: var(--cyan-soft);
}

.agent-cine__panel--tools {
  height: 192px;
}

.agent-cine__tool-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.agent-cine__tool {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-width: 0;
  padding: 10px;
  color: var(--muted);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease;
}

.agent-cine__tool:hover {
  background: rgba(0, 242, 255, 0.05);
  border-color: rgba(0, 242, 255, 0.2);
}

.agent-cine__tool span {
  color: var(--cyan);
  animation: tool-pulse 3s ease-in-out infinite;
}

.agent-cine__tool strong {
  overflow: hidden;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-cine__core-panel {
  position: relative;
  display: flex;
  min-width: 0;
  align-items: center;
  justify-content: center;
}

.agent-cine__hud,
.agent-cine__ghost,
.agent-cine__aura,
.agent-cine__orbital {
  position: absolute;
}

.agent-cine__hud {
  inset: 0;
  display: grid;
  place-items: center;
}

.agent-cine__hud-ring {
  position: absolute;
  border-radius: 999px;
}

.agent-cine__hud-ring--one {
  width: min(500px, 82%);
  aspect-ratio: 1;
  border: 1px dashed rgba(0, 242, 255, 0.2);
  animation: rotate-slow 20s linear infinite;
}

.agent-cine__hud-ring--two {
  width: min(450px, 74%);
  aspect-ratio: 1;
  border: 3px double rgba(0, 219, 231, 0.24);
  opacity: 0.35;
  animation: rotate-slow 30s linear infinite reverse;
}

.agent-cine__hud-glow {
  width: min(600px, 92%);
  aspect-ratio: 1;
  background: rgba(0, 242, 255, 0.05);
  border-radius: 999px;
  filter: blur(120px);
  opacity: 0.45;
  animation: pulse-glow 4s ease-in-out infinite;
}

.agent-cine__ghost {
  display: grid;
  width: 320px;
  height: 320px;
  place-items: center;
  animation: core-breathing 5s ease-in-out infinite;
}

.agent-cine__aura {
  border-radius: 999px;
}

.agent-cine__aura--cyan {
  width: 140%;
  height: 140%;
  background: radial-gradient(circle at center, rgba(0, 242, 255, 0.25), transparent 70%);
  filter: blur(40px);
  animation: liquid-blob 10s linear infinite alternate;
}

.agent-cine__aura--violet {
  width: 120%;
  height: 120%;
  background: radial-gradient(circle at center, rgba(235, 178, 255, 0.2), transparent 70%);
  filter: blur(50px);
  animation: liquid-blob 8s linear infinite reverse;
}

.agent-cine__ghost-core {
  position: relative;
  display: flex;
  width: 192px;
  height: 192px;
  align-items: center;
  justify-content: center;
  gap: 64px;
  margin-top: -5px;
  background: radial-gradient(circle at center, rgba(225, 253, 255, 0.95), rgba(0, 219, 231, 0.7) 40%, rgba(0, 105, 111, 0.2) 80%, transparent);
  border-radius: 999px;
  box-shadow: 0 0 80px rgba(0, 242, 255, 0.6), inset 0 0 40px rgba(255, 255, 255, 0.3);
  filter: blur(25px);
  animation: liquid-blob 12s ease-in-out infinite, speaking-vibe 2s ease-in-out infinite;
}

.agent-cine__eye {
  width: 6px;
  height: 6px;
  background: #fff;
  border-radius: 999px;
  box-shadow: 0 0 20px var(--cyan), 0 0 40px var(--cyan);
  opacity: 0.9;
}

.agent-cine__orbital {
  width: 320px;
  height: 320px;
  animation: rotate-slow 25s linear infinite;
}

.agent-cine__particle {
  position: absolute;
  z-index: 2;
  background: var(--cyan);
  border-radius: 999px;
  animation: floating-particles 5s ease-in-out infinite;
}

.agent-cine__particle--one {
  top: 12%;
  left: 26%;
  width: 4px;
  height: 4px;
}

.agent-cine__particle--two {
  top: 62%;
  left: 72%;
  width: 6px;
  height: 6px;
  background: var(--violet);
  animation-duration: 7s;
  animation-delay: 1s;
}

.agent-cine__particle--three {
  top: 42%;
  left: 4%;
  width: 4px;
  height: 4px;
  background: white;
  animation-duration: 4s;
  animation-delay: 2s;
}

.agent-cine__particle--four {
  top: 82%;
  left: 38%;
  width: 8px;
  height: 8px;
  opacity: 0.4;
  animation-duration: 8s;
  animation-delay: 0.5s;
}

.agent-cine__status-chip {
  position: absolute;
  bottom: 70px;
  display: flex;
  max-width: min(100%, 420px);
  align-items: center;
  gap: 14px;
  padding: 10px 24px;
  background: rgba(8, 10, 15, 0.8);
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 999px;
  backdrop-filter: blur(10px);
}

.agent-cine__status-chip span {
  width: 8px;
  height: 8px;
  flex: 0 0 auto;
  background: var(--cyan);
  border-radius: 999px;
  animation: ping 1.4s ease-in-out infinite;
}

.agent-cine__status-chip strong {
  overflow: hidden;
  color: var(--cyan-dim);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 12px;
  letter-spacing: 0.14em;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.agent-cine__caption {
  position: absolute;
  right: 28px;
  bottom: 34px;
  left: 28px;
  display: -webkit-box;
  min-height: 18px;
  margin: 0;
  overflow: hidden;
  color: rgba(225, 226, 231, 0.48);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 10px;
  font-style: italic;
  line-height: 1.4;
  text-align: center;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.agent-cine__panel--radar {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.agent-cine__radar {
  position: relative;
  display: grid;
  height: 192px;
  overflow: hidden;
  place-items: center;
}

.agent-cine__radar svg {
  width: 160px;
  height: 160px;
}

.agent-cine__radar polygon:last-child {
  animation: radar-pulse 3s ease-in-out infinite;
}

.agent-cine__scanner {
  position: absolute;
  width: 200%;
  height: 200%;
  background: conic-gradient(from 0deg, transparent 0%, rgba(0, 242, 255, 0.12) 10%, transparent 20%);
  animation: sweep-scanner 4s linear infinite;
}

.agent-cine__radar > span:not(.agent-cine__scanner) {
  position: absolute;
  color: rgba(225, 226, 231, 0.5);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 8px;
}

.agent-cine__radar > span:nth-of-type(2) {
  top: 8px;
  left: 8px;
}

.agent-cine__radar > span:nth-of-type(3) {
  top: 8px;
  right: 8px;
}

.agent-cine__radar > span:nth-of-type(4) {
  bottom: 8px;
  left: 8px;
}

.agent-cine__radar > span:nth-of-type(5) {
  right: 8px;
  bottom: 8px;
}

.agent-cine__panel--tasks {
  flex: 1;
  min-height: 0;
}

.agent-cine__tasks {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.agent-cine__task {
  position: relative;
  min-height: 72px;
  padding: 10px 12px 10px 16px;
  overflow: hidden;
  background: rgba(5, 7, 10, 0.32);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-left: 2px solid rgba(0, 242, 255, 0.45);
  border-radius: 4px;
}

.agent-cine__task::before {
  position: absolute;
  top: 14px;
  left: -5px;
  width: 9px;
  height: 9px;
  border-radius: 999px;
  content: '';
  background: var(--cyan);
  box-shadow: 0 0 14px rgba(0, 242, 255, 0.5);
}

.agent-cine__task strong,
.agent-cine__task span,
.agent-cine__task small,
.agent-cine__tasks-state {
  display: block;
  font-family: "JetBrains Mono", ui-monospace, monospace;
}

.agent-cine__task strong {
  display: -webkit-box;
  margin-top: 5px;
  overflow: hidden;
  color: var(--cyan-soft);
  font-size: 11px;
  font-weight: 700;
  line-height: 1.3;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.agent-cine__task span,
.agent-cine__task small {
  color: rgba(225, 226, 231, 0.4);
  font-size: 9px;
  line-height: 1.4;
}

.agent-cine__task small {
  margin-top: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-cine__tasks-state {
  min-height: 72px;
  margin: 0;
  padding: 14px;
  color: rgba(225, 226, 231, 0.48);
  background: rgba(5, 7, 10, 0.28);
  border: 1px dashed rgba(255, 255, 255, 0.08);
  border-radius: 4px;
  font-size: 10px;
  line-height: 1.5;
}

.agent-cine__panel--matrix {
  height: 192px;
}

.agent-cine__bars {
  display: flex;
  height: 96px;
  align-items: end;
  gap: 4px;
  padding: 10px;
  background: rgba(5, 7, 10, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.agent-cine__bars i {
  width: 100%;
  height: calc((var(--bar-index) * 11%));
  min-height: 24px;
  background: rgba(0, 219, 231, 0.46);
  border-radius: 4px 4px 0 0;
  transform-origin: bottom;
  animation: bar-fluctuate calc(1.7s + (var(--bar-index) * 0.12s)) ease-in-out infinite;
}

.agent-cine__bars i:nth-child(3),
.agent-cine__bars i:nth-child(6) {
  background: rgba(0, 242, 255, 0.68);
}

.agent-cine__bars i:nth-child(5) {
  background: rgba(235, 178, 255, 0.46);
}

.agent-cine__panel--matrix small {
  display: block;
  margin-top: 10px;
  color: rgba(225, 226, 231, 0.32);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 9px;
}

.agent-cine__console {
  position: absolute;
  right: 50%;
  bottom: var(--voice-bar-height);
  left: auto;
  z-index: 4;
  width: var(--center-dock-width);
  height: var(--console-height);
  padding: 14px 18px;
  background: rgba(13, 18, 28, 0.24);
  border-color: rgba(0, 242, 255, 0.07);
  transform: translateX(50%);
}

.agent-cine__console-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 10px;
}

.agent-cine__console-header > div:first-child {
  min-width: 0;
}

.agent-cine__console-header strong,
.agent-cine__voice-control strong,
.agent-cine__voice-tools strong {
  display: block;
  color: var(--cyan);
}

.agent-cine__console-header span,
.agent-cine__voice-control span,
.agent-cine__voice-tools span {
  display: block;
  overflow: hidden;
  color: rgba(225, 226, 231, 0.42);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 9px;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
}

.agent-cine__voice-tools {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
}

.agent-cine button,
.agent-cine select {
  min-height: 32px;
  color: var(--text);
  background: rgba(5, 7, 10, 0.55);
  border: 1px solid rgba(0, 242, 255, 0.16);
  border-radius: 999px;
}

.agent-cine button {
  padding: 0 12px;
  cursor: pointer;
  transition: border-color 160ms ease, color 160ms ease, transform 160ms ease;
}

.agent-cine button:hover:not(:disabled) {
  color: var(--cyan);
  border-color: rgba(0, 242, 255, 0.42);
}

.agent-cine button:active:not(:disabled) {
  transform: scale(0.96);
}

.agent-cine button:disabled,
.agent-cine select:disabled,
.agent-cine textarea:disabled {
  cursor: default;
  opacity: 0.5;
}

.agent-cine select {
  max-width: 210px;
  padding: 0 28px 0 12px;
  color: var(--muted);
}

.agent-cine__messages {
  display: flex;
  height: 86px;
  flex-direction: column;
  gap: 8px;
  overflow-y: auto;
  padding-right: 8px;
  scrollbar-color: rgba(0, 242, 255, 0.25) rgba(255, 255, 255, 0.03);
  scrollbar-width: thin;
}

.agent-cine__message {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  gap: 10px;
  margin: 0;
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
}

.agent-cine__message span {
  color: var(--cyan-dim);
}

.agent-cine__message--user span {
  color: var(--violet);
}

.agent-cine__message p {
  display: -webkit-box;
  margin: 0;
  overflow: hidden;
  color: rgba(225, 226, 231, 0.78);
  line-height: 1.45;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.agent-cine__voice-bar {
  position: absolute;
  right: 50%;
  bottom: 0;
  left: auto;
  z-index: 5;
  width: var(--center-dock-width);
  height: var(--voice-bar-height);
  padding: 0;
  transform: translateX(50%);
}

.agent-cine__voice-shell {
  display: grid;
  grid-template-columns: auto minmax(260px, 1fr) auto;
  align-items: center;
  gap: 12px;
  min-height: 70px;
  height: 100%;
  padding: 12px 24px;
  border-radius: 28px 28px 0 0;
  box-shadow: 0 -10px 40px rgba(0, 105, 111, 0.2);
}

.agent-cine__voice-control {
  display: flex;
  align-items: center;
  min-width: 0;
  padding-right: 12px;
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.agent-cine__mic {
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  padding: 0;
  color: var(--background);
  background: var(--cyan) !important;
  border: 0 !important;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.35);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 800;
}

.agent-cine__mic svg {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2;
}

.agent-cine__mic[aria-pressed="true"] {
  animation: tool-pulse 1s ease-in-out infinite;
}

.agent-cine__sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.agent-cine__composer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
}

.agent-cine__composer textarea {
  width: 100%;
  min-height: 42px;
  max-height: 90px;
  resize: none;
  padding: 11px 14px;
  color: var(--text);
  background: rgba(5, 7, 10, 0.45);
  border: 1px solid rgba(0, 242, 255, 0.16);
  border-radius: 999px;
  outline: 0;
}

.agent-cine__composer textarea:focus {
  border-color: rgba(0, 242, 255, 0.48);
  box-shadow: 0 0 0 3px rgba(0, 242, 255, 0.08);
}

.agent-cine__composer button {
  color: var(--background);
  background: var(--cyan);
  border-color: var(--cyan);
  font-family: "JetBrains Mono", ui-monospace, monospace;
  font-size: 11px;
  font-weight: 800;
}

.agent-cine__voice-tools {
  justify-content: flex-end;
  min-width: 0;
  padding-left: 16px;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
}

.agent-cine--loading .agent-cine__ghost-core,
.agent-cine--speaking .agent-cine__ghost-core,
.agent-cine--listening .agent-cine__ghost-core {
  animation-duration: 7s, 1.1s;
}

.agent-cine--error .agent-cine__status-chip {
  border-color: rgba(255, 180, 171, 0.45);
}

.agent-cine--error .agent-cine__status-chip span {
  background: #ffb4ab;
}

@keyframes pulse-glow {
  0%,
  100% {
    opacity: 0.3;
    transform: scale(1);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.05);
  }
}

@keyframes rotate-slow {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bar-fluctuate {
  0%,
  100% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(1.15);
  }
}

@keyframes radar-pulse {
  0%,
  100% {
    opacity: 0.2;
    transform: scale(1);
  }

  50% {
    opacity: 0.6;
    transform: scale(1.02);
  }
}

@keyframes sweep-scanner {
  to {
    transform: rotate(360deg);
  }
}

@keyframes floating-particles {
  0%,
  100% {
    transform: translate(0, 0);
  }

  33% {
    transform: translate(10px, -20px);
  }

  66% {
    transform: translate(-15px, 10px);
  }
}

@keyframes core-breathing {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }

  50% {
    opacity: 1;
    transform: scale(1.08);
  }
}

@keyframes liquid-blob {
  0%,
  100% {
    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
  }

  50% {
    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
  }
}

@keyframes speaking-vibe {
  0%,
  100% {
    filter: blur(30px) brightness(1);
  }

  50% {
    filter: blur(20px) brightness(1.4);
  }
}

@keyframes neural-fluctuate {
  0%,
  100% {
    filter: brightness(1);
    transform: scaleX(1);
  }

  50% {
    filter: brightness(1.25);
    transform: scaleX(0.92);
  }
}

@keyframes dot-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.72;
    transform: scale(1.24);
  }
}

@keyframes tool-pulse {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.82;
    transform: scale(1.05);
  }
}

@keyframes ping {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }

  50% {
    opacity: 0.3;
    transform: scale(1.6);
  }
}

@media (max-width: 1180px) {
  .agent-cine {
    --voice-bar-height: 214px;
    --console-height: 180px;
    --center-dock-width: min(760px, calc(100vw - 48px));
    height: 100vh;
    min-height: 760px;
    overflow: hidden;
  }

  .agent-cine__main {
    grid-template-columns: minmax(0, 1fr);
    height: calc(100% - var(--voice-bar-height) - var(--console-height) - var(--console-gap));
    padding: 80px 24px 24px;
  }

  .agent-cine__top-actions {
    top: 20px;
    right: 24px;
    max-width: calc(100% - 48px);
    flex-wrap: wrap;
  }

  .agent-cine__wing {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .agent-cine__core-panel {
    min-height: 460px;
    order: -1;
  }

  .agent-cine__panel--memory,
  .agent-cine__panel--tasks {
    min-height: 240px;
  }

  .agent-cine__console {
    height: var(--console-height);
  }

  .agent-cine__voice-bar {
    position: absolute;
  }

  .agent-cine__voice-shell {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
    border-radius: 20px 20px 0 0;
  }

  .agent-cine__voice-control,
  .agent-cine__voice-tools {
    min-width: 0;
    padding: 0;
    border: 0;
  }
}

@media (max-width: 760px) {
  .agent-cine {
    --voice-bar-height: 276px;
    --console-height: 220px;
    --center-dock-width: calc(100vw - 32px);
    min-height: 860px;
  }

  .agent-cine__main {
    padding: 118px 16px 16px;
  }

  .agent-cine__top-actions {
    top: 14px;
    right: 16px;
    left: 16px;
    max-width: none;
  }

  .agent-cine__top-actions select {
    max-width: 100%;
    flex: 1 1 100%;
  }

  .agent-cine__wing {
    grid-template-columns: minmax(0, 1fr);
  }

  .agent-cine__core-panel {
    min-height: 300px;
  }

  .agent-cine__ghost {
    width: 260px;
    height: 260px;
  }

  .agent-cine__ghost-core {
    width: 156px;
    height: 156px;
  }

  .agent-cine__orbital {
    width: 260px;
    height: 260px;
  }

  .agent-cine__status-chip {
    bottom: 52px;
    max-width: calc(100% - 24px);
    padding: 9px 14px;
  }

  .agent-cine__status-chip strong {
    font-size: 10px;
  }

  .agent-cine__console {
    height: var(--console-height);
  }

  .agent-cine__console-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .agent-cine__voice-tools {
    flex-wrap: wrap;
  }

  .agent-cine__messages {
    height: 120px;
  }

  .agent-cine__voice-bar {
    padding: 0;
  }

  .agent-cine__voice-shell {
    padding: 14px;
  }

  .agent-cine__voice-control {
    min-width: 0;
  }

  .agent-cine__composer {
    grid-template-columns: minmax(0, 1fr);
  }

  .agent-cine__composer button {
    width: 100%;
  }
}
</style>
