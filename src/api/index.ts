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
}

export interface RegisterParams {
  username: string
  password: string
  nickname?: string
  email?: string
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

/* ---------- 统一权限：所有用户拥有相同权限（移除角色权限区分） ---------- */
const allPermissions: PermissionCode[] = [
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

/* ---------- 新增：用于 mock 持久化的用户类型 ---------- */
export interface StoredUser extends UserInfo {
  password: string
  phone?: string
  email?: string
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
    permissions: allPermissions,
    phone: '13800000000',
    status: '正常'
  },
  {
    id: 2,
    username: 'researcher',
    nickname: '科研人员',
    password: '123456',
    role: 'admin',
    roleName: '系统管理员',
    permissions: allPermissions,
    phone: '13800000001',
    status: '正常'
  },
  {
    id: 3,
    username: 'user',
    nickname: '普通用户',
    password: '123456',
    role: 'admin',
    roleName: '系统管理员',
    permissions: allPermissions,
    phone: '13800000002',
    status: '正常'
  }
]

const MOCK_USERS_VERSION = 2

function loadStoredUsers(): StoredUser[] {
  const key = 'mockUsers'
  const versionKey = 'mockUsersVersion'
  const str = localStorage.getItem(key)
  const version = localStorage.getItem(versionKey)

  if (!str || Number(version) < MOCK_USERS_VERSION) {
    localStorage.setItem(key, JSON.stringify(defaultStoredUsers))
    localStorage.setItem(versionKey, String(MOCK_USERS_VERSION))
    return defaultStoredUsers.slice()
  }

  try {
    const parsed = JSON.parse(str) as StoredUser[]
    return parsed
  } catch {
    localStorage.setItem(key, JSON.stringify(defaultStoredUsers))
    localStorage.setItem(versionKey, String(MOCK_USERS_VERSION))
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
    nickname?: string
    phone?: string
    email?: string
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

  const newUser: StoredUser = {
    id,
    username: data.username,
    nickname: data.nickname ?? data.username,
    password: data.password,
    role: 'admin',
    roleName: '系统管理员',
    permissions: allPermissions,
    phone: data.phone ?? '',
    email: data.email ?? '',
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

/* ---------- 登录逻辑（仅按用户名+密码匹配，不再区分角色） ---------- */
export function loginApi(
  data: LoginParams
): Promise<ApiResponse<LoginResult | null>> {
  const { username, password } = data

  const users = loadStoredUsers()

  const matched = users.find(u => u.username === username)

  if (!matched) {
    return Promise.resolve({
      code: 401,
      message: '用户名不存在',
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

/* ---------- 注册接口（mock） ---------- */
export function registerApi(
  data: RegisterParams
): Promise<ApiResponse<LoginResult | null>> {
  const users = loadStoredUsers()

  if (users.some(u => u.username === data.username)) {
    return Promise.resolve({
      code: 400,
      message: '用户名已存在',
      data: null
    })
  }

  const id = Date.now()

  const newUser: StoredUser = {
    id,
    username: data.username,
    nickname: data.nickname ?? data.username,
    password: data.password,
    role: 'admin',
    roleName: '系统管理员',
    permissions: allPermissions,
    email: data.email ?? '',
    status: '正常'
  }

  users.push(newUser)
  saveStoredUsers(users)

  return mockRequest<LoginResult>({
    token: `mock-token-${id}`,
    userInfo: {
      id,
      username: newUser.username,
      nickname: newUser.nickname,
      role: newUser.role,
      roleName: newUser.roleName,
      permissions: newUser.permissions
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

/* ---------- 遥感影像管理 mock 接口 ---------- */

export interface RemoteImageItem {
  id: number
  name: string
  source: string
  resolution: string
  cloudCover: string
  sceneCount: string
  dataSize: string
  views: number
  downloads: number
  captureTime: string
  thumbnail: string
  status: '可申请' | '处理中' | '已申请'
}

export interface RemoteImageStats {
  totalScenes: string
  totalDataSize: string
  totalUsers: string
  totalServices: string
  totalDatasets: string
  totalStorage: string
}

export interface RemoteImageListParams {
  keyword?: string
  source?: string
  page: number
  pageSize: number
}

export interface RemoteImageListResult {
  list: RemoteImageItem[]
  total: number
  page: number
  pageSize: number
}

export interface ApplyImageData {
  imageId: number
  purpose: string
  email: string
}

const mockRemoteImages: RemoteImageItem[] = [
  {
    id: 1,
    name: '1995年11月-2011年7月中国区域ERS-2-SAR原始遥感影像数据集',
    source: 'ERS-2',
    resolution: '30m',
    cloudCover: '15%',
    sceneCount: '20,173',
    dataSize: '6.77TB',
    views: 4464,
    downloads: 174,
    captureTime: '1995-11 ~ 2011-07',
    thumbnail: 'https://picsum.photos/seed/rs-ers2-sar/280/180',
    status: '可申请'
  },
  {
    id: 2,
    name: '2005-2012年中国区域IRS-P6-LISS3原始遥感影像数据集',
    source: 'IRS-P6',
    resolution: '23.5m',
    cloudCover: '10%',
    sceneCount: '7,869',
    dataSize: '1.28TB',
    views: 5310,
    downloads: 23,
    captureTime: '2005-01 ~ 2012-12',
    thumbnail: 'https://picsum.photos/seed/rs-liss3/280/180',
    status: '可申请'
  },
  {
    id: 3,
    name: '2005-2012年中国区域IRS-P6-AWIFS原始遥感影像数据集',
    source: 'IRS-P6',
    resolution: '56m',
    cloudCover: '8%',
    sceneCount: '2,295',
    dataSize: '1.12TB',
    views: 2804,
    downloads: 22,
    captureTime: '2005-01 ~ 2012-12',
    thumbnail: 'https://picsum.photos/seed/rs-awifs/280/180',
    status: '可申请'
  },
  {
    id: 4,
    name: '2005-2010年中国区域IRS-P6-LISS4原始遥感影像数据集',
    source: 'IRS-P6',
    resolution: '5.8m',
    cloudCover: '12%',
    sceneCount: '14,624',
    dataSize: '3.58TB',
    views: 2848,
    downloads: 6,
    captureTime: '2005-01 ~ 2010-12',
    thumbnail: 'https://picsum.photos/seed/rs-liss4/280/180',
    status: '处理中'
  },
  {
    id: 5,
    name: 'Landsat-5 TM 原始遥感影像数据集（1986-2011）',
    source: 'Landsat-5',
    resolution: '30m',
    cloudCover: '5%',
    sceneCount: '42,459',
    dataSize: '15TB',
    views: 12450,
    downloads: 892,
    captureTime: '1986-01 ~ 2011-06',
    thumbnail: 'https://picsum.photos/seed/rs-tm/280/180',
    status: '可申请'
  },
  {
    id: 6,
    name: 'Landsat-7 ETM+ SLC-off 原始遥感影像数据集',
    source: 'Landsat-7',
    resolution: '30m',
    cloudCover: '20%',
    sceneCount: '10,209',
    dataSize: '20.05TB',
    views: 8920,
    downloads: 456,
    captureTime: '2003-05 ~ 2024-12',
    thumbnail: 'https://picsum.photos/seed/rs-etm/280/180',
    status: '可申请'
  },
  {
    id: 7,
    name: 'Sentinel-2 L1C 原始遥感影像数据集',
    source: 'Sentinel-2',
    resolution: '10m',
    cloudCover: '3%',
    sceneCount: '13,412',
    dataSize: '6.61TB',
    views: 15230,
    downloads: 1203,
    captureTime: '2015-06 ~ 2026-04',
    thumbnail: 'https://picsum.photos/seed/rs-s2l1c/280/180',
    status: '可申请'
  },
  {
    id: 8,
    name: 'MODIS 每日地表反射率产品数据集',
    source: 'MODIS',
    resolution: '250m',
    cloudCover: '-',
    sceneCount: '暂',
    dataSize: '暂',
    views: 3100,
    downloads: 78,
    captureTime: '2000-02 ~ 2026-04',
    thumbnail: 'https://picsum.photos/seed/rs-modis/280/180',
    status: '处理中'
  },
  {
    id: 9,
    name: 'HJ-1A/1B CCD 多光谱遥感影像数据集',
    source: 'HJ-1',
    resolution: '30m',
    cloudCover: '8%',
    sceneCount: '35,200',
    dataSize: '8.5TB',
    views: 6780,
    downloads: 345,
    captureTime: '2008-09 ~ 2024-12',
    thumbnail: 'https://picsum.photos/seed/rs-hj1/280/180',
    status: '可申请'
  },
  {
    id: 10,
    name: 'GF-1 WFV 宽幅多光谱影像数据集',
    source: 'GF-1',
    resolution: '16m',
    cloudCover: '6%',
    sceneCount: '28,900',
    dataSize: '12.3TB',
    views: 9100,
    downloads: 567,
    captureTime: '2013-04 ~ 2026-03',
    thumbnail: 'https://picsum.photos/seed/rs-gf1/280/180',
    status: '可申请'
  },
  {
    id: 11,
    name: 'GF-2 PMS 高分辨率多光谱影像数据集',
    source: 'GF-2',
    resolution: '4m',
    cloudCover: '4%',
    sceneCount: '18,600',
    dataSize: '25.8TB',
    views: 11200,
    downloads: 890,
    captureTime: '2014-08 ~ 2026-04',
    thumbnail: 'https://picsum.photos/seed/rs-gf2/280/180',
    status: '已申请'
  },
  {
    id: 12,
    name: 'ZY-3 三线阵立体测绘影像数据集',
    source: 'ZY-3',
    resolution: '2.1m',
    cloudCover: '7%',
    sceneCount: '9,800',
    dataSize: '18.6TB',
    views: 5600,
    downloads: 234,
    captureTime: '2012-01 ~ 2025-12',
    thumbnail: 'https://picsum.photos/seed/rs-zy3/280/180',
    status: '可申请'
  }
]

export function getRemoteImageStatsApi(): Promise<ApiResponse<RemoteImageStats>> {
  return mockRequest<RemoteImageStats>({
    totalScenes: '640,226',
    totalDataSize: '807.41TB',
    totalUsers: '77,403人',
    totalServices: '84,221',
    totalDatasets: '16',
    totalStorage: '30.15PB'
  })
}

export function getRemoteImagesApi(
  params: RemoteImageListParams
): Promise<ApiResponse<RemoteImageListResult>> {
  let filtered = mockRemoteImages.slice()

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(item => item.name.toLowerCase().includes(kw) || item.source.toLowerCase().includes(kw))
  }

  if (params.source) {
    filtered = filtered.filter(item => item.source === params.source)
  }

  const total = filtered.length
  const start = (params.page - 1) * params.pageSize
  const list = filtered.slice(start, start + params.pageSize)

  return mockRequest<RemoteImageListResult>({
    list,
    total,
    page: params.page,
    pageSize: params.pageSize
  })
}

export function getRemoteImageDetailApi(
  id: number
): Promise<ApiResponse<RemoteImageItem | null>> {
  const item = mockRemoteImages.find(i => i.id === id)
  return mockRequest<RemoteImageItem | null>(item ?? null)
}

export function applyRemoteImageApi(
  data: ApplyImageData
): Promise<ApiResponse<{ applyId: number }>> {
  const target = mockRemoteImages.find(i => i.id === data.imageId)
  if (target) {
    target.status = '已申请'
  }
  return mockRequest<{ applyId: number }>({ applyId: Date.now() })
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
// import axios from 'axios'
// import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

// // ==================== 类型定义（完全保留原有结构） ====================
// export interface ApiResponse<T> {
//   code: number
//   message: string
//   data: T
// }

// export type UserRole = 'admin' | 'researcher' | 'user'

// export type PermissionCode =
//   | 'UC01'
//   | 'UC02'
//   | 'UC03'
//   | 'UC04'
//   | 'UC05'
//   | 'UC06'
//   | 'UC07'
//   | 'UC08'
//   | 'UC09'
//   | 'UC10'
//   | 'UC11'
//   | 'UC12'
//   | 'UC13'
//   | 'UC14'
//   | 'UC15'
//   | 'UC16'
//   | 'UC17'
//   | 'UC18'

// export interface LoginParams {
//   username: string
//   password: string
//   role: UserRole
// }

// export interface RegisterParams {
//   username: string
//   password: string
//   role: UserRole
//   nickname?: string
//   phone?: string
// }

// export interface UserInfo {
//   id: number
//   username: string
//   nickname: string
//   role: UserRole
//   roleName: string
//   permissions: PermissionCode[]
// }

// export interface LoginResult {
//   token: string
//   userInfo: UserInfo
// }

// export interface StoredUser extends UserInfo {
//   password: string
//   phone?: string
//   status?: '正常' | '已禁用'
// }

// export interface FirePoint {
//   id: number
//   name: string
//   lon: number
//   lat: number
//   level: string
//   temperature: number
//   time: string
//   source: string
// }

// export interface RiskHeatPoint {
//   lon: number
//   lat: number
//   value: number
//   level: string
// }

// export interface EmergencyResource {
//   id: number
//   name: string
//   type: string
//   lon: number
//   lat: number
//   phone: string
// }

// // ==================== Axios 实例配置（对接真实后端） ====================
// const service: AxiosInstance = axios.create({
//   // 从 .env 文件读取后端地址
//   baseURL: import.meta.env.VITE_API_BASE_URL,
//   timeout: 10000
// })

// // 请求拦截器：自动携带 Token
// service.interceptors.request.use(
//   (config: InternalAxiosRequestConfig) => {
//     const token = localStorage.getItem('token')
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`
//     }
//     return config
//   },
//   error => Promise.reject(error)
// )

// // 响应拦截器：直接返回后端数据
// service.interceptors.response.use(
//   response => response.data,
//   error => Promise.reject(error)
// )

// // ==================== 核心接口（纯真实后端调用） ====================

// /**
//  * 登录接口
//  */
// export function loginApi(data: LoginParams): Promise<ApiResponse<LoginResult | null>> {
//   return service.post('/api/login', data)
// }

// /**
//  * 注册接口
//  */
// export function registerApi(data: RegisterParams): Promise<ApiResponse<LoginResult | null>> {
//   return service.post('/api/register', data)
// }

// /**
//  * 获取所有用户
//  */
// export function getUsersApi(): Promise<ApiResponse<StoredUser[]>> {
//   return service.get('/api/users')
// }

// /**
//  * 新增用户
//  */
// export function addUserApi(
//   data: {
//     username: string
//     password: string
//     role: UserRole
//     nickname?: string
//     phone?: string
//     permissions?: PermissionCode[]
//   }
// ): Promise<ApiResponse<StoredUser | null>> {
//   return service.post('/api/users', data)
// }

// /**
//  * 更新用户
//  */
// export function updateUserApi(
//   data: Partial<StoredUser> & { id: number }
// ): Promise<ApiResponse<StoredUser | null>> {
//   return service.put(`/api/users/${data.id}`, data)
// }

// /**
//  * 删除用户
//  */
// export function deleteUserApi(id: number): Promise<ApiResponse<null>> {
//   return service.delete(`/api/users/${id}`)
// }

// // ==================== 业务数据接口 ====================

// /**
//  * 获取火点数据
//  */
// export function getFirePointsApi(): Promise<ApiResponse<FirePoint[]>> {
//   return service.get('/api/fire-points')
// }

// /**
//  * 获取火险等级热力数据
//  */
// export function getRiskHeatApi(): Promise<ApiResponse<RiskHeatPoint[]>> {
//   return service.get('/api/risk-heat')
// }

// /**
//  * 获取应急资源数据
//  */
// export function getEmergencyResourcesApi(): Promise<ApiResponse<EmergencyResource[]>> {
//   return service.get('/api/emergency-resources')
// }

// // ==================== 工具函数（保持不变） ====================
// export function getCurrentUser(): UserInfo | null {
//   const userInfoStr = localStorage.getItem('userInfo')
//   if (!userInfoStr) return null
//   try {
//     return JSON.parse(userInfoStr) as UserInfo
//   } catch {
//     return null
//   }
// }

// export function hasPermission(permission: PermissionCode): boolean {
//   const userInfo = getCurrentUser()
//   if (!userInfo) return false
//   return userInfo.permissions.includes(permission)
// }

// export default service