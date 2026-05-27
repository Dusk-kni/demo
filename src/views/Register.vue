<template>
  <div class="register-page">
    <div class="register-container">
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

      <div class="register-box">
        <div class="register-title">用户注册</div>
        <div class="register-desc">创建账号以使用系统功能</div>

        <form class="register-form" @submit.prevent="handleRegister">
          <div class="form-item" :class="{ 'has-error': errors.username }">
            <label class="form-label">用户名 <span class="required">*</span></label>
            <input
              v-model="form.username"
              type="text"
              class="form-input"
              placeholder="请输入用户名"
              @blur="validateField('username')"
            />
            <div v-if="errors.username" class="form-error">{{ errors.username }}</div>
          </div>

          <div class="form-item">
            <label class="form-label">昵称</label>
            <input
              v-model="form.nickname"
              type="text"
              class="form-input"
              placeholder="请输入昵称（可选）"
            />
          </div>

          <div class="form-item" :class="{ 'has-error': errors.email }">
            <label class="form-label">邮箱 <span class="required">*</span></label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="请输入邮箱地址"
              @blur="validateField('email')"
            />
            <div v-if="errors.email" class="form-error">{{ errors.email }}</div>
          </div>

          <div class="form-item" :class="{ 'has-error': errors.password }">
            <label class="form-label">密码 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请输入密码（至少6位）"
                @blur="validateField('password')"
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? '隐藏' : '显示' }}
              </button>
            </div>
            <div v-if="errors.password" class="form-error">{{ errors.password }}</div>
          </div>

          <div class="form-item" :class="{ 'has-error': errors.confirmPassword }">
            <label class="form-label">确认密码 <span class="required">*</span></label>
            <div class="input-wrapper">
              <input
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="请再次输入密码"
                @blur="validateField('confirmPassword')"
              />
              <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
                {{ showConfirmPassword ? '隐藏' : '显示' }}
              </button>
            </div>
            <div v-if="errors.confirmPassword" class="form-error">{{ errors.confirmPassword }}</div>
          </div>

          <button
            type="submit"
            class="btn btn--success btn--large register-button"
            :disabled="submitting"
          >
            {{ submitting ? '注册中...' : '立即注册' }}
          </button>
        </form>

        <div class="register-links">
          <span class="link-label">已有账号？</span>
          <router-link to="/login" class="link-text">返回登录</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '../utils/message'
import { registerApi } from '../api'
import type { RegisterParams } from '../api'

interface FormErrors {
  username?: string
  email?: string
  password?: string
  confirmPassword?: string
}

const router = useRouter()
const submitting = ref<boolean>(false)
const showPassword = ref<boolean>(false)
const showConfirmPassword = ref<boolean>(false)

const form = reactive({
  username: '',
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive<FormErrors>({})

function validateField(field: keyof FormErrors): boolean {
  if (field === 'username') {
    if (!form.username.trim()) {
      errors.username = '请输入用户名'
      return false
    }
    if (form.username.trim().length < 2) {
      errors.username = '用户名至少2个字符'
      return false
    }
    errors.username = undefined
  }

  if (field === 'email') {
    if (!form.email.trim()) {
      errors.email = '请输入邮箱地址'
      return false
    }
    const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailReg.test(form.email)) {
      errors.email = '请输入有效的邮箱地址'
      return false
    }
    errors.email = undefined
  }

  if (field === 'password') {
    if (!form.password) {
      errors.password = '请输入密码'
      return false
    }
    if (form.password.length < 6) {
      errors.password = '密码至少6位'
      return false
    }
    errors.password = undefined
    if (form.confirmPassword && form.password !== form.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
    } else if (form.confirmPassword) {
      errors.confirmPassword = undefined
    }
  }

  if (field === 'confirmPassword') {
    if (!form.confirmPassword) {
      errors.confirmPassword = '请再次输入密码'
      return false
    }
    if (form.password !== form.confirmPassword) {
      errors.confirmPassword = '两次输入的密码不一致'
      return false
    }
    errors.confirmPassword = undefined
  }

  return true
}

function validateAll(): boolean {
  const u = validateField('username')
  const e = validateField('email')
  const p = validateField('password')
  const c = validateField('confirmPassword')
  return u && e && p && c
}

async function handleRegister(): Promise<void> {
  if (!validateAll()) return

  submitting.value = true

  try {
    const params: RegisterParams = {
      username: form.username.trim(),
      password: form.password,
      nickname: form.nickname.trim() || undefined,
      email: form.email.trim()
    }

    const res = await registerApi(params)

    if (res.code === 200 && res.data) {
      Message.success('注册成功，请登录')
      router.push('/login')
    } else {
      Message.error(res.message || '注册失败')
    }
  } catch {
    Message.error('网络异常，请稍后重试')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.register-page {
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

.register-container {
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

.register-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.97);
  padding: 36px 46px;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.register-title {
  font-size: 28px;
  font-weight: bold;
  color: #1f3f2b;
}

.register-desc {
  margin-top: 8px;
  color: #909399;
}

.register-form {
  margin-top: 24px;
}

.form-item {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.required {
  color: #f56c6c;
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

.register-button {
  width: 100%;
  margin-top: 8px;
}

.register-links {
  margin-top: 16px;
  text-align: center;
}

.link-label {
  color: #909399;
  font-size: 14px;
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

@media (max-width: 1100px) {
  .register-container {
    width: 92%;
    max-width: 1080px;
  }
}

@media (max-width: 768px) {
  .register-container {
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

  .register-box {
    padding: 28px 24px;
  }
}
</style>
