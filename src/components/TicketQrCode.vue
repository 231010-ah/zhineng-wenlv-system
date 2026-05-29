<script setup>
import { computed } from 'vue'
import { createQrMatrix } from '../utils/qrCode'

const props = defineProps({
  payload: {
    type: String,
    required: true
  },
  darkColor: {
    type: String,
    default: '#07111f'
  },
  accentColor: {
    type: String,
    default: '#1f5d9d'
  }
})

const quietZone = 4

const matrix = computed(() => createQrMatrix(props.payload))
const viewBoxSize = computed(() => matrix.value.length + quietZone * 2)
const darkModules = computed(() => matrix.value.flatMap((row, y) => row
  .map((dark, x) => (dark ? { x: x + quietZone, y: y + quietZone } : null))
  .filter(Boolean)))
</script>

<template>
  <div class="ticket-qr-code" :style="{ '--qr-dark': darkColor, '--qr-accent': accentColor }">
    <svg
      :viewBox="`0 0 ${viewBoxSize} ${viewBoxSize}`"
      role="img"
      aria-label="预约凭证核销二维码"
      shape-rendering="crispEdges"
    >
      <rect :width="viewBoxSize" :height="viewBoxSize" fill="#fff" />
      <rect
        v-for="module in darkModules"
        :key="`${module.x}-${module.y}`"
        :x="module.x"
        :y="module.y"
        width="1"
        height="1"
        fill="var(--qr-dark)"
      />
    </svg>
    <span class="qr-scan-line" aria-hidden="true"></span>
  </div>
</template>

<style scoped>
.ticket-qr-code {
  position: relative;
  display: block;
  padding: 8px;
  border: 1px solid rgba(7, 17, 31, 0.14);
  border-radius: 16px;
  background: #fff;
  box-shadow:
    0 18px 40px rgba(7, 17, 31, 0.14),
    inset 0 0 0 5px rgba(255, 255, 255, 0.96);
}

.ticket-qr-code::before,
.ticket-qr-code::after {
  content: "";
  position: absolute;
  width: 17px;
  height: 17px;
  pointer-events: none;
}

.ticket-qr-code::before {
  top: 5px;
  left: 5px;
  border-top: 2px solid var(--qr-accent);
  border-left: 2px solid var(--qr-accent);
}

.ticket-qr-code::after {
  right: 5px;
  bottom: 5px;
  border-right: 2px solid var(--qr-accent);
  border-bottom: 2px solid var(--qr-accent);
}

.ticket-qr-code svg {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 8px;
}

.qr-scan-line {
  position: absolute;
  right: 10px;
  bottom: 10px;
  left: 10px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--qr-accent), transparent);
  opacity: 0.42;
}
</style>
