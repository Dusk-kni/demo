<template>
  <router-view v-if="isLoginPage" />

  <el-container v-else class="layout">
    <el-aside width="240px" class="aside">
      <div class="logo">
        <div class="logo-title">森林火灾监测预警平台</div>
        <div class="logo-subtitle">Forest Fire Warning System</div>
      </div>

      <el-menu
        router
        :default-active="route.path"
        background-color="#1f3f2b"
        text-color="#dcdfe6"
        active-text-color="#ffd04b"
      >
        <el-menu-item
          v-for="item in visibleMenus"
          :key="item.path"
          :index="item.path"
        >
          <el-icon>
            <component :is="item.icon" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          {{ currentTitle }}
        </div>

        <div class="header-right">
          <el-tag :type="roleTagType">
            {{ userInfo?.roleName }}
          </el-tag>

          <el-dropdown trigger="click" @command="handleUserCommand">
            <span class="username-dropdown">
              {{ userInfo?.username }}
              <el-icon class="arrow-icon">
                <ArrowDown />
              </el-icon>
            </span>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  个人信息
                </el-dropdown-item>

                <el-dropdown-item command="password">
                  修改密码
                </el-dropdown-item>

              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <el-button size="small" type="danger" @click="logout">
            退出登录
          </el-button>
        </div>

      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  HomeFilled,
  Location,
  User,
  Collection,
  Warning,
  Files,
  Bell,
  Picture,
  Tickets,
  Setting,
  ArrowDown
} from '@element-plus/icons-vue'
import type { PermissionCode, UserInfo } from './api'
import { useUserStore } from './stores/user'


interface MenuItem {
  title: string
  path: string
  icon: unknown
  permissions?: PermissionCode[]
}

const route = useRoute()
const router = useRouter()

const { userInfo, clearUser } = useUserStore()

const menus: MenuItem[] = [
  {
    title: '系统首页',
    path: '/dashboard',
    icon: HomeFilled
  },
  {
    title: 'GIS空间可视化',
    path: '/gis',
    icon: Location,
    permissions: ['UC07', 'UC09', 'UC12']
  },
  {
    title: '用户与权限管理',
    path: '/user-manage',
    icon: User,
    permissions: ['UC03']
  },
  {
    title: '数据分类管理',
    path: '/data-category',
    icon: Collection,
    permissions: ['UC04']
  },
  {
    title: '火点数据管理',
    path: '/fire-point',
    icon: Warning,
    permissions: ['UC05', 'UC06', 'UC07']
  },
  {
    title: '应急资源管理',
    path: '/emergency-resource',
    icon: Files,
    permissions: ['UC08', 'UC09', 'UC10']
  },
  {
    title: '火险预警管理',
    path: '/warning',
    icon: Bell,
    permissions: ['UC11', 'UC12']
  },
  {
    title: '遥感影像管理',
    path: '/remote-image',
    icon: Picture,
    permissions: ['UC13', 'UC14']
  },
  {
    title: '数据申请服务',
    path: '/data-application',
    icon: Tickets,
    permissions: ['UC15', 'UC16']
  },
  {
    title: '系统运维管理',
    path: '/system-ops',
    icon: Setting,
    permissions: ['UC17', 'UC18']
  }
]

const isLoginPage = computed<boolean>(() => route.path === '/login')

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

const roleTagType = computed<'success' | 'warning' | 'info' | 'danger'>(() => {
  if (userInfo.value?.role === 'admin') return 'danger'
  if (userInfo.value?.role === 'researcher') return 'warning'
  return 'success'
})

function logout(): void {
  clearUser()
  router.push('/login')
}


function handleUserCommand(command: string): void {
  if (command === 'profile') {
    router.push('/profile')
  } else if (command === 'password') {
    ElMessage.info('修改密码功能开发中')
  } else if (command === 'logout') {
    logout()
  }
}

</script>

<style scoped>
.layout {
  width: 100vw;
  height: 100vh;
}

.aside {
  background: #1f3f2b;
  color: #fff;
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

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #ffffff;
  border-bottom: 1px solid #ebeef5;
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

.username-dropdown {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #303133;
  cursor: pointer;
  font-size: 16px;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.username-dropdown:hover {
  color: #1f8f45;
  background: #f0f9eb;
}

.arrow-icon {
  font-size: 12px;
}


.main {
  background: #f5f7fa;
  padding: 16px;
  overflow: auto;
}
</style>
