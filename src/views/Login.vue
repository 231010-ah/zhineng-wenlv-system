<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import { venues } from '../mock/venues'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const formRef = ref()
const form = reactive({ username: 'admin', password: '123456' })
const authVenues = venues.slice(0, 4)

const rules = {
  username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await auth.login(form)
    ElMessage.success('登录成功')
    router.push(route.query.redirect || '/')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page cosmic-login">
    <div class="auth-atmosphere" aria-hidden="true">
      <span class="auth-ring ring-one"></span>
      <span class="auth-ring ring-two"></span>
      <div class="auth-float-strip strip-top">
        <article v-for="venue in authVenues" :key="`top-${venue.id}`" class="auth-float-card">
          <img :src="venue.image" :alt="venue.name" />
          <span>{{ venue.name }}</span>
        </article>
      </div>
      <div class="auth-float-strip strip-bottom">
        <article v-for="venue in [...authVenues].reverse()" :key="`bottom-${venue.id}`" class="auth-float-card compact">
          <img :src="venue.image" :alt="venue.name" />
          <span>{{ venue.type }}</span>
        </article>
      </div>
    </div>

    <section class="auth-card">
      <div class="auth-copy">
        <span class="eyebrow">BEIJING CULTURE ACCESS</span>
        <h1 class="serif-title">回到你的北京文旅行程。</h1>
        <p class="muted-copy">登录后继续保存景点预约建议、兴趣推荐路线、预约凭证和体验评价。</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" size="large" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" size="large" show-password autocomplete="current-password" />
        </el-form-item>
        <button class="liquid-button auth-submit" type="submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录系统' }}
        </button>
      </el-form>
      <p class="auth-switch">还没有账户？<router-link to="/register">立即注册</router-link></p>
    </section>
  </main>
</template>

<style scoped>
.auth-page {
  --auth-bg: #0a0a0a;
  --auth-surface: rgba(20, 20, 20, 0.66);
  --auth-text: #f5f5f5;
  --auth-muted: rgba(245, 245, 245, 0.62);
  --auth-stroke: rgba(255, 255, 255, 0.1);
  --auth-gradient: linear-gradient(90deg, #89aacc 0%, #4e85bf 100%);
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 116px 24px 58px;
  overflow: hidden;
  isolation: isolate;
  color: var(--auth-text);
  background:
    radial-gradient(circle at 50% 42%, rgba(137, 170, 204, 0.22), transparent 22rem),
    radial-gradient(circle at 18% 18%, rgba(78, 133, 191, 0.22), transparent 20rem),
    radial-gradient(circle at 82% 70%, rgba(255, 255, 255, 0.1), transparent 18rem),
    linear-gradient(180deg, rgba(0, 0, 0, 0.1), #0a0a0a 88%);
  font-family: "ZQKNBCGPST", "PingFang SC", "Microsoft YaHei", sans-serif;
}

.auth-atmosphere {
  position: absolute;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
}

.auth-atmosphere::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.34;
  background-image: radial-gradient(circle, rgba(255, 255, 255, 0.55) 0 1px, transparent 1.5px);
  background-size: 44px 44px;
  mask-image: radial-gradient(circle at center, black, transparent 70%);
}

.auth-atmosphere::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 26% 18%, transparent 0 7.2rem, rgba(234, 244, 255, 0.16) 7.3rem 7.44rem, transparent 7.58rem),
    radial-gradient(circle at 78% 70%, transparent 0 9rem, rgba(78, 133, 191, 0.18) 9.1rem 9.28rem, transparent 9.44rem),
    linear-gradient(90deg, rgba(234, 244, 255, 0.045) 0 1px, transparent 1px 72px),
    linear-gradient(0deg, rgba(234, 244, 255, 0.032) 0 1px, transparent 1px 72px);
  opacity: 0.62;
}

.auth-ring {
  position: absolute;
  border: 1px solid rgba(234, 244, 255, 0.12);
  border-radius: 44% 56% 48% 52% / 52% 42% 58% 48%;
  backdrop-filter: blur(12px);
}

.ring-one {
  width: 23rem;
  height: 23rem;
  right: -8rem;
  top: 7rem;
}

.ring-two {
  width: 18rem;
  height: 18rem;
  left: -7rem;
  bottom: 8rem;
}

.auth-float-strip {
  position: absolute;
  display: flex;
  gap: 18px;
  width: max-content;
  opacity: 0.42;
  filter: saturate(0.96) brightness(0.88);
}

.strip-top {
  left: -6vw;
  top: 16%;
  transform: rotate(-6deg);
}

.strip-bottom {
  right: -12vw;
  bottom: 12%;
  transform: rotate(5deg);
}

.auth-float-card {
  width: clamp(170px, 20vw, 260px);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 28px;
  background: rgba(20, 20, 20, 0.76);
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.26);
}

.auth-float-card.compact {
  width: clamp(150px, 18vw, 220px);
}

.auth-float-card img {
  width: 100%;
  height: 116px;
  display: block;
  object-fit: cover;
}

.auth-float-card span {
  display: block;
  padding: 12px 14px;
  color: rgba(245, 245, 245, 0.78);
  font-size: 12px;
}

.auth-card {
  position: relative;
  width: min(520px, 100%);
  padding: 38px;
  overflow: hidden;
  border: 1px solid var(--auth-stroke);
  border-radius: 32px;
  background:
    linear-gradient(140deg, rgba(255, 255, 255, 0.105), rgba(255, 255, 255, 0.035)),
    rgba(8, 8, 8, 0.62);
  box-shadow:
    0 26px 80px rgba(0, 0, 0, 0.42),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  backdrop-filter: blur(24px) saturate(130%);
}

.auth-card::before {
  content: "";
  position: absolute;
  inset: 1px;
  z-index: -1;
  border-radius: inherit;
  background:
    linear-gradient(110deg, transparent 12%, rgba(234, 244, 255, 0.14) 38%, transparent 62%),
    radial-gradient(circle at 22% 20%, rgba(234, 244, 255, 0.12), transparent 10rem),
    radial-gradient(circle at 82% 80%, rgba(20, 90, 157, 0.16), transparent 12rem);
}

.auth-card::after {
  content: "";
  position: absolute;
  right: -88px;
  top: -92px;
  width: 210px;
  aspect-ratio: 1;
  border: 1px solid rgba(137, 170, 204, 0.18);
  border-radius: 50%;
  background:
    radial-gradient(circle, transparent 0 42%, rgba(137, 170, 204, 0.13) 42.5% 43.5%, transparent 44%),
    repeating-conic-gradient(rgba(137, 170, 204, 0.16) 0 4deg, transparent 4deg 18deg);
  opacity: 0.72;
  pointer-events: none;
}

.auth-copy {
  position: relative;
  z-index: 1;
}

.eyebrow {
  margin-bottom: 20px;
  border-color: rgba(255, 255, 255, 0.12);
  color: var(--auth-muted);
  background: rgba(255, 255, 255, 0.04);
  letter-spacing: 0.18em;
}

.auth-copy h1 {
  margin: 0 0 18px;
  color: var(--auth-text);
  font-family: "ZQKNBCGPST", serif;
  font-size: clamp(44px, 7vw, 70px);
  font-style: italic;
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: 0;
}

.muted-copy {
  margin-bottom: 24px;
  color: var(--auth-muted);
  line-height: 1.8;
}

.auth-card :deep(.el-form-item__label) {
  color: rgba(245, 245, 245, 0.76) !important;
  font-weight: 700;
}

.auth-card :deep(.el-input__wrapper) {
  min-height: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.055);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 10px 28px rgba(0, 0, 0, 0.14);
}

.auth-card :deep(.el-input__wrapper.is-focus) {
  border-color: rgba(137, 170, 204, 0.54);
  box-shadow:
    0 0 0 4px rgba(137, 170, 204, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
}

.auth-card :deep(.el-input__inner) {
  color: var(--auth-text) !important;
}

.auth-card :deep(.el-input__inner::placeholder) {
  color: rgba(245, 245, 245, 0.36);
}

.auth-submit {
  width: 100%;
  min-height: 52px;
  margin-top: 8px;
  border: 0;
  color: #0a0a0a;
  background: var(--auth-text);
  box-shadow: 0 16px 36px rgba(255, 255, 255, 0.08);
}

.auth-submit:hover {
  transform: translateY(-1px);
  color: var(--auth-text);
  background:
    linear-gradient(var(--auth-bg), var(--auth-bg)) padding-box,
    var(--auth-gradient) border-box;
  border: 2px solid transparent;
  box-shadow: 0 20px 42px rgba(137, 170, 204, 0.14);
}

.auth-switch {
  margin: 20px 0 0;
  text-align: center;
  color: var(--auth-muted);
}

.auth-switch a {
  color: var(--auth-text);
  font-weight: 700;
}

@media (max-width: 760px) {
  .auth-page {
    padding: 104px 18px 42px;
  }

  .auth-card {
    padding: 30px 22px;
    border-radius: 26px;
  }

  .auth-copy h1 {
    font-size: clamp(38px, 14vw, 56px);
  }

  .auth-float-strip {
    opacity: 0.22;
  }

  .strip-top {
    top: 12%;
  }

  .strip-bottom {
    bottom: 8%;
  }
}
</style>
