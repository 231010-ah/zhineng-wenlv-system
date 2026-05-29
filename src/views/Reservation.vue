<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getVenues } from '../api/tourism'
import { timeSlots } from '../mock/venues'
import { useBookingStore } from '../stores/booking'

const route = useRoute()
const router = useRouter()
const booking = useBookingStore()
const formRef = ref()
const venues = ref([])
const loading = ref(false)
const latestTicket = ref(null)
const form = reactive({
  venueId: '',
  visitor: '',
  phone: '',
  date: new Date(),
  slot: timeSlots[0],
  count: 1
})

const selectedVenue = computed(() => venues.value.find((venue) => venue.id === form.venueId))

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

onMounted(async () => {
  venues.value = await getVenues()
  if (!form.venueId && venues.value[0]) form.venueId = venues.value[0].id
})

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
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">场馆预约建议</span>
      <h1>北京文旅预约方案</h1>
      <p>根据时间、兴趣、人数和出行方式，推荐合适的文化场馆预约方案，并提示开放时间、游览时长、预约注意事项与客流高峰。</p>
    </section>

    <section class="reservation-layout">
      <div class="glass-panel reservation-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
          <el-form-item label="推荐场馆 / 景点" prop="venueId">
            <el-select v-model="form.venueId" size="large" style="width: 100%">
              <el-option v-for="venue in venues" :key="venue.id" :label="venue.name" :value="venue.id" />
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
          <button class="liquid-button" type="submit" :disabled="loading">{{ loading ? '生成方案中...' : '生成预约方案' }}</button>
        </el-form>
      </div>

      <aside class="glass-card venue-preview" v-if="selectedVenue">
        <div class="image-frame">
          <img :src="selectedVenue.image" :alt="selectedVenue.name" />
        </div>
        <div>
          <span>{{ selectedVenue.type }}</span>
          <h2>{{ selectedVenue.name }}</h2>
          <p>{{ selectedVenue.intro }}</p>
          <strong>开放时间 {{ selectedVenue.openTime }} · 建议游览 2-4 小时 · {{ selectedVenue.crowd }}% 在馆率</strong>
        </div>
      </aside>
    </section>

    <section v-if="latestTicket" class="ticket-preview glass-panel">
      <div>
        <span class="glass-badge">预约方案已生成</span>
        <h2 class="serif-title">{{ latestTicket.venueName }}</h2>
        <p>{{ latestTicket.date }} · {{ latestTicket.slot }} · {{ latestTicket.visitor }} · {{ latestTicket.id }}</p>
      </div>
      <button class="liquid-button" @click="router.push('/tickets')">查看预约凭证</button>
    </section>
  </main>
</template>

<style scoped>
.reservation-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 420px;
  gap: 22px;
}

.reservation-form {
  border-radius: 30px;
  padding: 28px;
}

.form-two {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 16px;
}

.venue-preview .image-frame {
  width: 100%;
  height: 260px;
}

.venue-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.venue-preview > div:not(.image-frame) {
  padding: 24px;
}

.venue-preview span {
  color: var(--gold);
}

.venue-preview h2,
.ticket-preview h2 {
  margin: 12px 0;
  font-size: 30px;
}

.venue-preview p,
.ticket-preview p {
  color: var(--muted);
  line-height: 1.7;
}

.venue-preview strong {
  display: block;
  margin-top: 18px;
  color: var(--cyan);
}

.ticket-preview {
  margin-top: 22px;
  border-radius: 30px;
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

@media (max-width: 920px) {
  .reservation-layout,
  .form-two {
    grid-template-columns: 1fr;
  }

  .ticket-preview {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
