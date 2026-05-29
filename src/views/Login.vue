<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const formRef = ref()
const form = reactive({ username: 'admin', password: '123456' })

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
  <main class="auth-page">
    <section class="auth-card glass-panel">
      <div class="auth-copy">
        <span class="eyebrow">北京文旅助手</span>
        <h1 class="serif-title">进入北京文旅智能推荐助手</h1>
        <p class="muted-copy">登录后可保存北京景点预约建议、兴趣推荐路线、预约凭证和体验评价。</p>
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
  min-height: 100svh;
  display: grid;
  place-items: center;
  padding: 28px;
  background:
    linear-gradient(180deg, rgba(3, 3, 3, 0.35), #030303),
    url('https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1600&q=80') center / cover;
}

.auth-card {
  width: min(460px, 100%);
  border-radius: 34px;
  padding: 34px;
}

.auth-copy h1 {
  margin: 14px 0 10px;
  font-size: 38px;
  line-height: 1.08;
}

.auth-submit {
  width: 100%;
  margin-top: 8px;
}

.auth-switch {
  margin: 18px 0 0;
  text-align: center;
  color: var(--muted);
}

.auth-switch a {
  color: var(--text);
  font-weight: 700;
}
</style>
