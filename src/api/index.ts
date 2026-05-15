import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

export type UserRole = 'admin' | 'researcher' | 'user'

export type PermissionCode =
  | 'UC01'
  | 'UC02'
  | 'UC03'
  | 'UC04'
  | 'UC05'
  | 'UC06'
  | 'UC07'
  | 'UC08'
  | 'UC09'
  | 'UC10'
  | 'UC11'
  | 'UC12'
  | 'UC13'
  | 'UC14'
  | 'UC15'
  | 'UC16'
  | 'UC17'
  | 'UC18'

export interface LoginParams {
  username: string
  password: string
  role: UserRole
}

export interface UserInfo {
  id: number
  username: string
  nickname: string
  role: UserRole
  roleName: string
  permissions: PermissionCode[]
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

const service: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => Promise.reject(error)
)

service.interceptors.response.use(
  response => response.data,
  error => Promise.reject(error)
)

function mockRequest<T>(data: T, delay = 500): Promise<ApiResponse<T>> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        code: 200,
        message: 'success',
        data
      })
    }, delay)
  })
}

/* 内置权限映射（保持原有权限集合） */
const adminPermissions: PermissionCode[] = [
  'UC01',
  'UC02',
  'UC03',
  'UC04',
  'UC05',
  'UC06',
  'UC07',
  'UC08',
  'UC09',
  'UC10',
  'UC11',
  'UC12',
  'UC13',
  'UC14',
  'UC15',
  'UC16',
  'UC17',
  'UC18'
]

const researcherPermissions: PermissionCode[] = [
  'UC01',
  'UC02',
  'UC05',
  'UC07',
  'UC09',
  'UC12',
  'UC13',
  'UC14',
  'UC15'
]

const userPermissions: PermissionCode[] = [
  'UC01',
  'UC02',
  'UC07',
  'UC09',
  'UC12',
  'UC15'
]

/* ---------- 新增：用于 mock 持久化的用户类型 ---------- */
export interface StoredUser extends UserInfo {
  password: string
  phone?: string
  status?: '正常' | '已禁用'
}

/* 默认用户（首运行时会写入 localStorage.mockUsers） */
const defaultStoredUsers: StoredUser[] = [
  {
    id: 1,
    username: 'admin',
    nickname: '系统管理员',
    password: '123456',
    role: 'admin',
    roleName: '系统管理员',
    permissions: adminPermissions,
    phone: '13800000000',
    status: '正常'
  },
  {
    id: 2,
    username: 'researcher',
    nickname: '科研人员',
    password: '123456',
    role: 'researcher',
    roleName: '科研人员',
    permissions: researcherPermissions,
    phone: '13800000001',
    status: '正常'
  },
  {
    id: 3,
    username: 'user',
    nickname: '普通用户',
    password: '123456',
    role: 'user',
    roleName: '普通用户',
    permissions: userPermissions,
    phone: '13800000002',
    status: '正常'
  }
]

function roleToRoleName(role: UserRole): string {
  if (role === 'admin') return '系统管理员'
  if (role === 'researcher') return '科研人员'
  return '普通用户'
}

function roleToDefaultPermissions(role: UserRole): PermissionCode[] {
  if (role === 'admin') return adminPermissions
  if (role === 'researcher') return researcherPermissions
  return userPermissions
}

function loadStoredUsers(): StoredUser[] {
  const key = 'mockUsers'
  const str = localStorage.getItem(key)

  if (!str) {
    // 首次初始化
    localStorage.setItem(key, JSON.stringify(defaultStoredUsers))
    return defaultStoredUsers.slice()
  }

  try {
    const parsed = JSON.parse(str) as StoredUser[]
    return parsed
  } catch {
    localStorage.setItem(key, JSON.stringify(defaultStoredUsers))
    return defaultStoredUsers.slice()
  }
}

function saveStoredUsers(users: StoredUser[]): void {
  localStorage.setItem('mockUsers', JSON.stringify(users))
}

/* ---------- CRUD 接口（mock） ---------- */

/**
 * 获取所有用户（mock）
 */
export function getUsersApi(): Promise<ApiResponse<StoredUser[]>> {
  const users = loadStoredUsers()
  return mockRequest(users)
}

/**
 * 新增用户（mock）
 */
export function addUserApi(
  data: {
    username: string
    password: string
    role: UserRole
    nickname?: string
    phone?: string
    permissions?: PermissionCode[]
  }
): Promise<ApiResponse<StoredUser | null>> {
  const users = loadStoredUsers()

  if (users.some(u => u.username === data.username)) {
    return Promise.resolve({
      code: 400,
      message: '用户名已存在',
      data: null
    })
  }

  const id = Date.now()
  const roleName = roleToRoleName(data.role)
  const permissions = data.permissions ?? roleToDefaultPermissions(data.role)

  const newUser: StoredUser = {
    id,
    username: data.username,
    nickname: data.nickname ?? data.username,
    password: data.password,
    role: data.role,
    roleName,
    permissions,
    phone: data.phone ?? '',
    status: '正常'
  }

  users.push(newUser)
  saveStoredUsers(users)

  return mockRequest(newUser)
}

/**
 * 更新用户（支持 partial 更新，password 可选）
 */
export function updateUserApi(
  data: Partial<StoredUser> & { id: number }
): Promise<ApiResponse<StoredUser | null>> {
  const users = loadStoredUsers()
  const idx = users.findIndex(u => u.id === data.id)

  if (idx === -1) {
    return Promise.resolve({
      code: 404,
      message: '用户不存在',
      data: null
    })
  }

  const existing = users[idx]

  const updated: StoredUser = {
    ...existing,
    ...data
  } as StoredUser

  // 如果更改了 role，但没有显式提供 roleName，则自动更新 roleName
  if (data.role && !data.roleName) {
    updated.roleName = roleToRoleName(data.role as UserRole)
  }

  // 如果没有传入 password，则保留原 password
  if (data.password === undefined) {
    updated.password = existing.password
  }

  users[idx] = updated
  saveStoredUsers(users)

  return mockRequest(updated)
}

/**
 * 删除用户（mock）
 */
export function deleteUserApi(id: number): Promise<ApiResponse<null>> {
  let users = loadStoredUsers()
  users = users.filter(u => u.id !== id)
  saveStoredUsers(users)

  return mockRequest<null>(null)
}

/* ---------- 登录逻辑（改成优先从 localStorage 查找用户） ---------- */
export function loginApi(
  data: LoginParams
): Promise<ApiResponse<LoginResult | null>> {
  const { username, password, role } = data

  const users = loadStoredUsers()

  const matched = users.find(u => u.username === username && u.role === role)

  if (!matched) {
    return Promise.resolve({
      code: 401,
      message: '账号与所选角色不匹配或用户不存在',
      data: null
    })
  }

  if (matched.status === '已禁用') {
    return Promise.resolve({
      code: 403,
      message: '用户已被禁用',
      data: null
    })
  }

  if (matched.password !== password) {
    return Promise.resolve({
      code: 401,
      message: '密码错误',
      data: null
    })
  }

  return mockRequest<LoginResult>({
    token: `mock-token-${matched.id}`,
    userInfo: {
      id: matched.id,
      username: matched.username,
      nickname: matched.nickname,
      role: matched.role,
      roleName: matched.roleName,
      permissions: matched.permissions
    }
  })
}

/* ---------- 保持原有的 getCurrentUser / hasPermission ---------- */
export function getCurrentUser(): UserInfo | null {
  const userInfoStr = localStorage.getItem('userInfo')

  if (!userInfoStr) return null

  try {
    return JSON.parse(userInfoStr) as UserInfo
  } catch {
    return null
  }
}

export function hasPermission(permission: PermissionCode): boolean {
  const userInfo = getCurrentUser()

  if (!userInfo) return false

  return userInfo.permissions.includes(permission)
}

/* ---------- 其余原有 mock 数据接口（火点 / 火险 / 应急资源）保持不变 ---------- */

export interface FirePoint {
  id: number
  name: string
  lon: number
  lat: number
  level: string
  temperature: number
  time: string
  source: string
}

export interface RiskHeatPoint {
  lon: number
  lat: number
  value: number
  level: string
}

export interface EmergencyResource {
  id: number
  name: string
  type: string
  lon: number
  lat: number
  phone: string
}

/**
 * 获取火点数据
 */
export function getFirePointsApi(): Promise<ApiResponse<FirePoint[]>> {
  return mockRequest<FirePoint[]>([
    {
      id: 1,
      name: '火点001',
      lon: 102.25,
      lat: 27.88,
      level: '高',
      temperature: 68,
      time: '2026-04-06 14:30:00',
      source: 'Sentinel-2'
    },
    {
      id: 2,
      name: '火点002',
      lon: 103.05,
      lat: 28.12,
      level: '中',
      temperature: 51,
      time: '2026-04-06 15:10:00',
      source: 'MODIS'
    },
    {
      id: 3,
      name: '火点003',
      lon: 101.86,
      lat: 28.42,
      level: '较高',
      temperature: 59,
      time: '2026-04-06 16:20:00',
      source: 'Landsat-9'
    }
  ])
}

/**
 * 获取火险等级热力数据
 */
export function getRiskHeatApi(): Promise<ApiResponse<RiskHeatPoint[]>> {
  return mockRequest<RiskHeatPoint[]>([
    {
      lon: 102.1,
      lat: 27.9,
      value: 90,
      level: '高'
    },
    {
      lon: 102.4,
      lat: 28.1,
      value: 76,
      level: '较高'
    },
    {
      lon: 103.0,
      lat: 28.0,
      value: 63,
      level: '中'
    },
    {
      lon: 101.8,
      lat: 28.3,
      value: 52,
      level: '中'
    },
    {
      lon: 103.4,
      lat: 27.7,
      value: 35,
      level: '较低'
    }
  ])
}

/**
 * 获取应急资源数据
 */
export function getEmergencyResourcesApi(): Promise<ApiResponse<EmergencyResource[]>> {
  return mockRequest<EmergencyResource[]>([
    {
      id: 1,
      name: '凉山消防站',
      type: '消防站',
      lon: 102.18,
      lat: 27.92,
      phone: '119'
    },
    {
      id: 2,
      name: '应急水源点A',
      type: '水源',
      lon: 102.36,
      lat: 27.96,
      phone: '-'
    },
    {
      id: 3,
      name: '直升机临时起降点',
      type: '直升机坪',
      lon: 102.55,
      lat: 28.05,
      phone: '0834-xxxxxxx'
    }
  ])
}

export default service