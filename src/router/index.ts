import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { PermissionCode } from '../api'
import { getCurrentUser } from '../api'

import Profile from '../views/Profile.vue'
import Login from '../views/Login.vue'
import Dashboard from '../views/Dashboard.vue'
import GISMap from '../views/GISMap.vue'
import UserManage from '../views/UserManage.vue'
import DataCategory from '../views/DataCategory.vue'
import FirePointManage from '../views/FirePointManage.vue'
import EmergencyResource from '../views/EmergencyResource.vue'
import WarningManage from '../views/WarningManage.vue'
import RemoteImageManage from '../views/RemoteImageManage.vue'
import DataApplication from '../views/DataApplication.vue'
import SystemOps from '../views/SystemOps.vue'

declare module 'vue-router' {
  interface RouteMeta {
    title?: string
    requiresAuth?: boolean
    permissions?: PermissionCode[]
  }
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/login',
    component: Login,
    meta: {
      title: '登录'
    }
  },
  {
    path: '/dashboard',
    component: Dashboard,
    meta: {
      title: '系统首页',
      requiresAuth: true
    }
  },
  {
  path: '/profile',
  component: Profile,
  meta: {
    title: '个人信息',
    requiresAuth: true
    }
  },
  {
    path: '/gis',
    component: GISMap,
    meta: {
      title: 'GIS空间可视化',
      requiresAuth: true,
      permissions: ['UC07', 'UC09', 'UC12']
    }
  },
  {
    path: '/user-manage',
    component: UserManage,
    meta: {
      title: '用户与权限管理',
      requiresAuth: true,
      permissions: ['UC03']
    }
  },
  {
    path: '/data-category',
    component: DataCategory,
    meta: {
      title: '数据分类管理',
      requiresAuth: true,
      permissions: ['UC04']
    }
  },
  {
    path: '/fire-point',
    component: FirePointManage,
    meta: {
      title: '火点数据管理',
      requiresAuth: true,
      permissions: ['UC05', 'UC06', 'UC07']
    }
  },
  {
    path: '/emergency-resource',
    component: EmergencyResource,
    meta: {
      title: '应急资源管理',
      requiresAuth: true,
      permissions: ['UC08', 'UC09', 'UC10']
    }
  },
  {
    path: '/warning',
    component: WarningManage,
    meta: {
      title: '火险预警管理',
      requiresAuth: true,
      permissions: ['UC11', 'UC12']
    }
  },
  {
    path: '/remote-image',
    component: RemoteImageManage,
    meta: {
      title: '遥感影像管理',
      requiresAuth: true,
      permissions: ['UC13', 'UC14']
    }
  },
  {
    path: '/data-application',
    component: DataApplication,
    meta: {
      title: '数据申请服务',
      requiresAuth: true,
      permissions: ['UC15', 'UC16']
    }
  },
  {
    path: '/system-ops',
    component: SystemOps,
    meta: {
      title: '系统运维管理',
      requiresAuth: true,
      permissions: ['UC17', 'UC18']
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  const userInfo = getCurrentUser()

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  if (to.meta.permissions && to.meta.permissions.length > 0) {
    if (!userInfo) {
      next('/login')
      return
    }

    const hasAuth = to.meta.permissions.some(permission =>
      userInfo.permissions.includes(permission)
    )

    if (!hasAuth) {
      ElMessage.warning('当前角色无权访问该功能模块')
      next('/dashboard')
      return
    }
  }

  next()
})

export default router
