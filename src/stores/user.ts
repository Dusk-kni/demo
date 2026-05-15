import { ref } from 'vue'
import type { UserInfo, PermissionCode } from '../api'

const userInfo = ref<UserInfo | null>(loadUserFromStorage())

function loadUserFromStorage(): UserInfo | null {
  const userInfoStr = localStorage.getItem('userInfo')

  if (!userInfoStr) return null

  try {
    return JSON.parse(userInfoStr) as UserInfo
  } catch {
    return null
  }
}

function setUser(info: UserInfo): void {
  userInfo.value = info
  localStorage.setItem('userInfo', JSON.stringify(info))
}

function clearUser(): void {
  userInfo.value = null
  localStorage.removeItem('userInfo')
  localStorage.removeItem('token')
}

function refreshUser(): void {
  userInfo.value = loadUserFromStorage()
}

function hasPermission(permission: PermissionCode): boolean {
  if (!userInfo.value) return false

  return userInfo.value.permissions.includes(permission)
}

export function useUserStore() {
  return {
    userInfo,
    setUser,
    clearUser,
    refreshUser,
    hasPermission
  }
}
