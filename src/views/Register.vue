<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const auth = useAuthStore()
const loading = ref(false)
const formRef = ref()
const form = reactive({ username: '', email: '', password: '', confirmPassword: '' })

const validateConfirm = (_rule, value, callback) => {
  if (value !== form.password) callback(new Error('两次输入的密码不一致'))
  else callback()
}

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [{ required: true, type: 'email', message: '请输入有效邮箱', trigger: 'blur' }],
  password: [{ required: true, min: 6, message: '密码至少 6 位', trigger: 'blur' }],
  confirmPassword: [{ required: true, validator: validateConfirm, trigger: 'blur' }]
}

const submit = async () => {
  await formRef.value.validate()
  loading.value = true
  try {
    await auth.register(form)
    ElMessage.success('注册成功')
    router.push('/')
  } catch (error) {
    ElMessage.error(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="auth-page register-bg">
    <section class="auth-card glass-panel">
      <div class="auth-copy">
        <span class="eyebrow">北京文旅助手</span>
        <h1 class="serif-title">创建北京文旅账户</h1>
        <p class="muted-copy">用于保存景点偏好、路线方案、预约凭证、评价和 AI 推荐标签。</p>
      </div>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @submit.prevent="submit">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" size="large" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" size="large" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" size="large" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" size="large" show-password />
        </el-form-item>
        <button class="liquid-button auth-submit" type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册并进入' }}
        </button>
      </el-form>
      <p class="auth-switch">已有账户？<router-link to="/login">返回登录</router-link></p>
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
    linear-gradient(180deg, rgba(3, 3, 3, 0.22), #030303),
    url('https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1600&q=80') center / cover;
}

.auth-card {
  width: min(480px, 100%);
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
