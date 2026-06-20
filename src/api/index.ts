import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios'

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

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
}

export interface LoginResult {
  token: string
  userInfo: UserInfo
}

// ==================== 数据分类管理接口 ====================

export interface DataCategory {
  cate_id: number
  cate_name: string
  description: string
}

export interface DataCategoryCreate {
  cate_name: string
  description?: string
}

/**
 * 获取数据分类列表
 */
export function getCategoriesApi(): Promise<ApiResponse<DataCategory[]>> {
  return service.get('/category/list')
}

/**
 * 创建数据分类
 */
export function createCategoryApi(data: DataCategoryCreate): Promise<ApiResponse<any>> {
  return service.post('/category/create', data)
}

/**
 * 更新数据分类
 */
export function updateCategoryApi(data: { cate_id: number; cate_name?: string; description?: string }): Promise<ApiResponse<any>> {
  return service.put('/category/update', data)
}

/**
 * 删除数据分类
 */
export function deleteCategoryApi(cate_id: number): Promise<ApiResponse<any>> {
  return service.delete('/category/delete', { params: { cate_id } })
}

// ==================== 火点数据管理接口 ====================

export interface FirePoint {
  fid: number
  latitude: number
  longitude: number
  lat: number
  lon: number
  level?: string
  name?: string
  temperature?: number
  time?: string
  source?: string
  brightness?: number
  confidence?: string
  acq_date?: string
  audit_status?: string
}

/**
 * 获取火点列表
 */
export function getFirePointsApi(skip = 0, limit = 10): Promise<ApiResponse<FirePoint[]>> {
  return service.get('/fire/list', { params: { skip, limit } })
}

/**
 * 上传火点数据
 */
export function createFirePointApi(data: Omit<FirePoint, 'fid'>): Promise<ApiResponse<any>> {
  return service.post('/fire/upload', data)
}

/**
 * 审核火点数据
 */
export function checkFirePointApi(fid: number, status: string): Promise<ApiResponse<any>> {
  return service.post('/fire/check', { fid, status })
}

// ==================== 应急资源管理接口 ====================

export interface EmergencyResource {
  region: string
  code: string
  res_id: number
  name: string
  type: string
  latitude: number
  longitude: number
  lat: number
  lon: number
  phone?: string
  status?: string
}

/**
 * 获取应急资源列表
 */
export function getEmergencyResourcesApi(): Promise<ApiResponse<EmergencyResource[]>> {
  return service.get('/resource/list')
}

// ==================== 火险热力接口 ====================

export interface RiskHeatPoint {
  lat: number
  lon: number
  value: number
  level: string
}

/**
 * 获取火险热力数据
 */
export function getRiskHeatApi(): Promise<ApiResponse<RiskHeatPoint[]>> {
  return service.get('/risk/heat')
}

/**
 * 上传应急资源
 */
export function createResourceApi(data: Omit<EmergencyResource, 'res_id'>): Promise<ApiResponse<any>> {
  return service.post('/resource/upload', data)
}

/**
 * 调度应急资源
 */
export function dispatchResourceApi(data: {
  res_id: number
  dispatch_location: string
  dispatch_quantity: number
  dispatch_reason: string
}): Promise<ApiResponse<any>> {
  return service.post('/resource/dispatch', data)
}

// ==================== 系统运维管理接口 ====================

export interface SystemLog {
  log_id: number
  operation: string
  operate_time: string
}

export interface DataBackup {
  backup_id: number
  backup_name: string
  backup_path: string
  backup_time: string
}

/**
 * 获取系统日志
 */
export function getLogsApi(): Promise<ApiResponse<SystemLog[]>> {
  return service.get('/log/list')
}

/**
 * 获取备份列表
 */
export function getBackupsApi(): Promise<ApiResponse<DataBackup[]>> {
  return service.get('/backup/list')
}

/**
 * 创建备份
 */
export function createBackupApi(admin_id: number, name: string, path: string): Promise<ApiResponse<any>> {
  return service.post('/backup/create', { admin_id, name, path })
}

const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
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
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('userInfo')
      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== 用户管理接口 ====================

export interface StoredUser extends UserInfo {
  password: string
  phone?: string
  email?: string
  status?: '正常' | '已禁用'
}

/**
 * 获取所有用户
 */
export function getUsersApi(): Promise<ApiResponse<StoredUser[]>> {
  return service.get('/user/list')
}

/**
 * 新增用户
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
  return service.post('/user/create', data)
}

/**
 * 更新用户
 */
export function updateUserApi(
  data: Partial<StoredUser> & { id: number }
): Promise<ApiResponse<StoredUser | null>> {
  return service.put('/user/update', data)
}

/**
 * 删除用户
 */
export function deleteUserApi(id: number): Promise<ApiResponse<null>> {
  return service.delete('/user/delete', { params: { id } })
}

// ==================== 认证接口 ====================

/**
 * 用户登录
 */
export function loginApi(
  data: LoginParams
): Promise<ApiResponse<LoginResult | null>> {
  return service.post('/auth/login', data)
}

/**
 * 用户注册
 */
export function registerApi(
  data: RegisterParams
): Promise<ApiResponse<LoginResult | null>> {
  return service.post('/auth/register', data)
}

/* ---------- 保持原有的 getCurrentUser ---------- */
export function getCurrentUser(): UserInfo | null {
  const userInfoStr = localStorage.getItem('userInfo')

  if (!userInfoStr) return null

  try {
    return JSON.parse(userInfoStr) as UserInfo
  } catch {
    return null
  }
}

/* ---------- 遥感影像管理接口 ---------- */

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

/**
 * 获取遥感影像统计数据
 */
export function getRemoteImageStatsApi(): Promise<ApiResponse<RemoteImageStats>> {
  return service.get('/remote-image/stats')
}

/**
 * 获取遥感影像列表
 */
export function getRemoteImagesApi(
  params: RemoteImageListParams
): Promise<ApiResponse<RemoteImageListResult>> {
  return service.get('/remote-image/list', { params })
}

/**
 * 获取遥感影像详情
 */
export function getRemoteImageDetailApi(
  id: number
): Promise<ApiResponse<RemoteImageItem | null>> {
  return service.get('/remote-image/detail', { params: { id } })
}

/**
 * 申请遥感影像数据
 */
export function applyRemoteImageApi(
  data: ApplyImageData
): Promise<ApiResponse<{ applyId: number }>> {
  return service.post('/remote-image/apply', data)
}

export default service