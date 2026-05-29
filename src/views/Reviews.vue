<script setup>
import { onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getVenues } from '../api/tourism'
import { useAuthStore } from '../stores/auth'
import { useBookingStore } from '../stores/booking'

const auth = useAuthStore()
const booking = useBookingStore()
const venues = ref([])
const formRef = ref()
const form = reactive({ venueName: '', rating: 5, content: '' })

const rules = {
  venueName: [{ required: true, message: '请选择评价场馆', trigger: 'change' }],
  rating: [{ required: true, message: '请选择评分', trigger: 'change' }],
  content: [{ required: true, min: 6, message: '请填写至少 6 个字的评价', trigger: 'blur' }]
}

onMounted(async () => {
  venues.value = await getVenues()
  form.venueName = venues.value[0]?.name || ''
})

const submit = async () => {
  await formRef.value.validate()
  await booking.addReview({ ...form, user: auth.user?.name || '游客' })
  form.content = ''
  form.rating = 5
  ElMessage.success('评价已提交')
}
</script>

<template>
  <main class="page-shell">
    <section class="page-title">
      <span class="eyebrow">用户评价</span>
      <h1>北京文旅体验反馈</h1>
      <p>记录路线体验、预约难度、排队情况、讲解质量和亲子研学反馈，为后续兴趣推荐提供展示基础。</p>
    </section>

    <section class="review-layout">
      <div class="glass-panel review-form">
        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
          <el-form-item label="评价景点 / 场馆" prop="venueName">
            <el-select v-model="form.venueName" size="large" style="width: 100%">
              <el-option v-for="venue in venues" :key="venue.id" :label="venue.name" :value="venue.name" />
            </el-select>
          </el-form-item>
          <el-form-item label="评分" prop="rating">
            <el-rate v-model="form.rating" />
          </el-form-item>
          <el-form-item label="评价内容" prop="content">
            <el-input v-model="form.content" type="textarea" :rows="5" placeholder="写下北京文旅体验、排队情况或路线建议" />
          </el-form-item>
          <button class="liquid-button" type="submit">提交评价</button>
        </el-form>
      </div>

      <div class="review-list">
        <article v-for="review in booking.reviews" :key="review.id" class="glass-card review-card">
          <div>
            <strong>{{ review.user }}</strong>
            <el-rate :model-value="review.rating" disabled size="small" />
          </div>
          <h3>{{ review.venueName }}</h3>
          <p>{{ review.content }}</p>
          <span>{{ review.time }}</span>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
.review-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 22px;
}

.review-form {
  border-radius: 30px;
  padding: 28px;
  height: fit-content;
}

.review-list {
  display: grid;
  gap: 16px;
}

.review-card {
  padding: 22px;
}

.review-card > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.review-card h3 {
  margin: 12px 0 8px;
  font-size: 22px;
}

.review-card p,
.review-card span {
  color: var(--muted);
  line-height: 1.7;
}

@media (max-width: 860px) {
  .review-layout {
    grid-template-columns: 1fr;
  }
}
</style>
