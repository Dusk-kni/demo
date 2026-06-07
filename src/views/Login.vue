<template>
  <div class="login-page">
    <div class="login-container">
      <div class="left-panel">
        <div class="platform-title">森林火灾监测预警平台</div>
        <div class="platform-subtitle">
          Forest Fire Monitoring and Early Warning Platform
        </div>

        <div class="feature-list">
          <div class="feature-item">多源遥感影像管理</div>
          <div class="feature-item">森林火点数据监测</div>
          <div class="feature-item">火险预警与应急调度</div>
          <div class="feature-item">GIS 空间可视化分析</div>
        </div>
      </div>

      <div class="login-box">
        <div class="login-title">用户登录</div>
        <div class="login-desc">请输入账号密码登录系统</div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div class="form-item" :class="{ 'has-error': errors.username }">
            <label class="form-label">用户名</label>
            <input
              v-model="loginForm.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              @blur="validateField('username')"
            />
            <div v-if="errors.username" class="form-error">{{ errors.username }}</div>
          </div>

          <div class="form-item" :class="{ 'has-error': errors.password }">
            <label class="form-label">密码</label>
            <div class="input-wrapper">
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入密码"
                @blur="validateField('password')"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <button
            type="submit"
            class="btn btn--success btn--large login-button"
            :disabled="loading"
          >
            {{ loading ? '登录中...' : '登录系统' }}
          </button>
        </form>

        <div class="login-links">
          <router-link to="/register" class="link-text">注册账号</router-link>
        </div>

        <div class="account-tip">
          <div>测试账号：</div>
          <div>用户名：admin / 密码：123456</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '../stores/user'
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '../utils/message'
import { loginApi } from '../api'
import type { LoginParams } from '../api'

interface FormErrors {
  username?: string
  password?: string
}

const router = useRouter()
const loading = ref<boolean>(false)
const showPassword = ref<boolean>(false)

const loginForm = reactive<LoginParams>({
  username: 'admin',
  password: '123456'
})

const errors = reactive<FormErrors>({})

const { setUser } = useUserStore()

function validateField(field: keyof FormErrors): boolean {
  if (field === 'username') {
    if (!loginForm.username.trim()) {
      errors.username = '请输入用户名'
      return false
    }
    errors.username = undefined
  }

  if (field === 'password') {
    if (!loginForm.password.trim()) {
      errors.password = '请输入密码'
      return false
    }
    errors.password = undefined
  }

  return true
}

function validateAll(): boolean {
  const u = validateField('username')
  const p = validateField('password')
  return u && p
}

async function handleLogin(): Promise<void> {
  if (!validateAll()) return

  loading.value = true

  try {
    const res = await loginApi({
      username: loginForm.username,
      password: loginForm.password
    })

    loading.value = false

    if (res.code === 200 && res.data) {
      localStorage.setItem('token', res.data.token)
      setUser(res.data.userInfo)
      Message.success('登录成功')
      router.push('/dashboard')
    } else {
      Message.error(res.message || '登录失败')
    }
  } catch {
    loading.value = false
    Message.error('登录请求异常，请稍后重试')
  }
}
</script>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background:
    linear-gradient(rgba(10, 45, 27, 0.78), rgba(10, 45, 27, 0.86)),
    url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1800&q=80');
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  width: 1080px;
  min-height: 640px;
  display: flex;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.35);
}

.left-panel {
  width: 44%;
  padding: 58px 48px;
  color: #fff;
  background: linear-gradient(160deg, rgba(20, 82, 45, 0.96), rgba(8, 50, 29, 0.94));
}

.platform-title {
  font-size: 34px;
  font-weight: bold;
  line-height: 1.4;
}

.platform-subtitle {
  margin-top: 16px;
  font-size: 15px;
  opacity: 0.85;
}

.feature-list {
  margin-top: 70px;
}

.feature-item {
  margin-bottom: 20px;
  padding-left: 16px;
  border-left: 4px solid #67c23a;
  font-size: 17px;
  letter-spacing: 1px;
}

.login-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.97);
  padding: 42px 46px;
  display: flex;
  flex-direction: column;
}

.login-title {
  font-size: 28px;
  font-weight: bold;
  color: #1f3f2b;
}

.login-desc {
  margin-top: 8px;
  color: #909399;
}

.login-form {
  margin-top: 36px;
}

.form-item {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #303133;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #1f8f45;
}

.form-input::placeholder {
  color: #c0c4cc;
}

.has-error .form-input {
  border-color: #f56c6c;
}

.form-error {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.input-wrapper {
  position: relative;
}

.input-wrapper .form-input {
  padding-right: 56px;
}

.toggle-password {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #909399;
  font-size: 12px;
  cursor: pointer;
  padding: 4px;
}

.toggle-password:hover {
  color: #1f8f45;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
  white-space: nowrap;
}

.btn--large {
  padding: 12px 20px;
  font-size: 16px;
}

.btn--success {
  background: #1f8f45;
  color: #fff;
}

.btn--success:hover {
  background: #1a7d3c;
}

.btn--success:disabled {
  background: #a0cfff;
  cursor: not-allowed;
}

.login-button {
  width: 100%;
  margin-top: 8px;
}

.login-links {
  margin-top: 16px;
  text-align: right;
}

.link-text {
  color: #1f8f45;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s;
}

.link-text:hover {
  color: #1a7d3c;
  text-decoration: underline;
}

.account-tip {
  margin-top: auto;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 1.7;
}

@media (max-width: 1100px) {
  .login-container {
    width: 92%;
    max-width: 1080px;
  }
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    width: 94%;
    min-height: auto;
  }

  .left-panel {
    width: 100%;
    padding: 32px 28px;
  }

  .feature-list {
    margin-top: 24px;
  }

  .feature-item {
    margin-bottom: 10px;
    font-size: 14px;
  }

  .login-box {
    padding: 28px 24px;
  }
}
</style>
