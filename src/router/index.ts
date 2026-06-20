import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

import Profile from '../views/Profile.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
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
    path: '/register',
    component: Register,
    meta: {
      title: '注册'
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
    path: '/data-category',
    component: DataCategory,
    meta: {
      title: '数据分类管理',
      requiresAuth: true
    }
  },
  {
    path: '/fire-point',
    component: FirePointManage,
    meta: {
      title: '火点数据管理',
      requiresAuth: true
    }
  },
  {
    path: '/emergency-resource',
    component: EmergencyResource,
    meta: {
      title: '应急资源管理',
      requiresAuth: true
    }
  },
  {
    path: '/warning',
    component: WarningManage,
    meta: {
      title: '火险预警管理',
      requiresAuth: true
    }
  },
  {
    path: '/remote-image',
    component: RemoteImageManage,
    meta: {
      title: '遥感影像管理',
      requiresAuth: true
    }
  },
  {
    path: '/data-application',
    component: DataApplication,
    meta: {
      title: '数据申请服务',
      requiresAuth: true
    }
  },
  {
    path: '/system-ops',
    component: SystemOps,
    meta: {
      title: '系统运维管理',
      requiresAuth: true
    }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
    return
  }

  next()
})

export default router
