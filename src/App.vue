<template>
  <router-view v-if="isLoginPage || isDashboardPage || isRegisterPage" />

  <div v-else-if="isHorizontalNavPage" class="layout layout--horizontal">
    <header class="top-header">
      <div class="top-header-inner">
        <div class="top-header-brand">
          <span class="top-header-icon"></span>
          <span class="top-header-title">森林火灾监测预警平台</span>
        </div>
        <nav class="top-nav-bar">
          <router-link
            v-for="item in visibleMenus"
            :key="item.path"
            :to="item.path"
            class="top-nav-item"
            :class="{ active: route.path === item.path }"
          >
            <span class="top-nav-text">{{ item.title }}</span>
          </router-link>
        </nav>
        <div class="top-header-right">
          <span class="role-tag" :class="'role-tag--' + userInfo?.role">
            {{ userInfo?.roleName }}
          </span>
          <div class="dropdown" :class="{ open: dropdownOpen }">
            <span class="username-trigger" @click="dropdownOpen = !dropdownOpen">
              {{ userInfo?.username }}
              <svg class="arrow-icon" viewBox="0 0 1024 1024" width="12" height="12">
                <path d="M512 714.667c-8.533 0-17.067-2.134-23.467-8.534L147.2 364.8c-12.8-12.8-12.8-34.133 0-46.933s34.133-12.8 46.933 0L512 635.733l317.867-317.866c12.8-12.8 34.133-12.8 46.933 0s12.8 34.133 0 46.933L535.467 706.133c-6.4 6.4-14.934 8.534-23.467 8.534z" fill="currentColor"/>
              </svg>
            </span>
            <div v-if="dropdownOpen" class="dropdown-menu">
              <div class="dropdown-item" @click="goProfile">个人信息</div>
              <div class="dropdown-item" @click="changePassword">修改密码</div>
            </div>
          </div>
          <button class="btn btn--danger btn--small" @click="logout">
            退出登录
          </button>
        </div>
      </div>
    </header>
    <main class="main main--horizontal">
      <router-view />
    </main>
  </div>

  <div v-else class="layout">
    <aside class="aside">
      <div class="logo">
        <div class="logo-title">森林火灾监测预警平台</div>
        <div class="logo-subtitle">Forest Fire Warning System</div>
      </div>

      <nav class="nav-menu">
        <router-link
          v-for="item in visibleMenus"
          :key="item.path"
          :to="item.path"
          class="nav-item"
          :class="{ active: route.path === item.path }"
        >
          <span class="nav-text">{{ item.title }}</span>
        </router-link>
      </nav>
    </aside>

    <div class="main-container">
      <header class="header">
        <div class="header-left">
          {{ currentTitle }}
        </div>

        <div class="header-right">
          <span class="role-tag" :class="'role-tag--' + userInfo?.role">
            {{ userInfo?.roleName }}
          </span>

          <div class="dropdown" :class="{ open: dropdownOpen }">
            <span class="username-trigger" @click="dropdownOpen = !dropdownOpen">
              {{ userInfo?.username }}
              <svg class="arrow-icon" viewBox="0 0 1024 1024" width="12" height="12">
                <path d="M512 714.667c-8.533 0-17.067-2.134-23.467-8.534L147.2 364.8c-12.8-12.8-12.8-34.133 0-46.933s34.133-12.8 46.933 0L512 635.733l317.867-317.866c12.8-12.8 34.133-12.8 46.933 0s12.8 34.133 0 46.933L535.467 706.133c-6.4 6.4-14.934 8.534-23.467 8.534z" fill="currentColor"/>
              </svg>
            </span>

            <div v-if="dropdownOpen" class="dropdown-menu">
              <div class="dropdown-item" @click="goProfile">个人信息</div>
              <div class="dropdown-item" @click="changePassword">修改密码</div>
            </div>
          </div>

          <button class="btn btn--danger btn--small" @click="logout">
            退出登录
          </button>
        </div>
      </header>

      <main class="main">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Message } from './utils/message'
import type { PermissionCode, UserInfo } from './api'
import { useUserStore } from './stores/user'


interface MenuItem {
  title: string
  path: string
  permissions?: PermissionCode[]
}

const route = useRoute()
const router = useRouter()

const { userInfo, clearUser } = useUserStore()

const dropdownOpen = ref<boolean>(false)

const menus: MenuItem[] = [
  {
    title: '系统首页',
    path: '/dashboard',
    },
  {
    title: '用户与权限管理',
    path: '/user-manage',
    permissions: ['UC03']
  },
  {
    title: '数据分类管理',
    path: '/data-category',
    permissions: ['UC04']
  },
  {
    title: '火点数据管理',
    path: '/fire-point',
    permissions: ['UC05', 'UC06', 'UC07']
  },
  {
    title: '应急资源管理',
    path: '/emergency-resource',
    permissions: ['UC08', 'UC09', 'UC10']
  },
  {
    title: '火险预警管理',
    path: '/warning',
    permissions: ['UC11', 'UC12']
  },
  {
    title: '遥感影像管理',
    path: '/remote-image',
    permissions: ['UC13', 'UC14']
  },
  {
    title: '数据申请服务',
    path: '/data-application',
    permissions: ['UC15', 'UC16']
  },
  {
    title: '系统运维管理',
    path: '/system-ops',
    permissions: ['UC17', 'UC18']
  }
]

const isLoginPage = computed<boolean>(() => route.path === '/login')

const isDashboardPage = computed<boolean>(() => route.path === '/dashboard')

const isRegisterPage = computed<boolean>(() => route.path === '/register')

const horizontalNavPaths = ['/warning', '/remote-image', '/data-application']

const isHorizontalNavPage = computed<boolean>(() => horizontalNavPaths.includes(route.path))

const currentTitle = computed<string>(() => {
  return String(route.meta.title || '森林火灾监测预警平台')
})

const visibleMenus = computed<MenuItem[]>(() => {
  const currentUser = userInfo.value

  if (!currentUser) return []

  return menus.filter(menu => {
    if (!menu.permissions || menu.permissions.length === 0) {
      return true
    }

    return menu.permissions.some(permission =>
      currentUser.permissions.includes(permission)
    )
  })
})

function logout(): void {
  clearUser()
  router.push('/login')
}

function goProfile(): void {
  dropdownOpen.value = false
  router.push('/profile')
}

function changePassword(): void {
  dropdownOpen.value = false
  Message.info('修改密码功能开发中')
}

function handleGlobalClick(e: MouseEvent): void {
  const target = e.target as HTMLElement
  if (!target.closest('.dropdown')) {
    dropdownOpen.value = false
  }
}

import { onMounted, onUnmounted } from 'vue'

onMounted(() => {
  document.addEventListener('click', handleGlobalClick)
})

onUnmounted(() => {
  document.removeEventListener('click', handleGlobalClick)
})
</script>

<style scoped>
.layout {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.layout--horizontal {
  flex-direction: column;
}

.top-header {
  position: sticky;
  top: 0;
  z-index: 200;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  flex-shrink: 0;
}

.top-header-inner {
  display: flex;
  align-items: center;
  height: 56px;
  padding: 0 20px;
  gap: 24px;
}

.top-header-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.top-header-icon {
  font-size: 22px;
}

.top-header-title {
  font-size: 16px;
  font-weight: bold;
  color: #1f8f45;
  white-space: nowrap;
}

.top-nav-bar {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 1;
  overflow-x: auto;
  overflow-y: hidden;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.top-nav-bar::-webkit-scrollbar {
  display: none;
}

.top-nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  color: #606266;
  text-decoration: none;
  font-size: 13px;
  white-space: nowrap;
  border-radius: 6px;
  transition: all 0.25s ease;
  cursor: pointer;
  position: relative;
}

.top-nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 2px;
  background: #1f8f45;
  transition: all 0.25s ease;
  transform: translateX(-50%);
  border-radius: 1px;
}

.top-nav-item:hover {
  background: rgba(31, 143, 69, 0.06);
  color: #1f8f45;
}

.top-nav-item:hover::after {
  width: 60%;
}

.top-nav-item.active {
  background: rgba(31, 143, 69, 0.1);
  color: #1f8f45;
  font-weight: 600;
}

.top-nav-item.active::after {
  width: 80%;
}

.top-nav-text {
  white-space: nowrap;
}

.top-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.main--horizontal {
  flex: 1;
  background: #f5f7fa;
  padding: 20px;
  overflow: auto;
}

@media (max-width: 1024px) {
  .top-header-inner {
    gap: 12px;
  }

  .top-nav-item {
    padding: 6px 10px;
    font-size: 12px;
  }

  .top-header-title {
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .top-header-inner {
    flex-wrap: wrap;
    height: auto;
    padding: 10px 12px;
  }

  .top-header-brand {
    width: 100%;
  }

  .top-nav-bar {
    width: 100%;
    order: 3;
    padding: 4px 0;
  }

  .top-header-right {
    margin-left: auto;
  }
}

.aside {
  width: 240px;
  background: #1f3f2b;
  color: #fff;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
}

.logo {
  height: 78px;
  padding: 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.logo-title {
  font-size: 17px;
  font-weight: bold;
}

.logo-subtitle {
  margin-top: 6px;
  font-size: 12px;
  color: #c0c4cc;
}

.nav-menu {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  color: #dcdfe6;
  text-decoration: none;
  font-size: 14px;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
}

.nav-item.active {
  background: rgba(255, 208, 75, 0.12);
  color: #ffd04b;
}

.nav-text {
  white-space: nowrap;
}

.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
  padding: 0 20px;
  flex-shrink: 0;
}

.header-left {
  font-size: 20px;
  font-weight: bold;
  color: #1f3f2b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 22px;
}

.role-tag--admin {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.role-tag--researcher {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.role-tag--user {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.dropdown {
  position: relative;
}

.username-trigger {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #303133;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
  user-select: none;
}

.username-trigger:hover {
  color: #1f8f45;
  background: #f0f9eb;
}

.arrow-icon {
  transition: transform 0.2s;
}

.dropdown.open .arrow-icon {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 140px;
  z-index: 100;
  padding: 4px 0;
}

.dropdown-item {
  padding: 8px 16px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  transition: all 0.15s;
}

.dropdown-item:hover {
  background: #f0f9eb;
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

.btn--small {
  padding: 5px 12px;
  font-size: 12px;
}

.btn--danger {
  background: #f56c6c;
  color: #fff;
}

.btn--danger:hover {
  background: #e64242;
}

.main {
  flex: 1;
  background: #f5f7fa;
  padding: 16px;
  overflow: auto;
}
</style>
