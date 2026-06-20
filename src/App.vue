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
          <template v-for="item in visibleMenus" :key="item.path">
            <div
              v-if="item.children && item.children.length > 0"
              class="top-nav-item top-nav-submenu"
              :class="{ active: isMenuActive(item), 'submenu-open': topSubMenu === item.path }"
              @mouseenter="openTopSubMenu(item.path, $event)"
              @mouseleave="closeTopSubMenu"
            >
              <span class="top-nav-text">{{ item.title }}</span>
              <svg class="submenu-arrow" viewBox="0 0 1024 1024" width="10" height="10"><path d="M512 714.667c-8.533 0-17.067-2.134-23.467-8.534L147.2 364.8c-12.8-12.8-12.8-34.133 0-46.933s34.133-12.8 46.933 0L512 635.733l317.867-317.866c12.8-12.8 34.133-12.8 46.933 0s12.8 34.133 0 46.933L535.467 706.133c-6.4 6.4-14.934 8.534-23.467 8.534z" fill="currentColor"/></svg>
            </div>
            <router-link
              v-else
              :to="item.path"
              class="top-nav-item"
              :class="{ active: route.path === item.path }"
            >
              <span class="top-nav-text">{{ item.title }}</span>
            </router-link>
          </template>
        </nav>
        <div
          v-if="topSubMenu && activeTopMenuChildren.length > 0"
          class="submenu-dropdown-fixed"
          :style="subMenuStyle"
          @mouseenter="keepTopSubMenu"
          @mouseleave="closeTopSubMenu"
        >
          <router-link
            v-for="child in activeTopMenuChildren"
            :key="child.path"
            :to="child.path"
            class="submenu-item"
            :class="{ active: route.path === child.path }"
          >
            {{ child.title }}
          </router-link>
        </div>
        <div class="top-header-right">
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
        <template v-for="item in visibleMenus" :key="item.path">
          <div v-if="item.children && item.children.length > 0" class="nav-group">
            <div
              class="nav-item"
              :class="{ active: isMenuActive(item) }"
              @click="toggleSideSubMenu(item.path)"
            >
              <span class="nav-text">{{ item.title }}</span>
              <svg class="nav-arrow" :class="{ open: sideSubMenu === item.path }" viewBox="0 0 1024 1024" width="12" height="12"><path d="M512 714.667c-8.533 0-17.067-2.134-23.467-8.534L147.2 364.8c-12.8-12.8-12.8-34.133 0-46.933s34.133-12.8 46.933 0L512 635.733l317.867-317.866c12.8-12.8 34.133-12.8 46.933 0s12.8 34.133 0 46.933L535.467 706.133c-6.4 6.4-14.934 8.534-23.467 8.534z" fill="currentColor"/></svg>
            </div>
            <div v-show="sideSubMenu === item.path" class="nav-sub-list">
              <router-link
                v-for="child in item.children"
                :key="child.path"
                :to="child.path"
                class="nav-sub-item"
                :class="{ active: route.path === child.path }"
              >
                {{ child.title }}
              </router-link>
            </div>
          </div>
          <router-link
            v-else
            :to="item.path"
            class="nav-item"
            :class="{ active: route.path === item.path }"
          >
            <span class="nav-text">{{ item.title }}</span>
          </router-link>
        </template>
      </nav>
    </aside>

    <div class="main-container">
      <header class="header">
        <div class="header-left">
          {{ currentTitle }}
        </div>

        <div class="header-right">
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
import type { UserInfo } from './api'
import { useUserStore } from './stores/user'


interface MenuItem {
  title: string
  path: string
  children?: MenuItem[]
}

const route = useRoute()
const router = useRouter()

const { userInfo, clearUser } = useUserStore()

const dropdownOpen = ref<boolean>(false)
const topSubMenu = ref<string>('')
const sideSubMenu = ref<string>('')
const subMenuPos = ref<{ left: number; top: number }>({ left: 0, top: 0 })
let topSubMenuTimer: ReturnType<typeof setTimeout> | null = null

const menus: MenuItem[] = [
  {
    title: '系统首页',
    path: '/dashboard',
  },
  {
    title: '数据分类管理',
    path: '/data-category',
  },
  {
    title: '火点数据管理',
    path: '/fire-point',
  },
  {
    title: '应急资源管理',
    path: '/emergency-resource',
  },
  {
    title: '火险预警管理',
    path: '/warning',
  },
  {
    title: '遥感影像管理',
    path: '/remote-image',
  },
  {
    title: '数据申请服务',
    path: '/data-application',
  },
  {
    title: '系统运维管理',
    path: '/system-ops',
  }
]

const isLoginPage = computed<boolean>(() => route.path === '/login')

const isDashboardPage = computed<boolean>(() => route.path === '/dashboard')

const isRegisterPage = computed<boolean>(() => route.path === '/register')

const horizontalNavPaths = ['/warning', '/remote-image', '/data-application', '/data-category', '/fire-point', '/emergency-resource', '/system-ops']

const isHorizontalNavPage = computed<boolean>(() => horizontalNavPaths.includes(route.path))

const currentTitle = computed<string>(() => {
  return String(route.meta.title || '森林火灾监测预警平台')
})

const visibleMenus = computed<MenuItem[]>(() => {
  const currentUser = userInfo.value

  if (!currentUser) return []

  return menus
})

function logout(): void {
  clearUser()
  router.push('/login')
}

function isMenuActive(menu: MenuItem): boolean {
  if (route.path === menu.path) return true
  if (menu.children) {
    return menu.children.some(child => route.path === child.path)
  }
  return false
}

const activeTopMenuChildren = computed<MenuItem[]>(() => {
  if (!topSubMenu.value) return []
  const menu = menus.find(m => m.path === topSubMenu.value)
  return menu?.children || []
})

const subMenuStyle = computed(() => ({
  left: subMenuPos.value.left + 'px',
  top: subMenuPos.value.top + 'px'
}))

function openTopSubMenu(path: string, event: MouseEvent): void {
  if (topSubMenuTimer) {
    clearTimeout(topSubMenuTimer)
    topSubMenuTimer = null
  }
  const el = (event.currentTarget as HTMLElement)
  const rect = el.getBoundingClientRect()
  subMenuPos.value = { left: rect.left, top: rect.bottom + 4 }
  topSubMenu.value = path
}

function keepTopSubMenu(): void {
  if (topSubMenuTimer) {
    clearTimeout(topSubMenuTimer)
    topSubMenuTimer = null
  }
}

function closeTopSubMenu(): void {
  topSubMenuTimer = setTimeout(() => {
    topSubMenu.value = ''
  }, 150)
}

function toggleSideSubMenu(path: string): void {
  sideSubMenu.value = sideSubMenu.value === path ? '' : path
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
  overflow: visible;
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

.top-nav-submenu {
  position: relative;
}

.submenu-arrow {
  transition: transform 0.2s;
  flex-shrink: 0;
}

.top-nav-submenu:hover .submenu-arrow {
  transform: rotate(180deg);
}

.top-nav-submenu.submenu-open .submenu-arrow {
  transform: rotate(180deg);
}

.submenu-dropdown-fixed {
  position: fixed;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  min-width: 140px;
  z-index: 9999;
  padding: 4px 0;
}

.submenu-item {
  display: block;
  padding: 8px 16px;
  font-size: 13px;
  color: #606266;
  text-decoration: none;
  transition: all 0.15s;
  white-space: nowrap;
}

.submenu-item:hover {
  background: rgba(31, 143, 69, 0.06);
  color: #1f8f45;
}

.submenu-item.active {
  color: #1f8f45;
  font-weight: 600;
  background: rgba(31, 143, 69, 0.08);
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

.nav-group {
  display: flex;
  flex-direction: column;
}

.nav-item .nav-arrow {
  margin-left: auto;
  transition: transform 0.25s;
  flex-shrink: 0;
  opacity: 0.6;
}

.nav-item .nav-arrow.open {
  transform: rotate(180deg);
  opacity: 1;
}

.nav-sub-list {
  background: rgba(0, 0, 0, 0.15);
}

.nav-sub-item {
  display: block;
  padding: 10px 20px 10px 36px;
  color: #c0c4cc;
  text-decoration: none;
  font-size: 13px;
  transition: all 0.2s;
  cursor: pointer;
}

.nav-sub-item:hover {
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
}

.nav-sub-item.active {
  color: #ffd04b;
  background: rgba(255, 208, 75, 0.08);
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
