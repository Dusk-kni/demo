
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
            <el-icon class="role-icon">
              <component :is="item.icon" />
            </el-icon>
            <div class="role-name">{{ item.label }}</div>
            <div class="role-desc">{{ item.desc }}</div>
          </div>
        </div>

        <el-form
          ref="loginFormRef"
          :model="loginForm"
          :rules="rules"
          class="login-form"
          label-position="top"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              size="large"
              placeholder="请输入用户名"
              clearable
            />
          </el-form-item>

          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              size="large"
              type="password"
              placeholder="请输入密码"
              show-password
            />
          </el-form-item>

          <el-button
            type="success"
            size="large"
            class="login-button"
            :loading="loading"
            @click="handleLogin"
          >
            登录系统
          </el-button>
        </el-form>

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
import { reactive, ref, markRaw } from 'vue'
import { useRouter } from 'vue-router'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import {
  UserFilled,
  Management,
  Reading
} from '@element-plus/icons-vue'
import { loginApi } from '../api'
import type { LoginParams, UserRole } from '../api'

interface RoleOption {
  label: string
  value: UserRole
  desc: string
  icon: unknown
}

const router = useRouter()

const loginFormRef = ref<FormInstance>()
const loading = ref<boolean>(false)

const loginForm = reactive<LoginParams>({
  username: 'admin',
  password: '123456',
  role: 'admin'
})

const roleOptions: RoleOption[] = [
  {
    label: '系统管理员',
    value: 'admin',
    desc: '负责用户权限、数据审核、系统运维',
    icon: markRaw(Management)
  },
  {
    label: '科研人员',
    value: 'researcher',
    desc: '负责数据上传、查询分析和科研申请',
    icon: markRaw(Reading)
  },
  {
    label: '普通用户',
    value: 'user',
    desc: '查看火点、预警、应急资源和申请数据',
    icon: markRaw(UserFilled)
  }
]

const rules: FormRules<LoginParams> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择用户身份', trigger: 'change' }
  ]
}
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
}

function handleLogin(): void {
  if (!loginFormRef.value) return

  loginFormRef.value.validate(async valid => {
    if (!valid) return

    loading.value = true

    const res = await loginApi({
      username: loginForm.username,
      password: loginForm.password,
      role: loginForm.role
    })

    loading.value = false

    if (res.code === 200 && res.data) {
      localStorage.setItem('token', res.data.token)

      // 关键：更新响应式用户状态
      setUser(res.data.userInfo)

      ElMessage.success(`${res.data.userInfo.roleName}登录成功`)
      router.push('/dashboard')
    } else {
      ElMessage.error(res.message || '登录失败')
    }
  })
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
  color: #1f8f45;
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
