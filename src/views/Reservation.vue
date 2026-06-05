<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { timeSlots, venues as venueList } from '../mock/venues'
import { useBookingStore } from '../stores/booking'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()
const formRef = ref()
const loading = ref(false)
const latestTicket = ref(null)

const venueThemes = {
  'palace-museum': {
    name: '宫城朱金',
    accent: '#c84f3d',
    accentSoft: 'rgba(200, 79, 61, 0.26)',
    glow: 'rgba(215, 180, 106, 0.2)',
    surface: '#1c1010'
  },
  'national-museum': {
    name: '通史青铜',
    accent: '#79b5a8',
    accentSoft: 'rgba(121, 181, 168, 0.26)',
    glow: 'rgba(149, 191, 164, 0.18)',
    surface: '#0d1917'
  },
  'temple-of-heaven': {
    name: '天坛蓝白',
    accent: '#8ec5ff',
    accentSoft: 'rgba(142, 197, 255, 0.24)',
    glow: 'rgba(158, 216, 223, 0.18)',
    surface: '#0c1724'
  },
  'summer-palace': {
    name: '园林山水',
    accent: '#a8c487',
    accentSoft: 'rgba(168, 196, 135, 0.24)',
    glow: 'rgba(149, 191, 164, 0.18)',
    surface: '#11180f'
  },
  'capital-museum': {
    name: '京城记忆',
    accent: '#d7a06e',
    accentSoft: 'rgba(215, 160, 110, 0.24)',
    glow: 'rgba(215, 154, 141, 0.16)',
    surface: '#1a130f'
  },
  'grand-canal-museum': {
    name: '运河水脉',
    accent: '#68c8d8',
    accentSoft: 'rgba(104, 200, 216, 0.24)',
    glow: 'rgba(104, 200, 216, 0.16)',
    surface: '#0c1820'
  },
  namoc: {
    name: '艺术展厅',
    accent: '#d69bbf',
    accentSoft: 'rgba(214, 155, 191, 0.24)',
    glow: 'rgba(214, 155, 191, 0.16)',
    surface: '#1a1118'
  },
  'shichahai-hutong': {
    name: '胡同夜游',
    accent: '#d7a06e',
    accentSoft: 'rgba(215, 160, 110, 0.24)',
    glow: 'rgba(104, 200, 216, 0.14)',
    surface: '#17130f'
  }
}

const form = reactive({
  venueId: route.params.venueId || venueList[0]?.id || '',
  visitor: '',
  phone: '',
  date: new Date(),
  slot: timeSlots[0],
  count: 1
})

const selectedVenue = computed(() => venueList.find((venue) => venue.id === form.venueId))
const activeTheme = computed(() => venueThemes[selectedVenue.value?.id] || venueThemes['temple-of-heaven'])
const pageThemeStyle = computed(() => ({
  '--reservation-accent': activeTheme.value.accent,
  '--reservation-accent-soft': activeTheme.value.accentSoft,
  '--reservation-glow': activeTheme.value.glow,
  '--reservation-surface': activeTheme.value.surface
}))
const crowdLevel = computed(() => {
  const crowd = selectedVenue.value?.crowd || 0
  if (crowd >= 80) return '高峰'
  if (crowd >= 65) return '适中'
  return '舒适'
})
const routeHints = computed(() => [
  { label: '开放时间', value: selectedVenue.value?.openTime || '--' },
  { label: '预约余量', value: selectedVenue.value ? selectedVenue.value.remaining.toLocaleString('zh-CN') : '--' },
  { label: '客流状态', value: `${crowdLevel.value} · ${selectedVenue.value?.crowd || 0}%` }
])
const planningSteps = computed(() => [
  {
    title: '预约判断',
    text: selectedVenue.value?.crowd >= 75 ? '当前热度偏高，建议选择早场或错峰时段。' : '当前客流较稳，可按个人行程优先选择时段。'
  },
  {
    title: '到达准备',
    text: selectedVenue.value?.tags?.includes('需提前预约') ? '请提前准备身份证件，并确认预约入口和安检时间。' : '建议预留交通缓冲，减少临近时段排队压力。'
  },
  {
    title: '参观节奏',
    text: selectedVenue.value?.tags?.slice(0, 2).join(' / ') || '按重点区域分段参观，保留休息时间。'
  }
])

const rules = {
  venueId: [{ required: true, message: '请选择场馆', trigger: 'change' }],
  visitor: [{ required: true, min: 2, message: '请输入参观人姓名', trigger: 'blur' }],
  phone: [{ required: true, pattern: /^1[3-9]\d{9}$/, message: '请输入有效手机号', trigger: 'blur' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  slot: [{ required: true, message: '请选择时段', trigger: 'change' }]
}

watch(() => route.params.venueId, (id) => {
  if (id) form.venueId = id
}, { immediate: true })

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    const record = await booking.createReservation({
      ...form,
      date: form.date.toLocaleDateString('zh-CN')
    })
    latestTicket.value = record
    ElMessage.success('预约成功，电子门票已生成')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="reservation-page" :style="pageThemeStyle">
    <section class="reservation-hero">
      <div>
        <p class="cosmic-label">Reservation Plan</p>
        <h1>北京文旅预约方案</h1>
        <p>根据时间、兴趣、人数和出行方式，推荐合适的文化场馆预约方案，并提示开放时间、游览时长、预约注意事项与客流高峰。</p>
      </div>

      <aside class="reservation-signal">
        <span>{{ activeTheme.name }}</span>
        <strong>{{ selectedVenue?.name || '北京景点' }}</strong>
        <p>{{ selectedVenue?.area || '北京文旅场景' }} · {{ selectedVenue?.type || '文化场馆' }}</p>
      </aside>
    </section>

    <section class="reservation-layout">
      <div class="reservation-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
          <el-form-item label="推荐场馆 / 景点" prop="venueId">
            <el-select v-model="form.venueId" size="large" style="width: 100%">
              <el-option v-for="venue in venueList" :key="venue.id" :label="venue.name" :value="venue.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="出行人" prop="visitor">
            <el-input v-model="form.visitor" size="large" placeholder="请输入姓名" />
          </el-form-item>
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="form.phone" size="large" placeholder="用于接收预约通知" />
          </el-form-item>
          <div class="form-two">
            <el-form-item label="参观日期" prop="date">
              <el-date-picker v-model="form.date" type="date" size="large" style="width: 100%" />
            </el-form-item>
            <el-form-item label="人数" prop="count">
              <el-input-number v-model="form.count" :min="1" :max="6" size="large" style="width: 100%" />
            </el-form-item>
          </div>
          <el-form-item label="建议预约时段" prop="slot">
            <el-radio-group v-model="form.slot">
              <el-radio-button v-for="slot in timeSlots" :key="slot" :label="slot" :value="slot" />
            </el-radio-group>
          </el-form-item>
          <button class="cosmic-button solid" type="submit" :disabled="loading">{{ loading ? '生成方案中...' : '生成预约方案' }}</button>
        </el-form>
      </div>

      <aside class="venue-preview" v-if="selectedVenue">
        <div class="venue-image-stage">
          <img :src="selectedVenue.image" :alt="selectedVenue.name" decoding="async" fetchpriority="high" />
        </div>

        <div class="venue-preview-copy">
          <span>{{ selectedVenue.type }}</span>
          <h2>{{ selectedVenue.name }}</h2>
          <p>{{ selectedVenue.intro }}</p>
          <div class="hint-grid">
            <article v-for="hint in routeHints" :key="hint.label">
              <strong>{{ hint.value }}</strong>
              <span>{{ hint.label }}</span>
            </article>
          </div>
          <div class="tag-row">
            <span v-for="tag in selectedVenue.tags" :key="tag">{{ tag }}</span>
          </div>
        </div>
      </aside>
    </section>

    <section class="planning-panel">
      <div>
        <p class="cosmic-label">Planning Rhythm</p>
        <h2>从选择场馆到完成入场的三步判断</h2>
      </div>
      <div class="planning-list">
        <article v-for="(step, index) in planningSteps" :key="step.title">
          <b>{{ index + 1 }}</b>
          <div>
            <strong>{{ step.title }}</strong>
            <p>{{ step.text }}</p>
          </div>
        </article>
      </div>
    </section>

    <section v-if="latestTicket" class="ticket-preview">
      <div>
        <span>预约方案已生成</span>
        <h2>{{ latestTicket.venueName }}</h2>
        <p>{{ latestTicket.date }} · {{ latestTicket.slot }} · {{ latestTicket.visitor }} · {{ latestTicket.id }}</p>
      </div>
      <button class="cosmic-button solid" @click="router.push('/tickets')">查看预约凭证</button>
    </section>
  </main>
</template>

<style scoped>
.reservation-page {
  --cosmic-bg: #0a0a0a;
  --cosmic-surface: #141414;
  --cosmic-text: #f5f5f5;
  --cosmic-muted: #8f8f8f;
  --cosmic-stroke: #202020;
  position: relative;
  width: min(1220px, calc(100% - 32px));
  margin: 0 auto;
  padding: 126px 0 78px;
  color: var(--cosmic-text);
  isolation: isolate;
}

.reservation-page::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    radial-gradient(circle at 26% 12%, var(--reservation-accent-soft), transparent 24rem),
    radial-gradient(circle at 86% 34%, var(--reservation-glow), transparent 22rem),
    linear-gradient(180deg, rgba(10, 10, 10, 0.42), rgba(10, 10, 10, 0.86));
}

.reservation-hero {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(260px, 330px);
  gap: 24px;
  align-items: stretch;
  margin-bottom: 26px;
}

.cosmic-label {
  margin: 0 0 18px;
  color: var(--cosmic-muted);
  font-size: 12px;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.reservation-hero h1 {
  margin: 0;
  font-family: "ZQKNBCGPST", serif;
  font-style: italic;
  font-size: clamp(42px, 6.2vw, 78px);
  font-weight: 400;
  line-height: 1.02;
  letter-spacing: 0;
}

.reservation-hero p:not(.cosmic-label) {
  width: min(620px, 100%);
  margin: 18px 0 0;
  color: var(--cosmic-muted);
  font-size: 15px;
  line-height: 1.72;
}

.reservation-signal {
  min-height: 188px;
  display: grid;
  align-content: end;
  gap: 10px;
  padding: 22px;
  border: 1px solid color-mix(in srgb, var(--reservation-accent) 36%, var(--cosmic-stroke));
  border-radius: 24px;
  background:
    radial-gradient(circle at 28% 12%, var(--reservation-accent-soft), transparent 16rem),
    linear-gradient(145deg, var(--reservation-surface), rgba(20, 20, 20, 0.78));
  box-shadow: 0 20px 56px rgba(0, 0, 0, 0.3), 0 0 24px var(--reservation-glow);
}

.reservation-signal span {
  color: var(--reservation-accent);
  font-size: 13px;
}

.reservation-signal strong {
  font-family: "ZQKNBCGPST", serif;
  font-size: clamp(26px, 3.2vw, 38px);
  font-style: italic;
  font-weight: 400;
  line-height: 1;
}

.reservation-signal p {
  margin: 0;
  color: var(--cosmic-muted);
  line-height: 1.6;
}

.reservation-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.98fr) minmax(340px, 0.72fr);
  gap: 20px;
  align-items: start;
}

.reservation-form {
  padding: 24px;
  border: 1px solid var(--cosmic-stroke);
  border-radius: 24px;
  background:
    radial-gradient(circle at 8% 0%, var(--reservation-glow), transparent 18rem),
    rgba(20, 20, 20, 0.72);
}

.reservation-form :deep(.el-form-item__label) {
  color: var(--cosmic-muted) !important;
}

.reservation-form :deep(.el-radio-button__inner) {
  border-color: var(--cosmic-stroke);
  background: rgba(255, 255, 255, 0.04);
  color: var(--cosmic-muted);
}

.reservation-form :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  border-color: var(--reservation-accent);
  background: var(--reservation-accent);
  color: #0a0a0a;
  box-shadow: -1px 0 0 0 var(--reservation-accent);
}

.form-two {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 16px;
}

.venue-preview {
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--reservation-accent) 34%, var(--cosmic-stroke));
  border-radius: 24px;
  background:
    radial-gradient(circle at 20% 12%, var(--reservation-accent-soft), transparent 18rem),
    linear-gradient(145deg, var(--reservation-surface), rgba(20, 20, 20, 0.78));
  box-shadow: 0 28px 78px rgba(0, 0, 0, 0.34), 0 0 34px var(--reservation-glow);
}

.venue-image-stage {
  min-height: 236px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-bottom: 1px solid color-mix(in srgb, var(--reservation-accent) 24%, var(--cosmic-stroke));
  background: rgba(10, 10, 10, 0.34);
}

.venue-image-stage img {
  width: 100%;
  height: 100%;
  max-height: 270px;
  display: block;
  object-fit: contain;
  padding: 14px;
}

.venue-preview-copy {
  padding: 22px;
}

.venue-preview-copy > span,
.ticket-preview > div > span {
  color: var(--reservation-accent);
  font-size: 14px;
}

.venue-preview h2,
.planning-panel h2,
.ticket-preview h2 {
  margin: 12px 0;
  font-family: "ZQKNBCGPST", serif;
  font-size: clamp(26px, 3.2vw, 38px);
  font-style: italic;
  font-weight: 400;
  line-height: 1;
}

.venue-preview p,
.planning-panel p,
.ticket-preview p {
  color: var(--cosmic-muted);
  line-height: 1.7;
}

.hint-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin: 18px 0 14px;
}

.hint-grid article {
  display: grid;
  align-content: center;
  gap: 6px;
  min-height: 76px;
  padding: 10px;
  border-top: 1px solid color-mix(in srgb, var(--reservation-accent) 34%, var(--cosmic-stroke));
  background: rgba(255, 255, 255, 0.035);
}

.hint-grid strong {
  color: var(--cosmic-text);
  font-size: 16px;
}

.hint-grid span,
.tag-row span {
  color: var(--cosmic-muted);
  font-size: 12px;
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-row span {
  padding: 7px 11px;
  border: 1px solid color-mix(in srgb, var(--reservation-accent) 28%, transparent);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.035);
}

.planning-panel {
  display: grid;
  grid-template-columns: minmax(260px, 0.72fr) minmax(0, 1fr);
  gap: 20px;
  margin-top: 24px;
  padding: 22px;
  border: 1px solid var(--cosmic-stroke);
  border-radius: 24px;
  background: rgba(20, 20, 20, 0.48);
}

.planning-list {
  display: grid;
  gap: 14px;
}

.planning-list article {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 14px;
  align-items: start;
  padding: 14px;
  border: 1px solid var(--cosmic-stroke);
  border-radius: 18px;
  background: rgba(10, 10, 10, 0.3);
}

.planning-list b {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--reservation-accent);
  color: #0a0a0a;
}

.planning-list strong {
  color: var(--cosmic-text);
}

.planning-list p {
  margin: 6px 0 0;
}

.cosmic-button {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 180ms ease, box-shadow 180ms ease, opacity 180ms ease;
}

.cosmic-button.solid {
  background: var(--cosmic-text);
  color: var(--cosmic-bg);
}

.cosmic-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.28), 0 0 24px var(--reservation-glow);
}

.cosmic-button:disabled {
  cursor: progress;
  opacity: 0.62;
  transform: none;
}

.ticket-preview {
  margin-top: 24px;
  padding: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border: 1px solid color-mix(in srgb, var(--reservation-accent) 34%, var(--cosmic-stroke));
  border-radius: 24px;
  background:
    radial-gradient(circle at 16% 0%, var(--reservation-glow), transparent 16rem),
    rgba(20, 20, 20, 0.72);
}

@media (max-width: 920px) {
  .reservation-page {
    width: min(100% - 20px, 1220px);
    padding-top: 146px;
  }

  .reservation-hero,
  .reservation-layout,
  .form-two,
  .planning-panel {
    grid-template-columns: 1fr;
  }

  .reservation-form,
  .venue-preview,
  .planning-panel,
  .ticket-preview {
    border-radius: 24px;
  }

  .hint-grid {
    grid-template-columns: 1fr;
  }

  .venue-image-stage {
    min-height: 260px;
  }

  .ticket-preview {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
