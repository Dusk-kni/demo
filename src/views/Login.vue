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
        <div class="login-desc">请选择用户身份后登录系统</div>

        <div class="role-select">
          <div
            v-for="item in roleOptions"
            :key="item.value"
            class="role-card"
            :class="{ active: loginForm.role === item.value }"
            @click="selectRole(item.value)"
          >
            <div class="role-icon">{{ item.iconText }}</div>
            <div class="role-name">{{ item.label }}</div>
            <div class="role-desc">{{ item.desc }}</div>
          </div>
        </div>

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

        <div class="account-tip">
          <div>测试账号：</div>
          <div>系统管理员：admin / 123456</div>
          <div>科研人员：researcher / 123456</div>
          <div>普通用户：user / 123456</div>
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
import type { LoginParams, UserRole } from '../api'

interface RoleOption {
  label: string
  value: UserRole
  desc: string
  iconText: string
}

interface FormErrors {
  username?: string
  password?: string
}

const router = useRouter()
const loading = ref<boolean>(false)
const showPassword = ref<boolean>(false)

const loginForm = reactive<LoginParams>({
  username: 'admin',
  password: '123456',
  role: 'admin'
})

const errors = reactive<FormErrors>({})

const roleOptions: RoleOption[] = [
  {
    label: '系统管理员',
    value: 'admin',
    desc: '负责用户权限、数据审核、系统运维',
    iconText: '🛡'
  },
  {
    label: '科研人员',
    value: 'researcher',
    desc: '负责数据上传、查询分析和科研申请',
    iconText: '🔬'
  },
  {
    label: '普通用户',
    value: 'user',
    desc: '查看火点、预警、应急资源和申请数据',
    iconText: '👤'
  }
]

const { setUser } = useUserStore()

function selectRole(role: UserRole): void {
  loginForm.role = role

  if (role === 'admin') {
    loginForm.username = 'admin'
  } else if (role === 'researcher') {
    loginForm.username = 'researcher'
  } else {
    loginForm.username = 'user'
  }

  loginForm.password = '123456'
  errors.username = undefined
  errors.password = undefined
}

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

  const res = await loginApi({
    username: loginForm.username,
    password: loginForm.password,
    role: loginForm.role
  })

  loading.value = false

  if (res.code === 200 && res.data) {
    localStorage.setItem('token', res.data.token)
    setUser(res.data.userInfo)
    Message.success(`${res.data.userInfo.roleName}登录成功`)
    router.push('/dashboard')
  } else {
    Message.error(res.message || '登录失败')
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

.role-select {
  display: flex;
  gap: 12px;
  margin-top: 28px;
}

.role-card {
  flex: 1;
  min-height: 132px;
  padding: 18px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 12px;
  text-align: center;
  cursor: pointer;
  transition: all 0.25s;
  background: #fff;
}

.role-card:hover {
  transform: translateY(-3px);
  border-color: #67c23a;
}

.role-card.active {
  border-color: #1f8f45;
  background: #f0f9eb;
  box-shadow: 0 6px 16px rgba(31, 143, 69, 0.18);
}

.role-icon {
  font-size: 30px;
}

.role-name {
  margin-top: 8px;
  font-weight: bold;
  color: #303133;
}

.role-desc {
  margin-top: 6px;
  font-size: 12px;
  line-height: 1.5;
  color: #909399;
}

.login-form {
  margin-top: 28px;
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

.account-tip {
  margin-top: 20px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #606266;
  font-size: 13px;
  line-height: 1.7;
}
</style>
