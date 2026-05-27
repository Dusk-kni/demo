<template>
  <div class="page-container">
    <div class="page-title">用户与权限管理</div>

    <div class="card" style="display:flex; gap:8px;">
      <button class="btn btn--primary" @click="openAdd">新增用户</button>
      <button class="btn btn--success" @click="refreshUsers">刷新列表</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>用户名</th>
            <th>角色</th>
            <th>联系电话</th>
            <th>状态</th>
            <th style="width:360px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in users" :key="row.id">
            <td>{{ row.username }}</td>
            <td>{{ row.roleName }}</td>
            <td>{{ row.phone }}</td>
            <td>
              <span class="tag" :class="row.status === '正常' ? 'tag--success' : 'tag--danger'">
                {{ row.status }}
              </span>
            </td>
            <td>
              <div class="action-group">
                <button class="btn btn--primary btn--small" @click="openEdit(row)">编辑</button>
                <button class="btn btn--warning btn--small" @click="openAssignPerms(row)">分配权限</button>
                <button
                  class="btn btn--small"
                  :class="row.status === '正常' ? 'btn--danger' : 'btn--success'"
                  @click="toggleStatus(row)"
                >
                  {{ row.status === '正常' ? '禁用' : '启用' }}
                </button>
                <button class="btn btn--danger btn--small" @click="confirmDelete(row)">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="userDialogVisible" class="modal-overlay" @click.self="userDialogVisible = false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ form.id ? '编辑用户' : '新增用户' }}</h3>
          <button class="modal-close" @click="userDialogVisible = false">&times;</button>
        </div>

        <div class="modal-body">
          <div class="form-item" :class="{ 'has-error': formErrors.username }">
            <label class="form-label">用户名</label>
            <input
              v-model="form.username"
              class="form-input"
              :disabled="!!form.id"
              @blur="validateForm('username')"
            />
            <div v-if="formErrors.username" class="form-error">{{ formErrors.username }}</div>
          </div>

          <div class="form-item" :class="{ 'has-error': formErrors.password }">
            <label class="form-label">密码</label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="创建用户请填写，编辑时不改则留空"
              @blur="validateForm('password')"
            />
            <div v-if="formErrors.password" class="form-error">{{ formErrors.password }}</div>
          </div>

          <div class="form-item">
            <label class="form-label">昵称</label>
            <input v-model="form.nickname" class="form-input" />
          </div>

          <div class="form-item">
            <label class="form-label">联系电话</label>
            <input v-model="form.phone" class="form-input" />
          </div>

          <div class="form-item">
            <label class="form-label">邮箱</label>
            <input v-model="form.email" class="form-input" placeholder="请输入邮箱" />
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn--default" @click="userDialogVisible = false">取消</button>
          <button class="btn btn--primary" @click="saveUser">确定</button>
        </div>
      </div>
    </div>

    <div v-if="permDialogVisible" class="modal-overlay" @click.self="permDialogVisible = false">
      <div class="modal" style="width:560px">
        <div class="modal-header">
          <h3>分配权限</h3>
          <button class="modal-close" @click="permDialogVisible = false">&times;</button>
        </div>

        <div class="modal-body">
          <div style="margin-bottom:12px">为用户 <strong>{{ currentAssignUsername }}</strong> 分配权限：</div>

          <div class="perm-grid">
            <label
              v-for="p in allPermissions"
              :key="p.code"
              class="checkbox-item"
            >
              <input
                type="checkbox"
                :value="p.code"
                :checked="selectedPerms.includes(p.code)"
                @change="togglePerm(p.code)"
              />
              <span>{{ p.label }}</span>
            </label>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn--default" @click="permDialogVisible = false">取消</button>
          <button class="btn btn--primary" @click="savePerms">保存权限</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { Message } from '../utils/message'
import {
  getUsersApi,
  addUserApi,
  updateUserApi,
  deleteUserApi
} from '../api'
import type { StoredUser, PermissionCode } from '../api'

const users = ref<StoredUser[]>([])

const userDialogVisible = ref(false)
const permDialogVisible = ref(false)

interface FormState {
  id?: number
  username: string
  password?: string
  nickname?: string
  phone?: string
  email?: string
}

interface FormErrorState {
  username?: string
  password?: string
}

const form = reactive<FormState>({
  id: undefined,
  username: '',
  password: '',
  nickname: '',
  phone: '',
  email: ''
})

const formErrors = reactive<FormErrorState>({})

const allPermissions: { code: PermissionCode; label: string }[] = [
  { code: 'UC01', label: '基础数据查看 (UC01)' },
  { code: 'UC02', label: '统计视图 (UC02)' },
  { code: 'UC03', label: '用户与权限管理 (UC03)' },
  { code: 'UC04', label: '数据分类管理 (UC04)' },
  { code: 'UC05', label: '火点上传 (UC05)' },
  { code: 'UC06', label: '火点审核 (UC06)' },
  { code: 'UC07', label: '火点查看 / GIS (UC07)' },
  { code: 'UC08', label: '应急资源上传 (UC08)' },
  { code: 'UC09', label: '应急资源查看 / GIS (UC09)' },
  { code: 'UC10', label: '资源调度 (UC10)' },
  { code: 'UC11', label: '预警发布 (UC11)' },
  { code: 'UC12', label: '火险展示 (UC12)' },
  { code: 'UC13', label: '遥感影像上传 (UC13)' },
  { code: 'UC14', label: '遥感影像管理 (UC14)' },
  { code: 'UC15', label: '数据申请 (UC15)' },
  { code: 'UC16', label: '申请管理 (UC16)' },
  { code: 'UC17', label: '系统运维 (UC17)' },
  { code: 'UC18', label: '备份恢复 (UC18)' }
]

const selectedPerms = ref<PermissionCode[]>([])
const currentAssignUserId = ref<number | null>(null)
const currentAssignUsername = ref<string>('')

async function loadUsers() {
  const res = await getUsersApi()
  if (res.code === 200) {
    users.value = res.data
  } else {
    Message.error(res.message || '加载用户失败')
  }
}

onMounted(() => {
  loadUsers()
})

function refreshUsers() {
  loadUsers()
  Message.success('已刷新用户列表')
}

function openAdd() {
  form.id = undefined
  form.username = ''
  form.password = ''
  form.nickname = ''
  form.phone = ''
  form.email = ''
  formErrors.username = undefined
  formErrors.password = undefined
  userDialogVisible.value = true
}

function openEdit(row: StoredUser) {
  form.id = row.id
  form.username = row.username
  form.password = ''
  form.nickname = row.nickname
  form.phone = row.phone
  form.email = row.email ?? ''
  formErrors.username = undefined
  formErrors.password = undefined
  userDialogVisible.value = true
}

function validateForm(field: keyof FormErrorState): boolean {
  if (field === 'username') {
    if (!form.username.trim()) {
      formErrors.username = '请输入用户名'
      return false
    }
    formErrors.username = undefined
  }

  if (field === 'password') {
    if (!form.id && !form.password?.trim()) {
      formErrors.password = '请输入密码'
      return false
    }
    formErrors.password = undefined
  }

  return true
}

function validateAllForm(): boolean {
  const u = validateForm('username')
  const p = validateForm('password')
  return u && p
}

async function saveUser() {
  if (!validateAllForm()) return

  if (form.id) {
    const payload: Partial<StoredUser> & { id: number } = {
      id: form.id,
      nickname: form.nickname,
      phone: form.phone,
      email: form.email
    }
    if (form.password) {
      payload.password = form.password
    }

    const res = await updateUserApi(payload)
    if (res.code === 200 && res.data) {
      Message.success('用户更新成功')
      userDialogVisible.value = false
      loadUsers()
    } else {
      Message.error(res.message || '更新失败')
    }
  } else {
    if (!form.password) {
      Message.error('请填写密码')
      return
    }

    const res = await addUserApi({
      username: form.username,
      password: form.password!,
      nickname: form.nickname,
      phone: form.phone,
      email: form.email
    })

    if (res.code === 200 && res.data) {
      Message.success('新增用户成功')
      userDialogVisible.value = false
      loadUsers()
    } else {
      Message.error(res.message || '新增失败')
    }
  }
}

async function toggleStatus(row: StoredUser) {
  const newStatus = row.status === '正常' ? '已禁用' : '正常'
  const res = await updateUserApi({ id: row.id, status: newStatus })
  if (res.code === 200) {
    Message.success(`用户已${newStatus === '正常' ? '启用' : '禁用'}`)
    loadUsers()
  } else {
    Message.error(res.message || '操作失败')
  }
}

function confirmDelete(row: StoredUser) {
  const ok = window.confirm(`确认删除用户 "${row.username}" 吗？此操作不可恢复。`)
  if (!ok) return
  deleteUser(row.id)
}

async function deleteUser(id: number) {
  const res = await deleteUserApi(id)
  if (res.code === 200) {
    Message.success('删除成功')
    loadUsers()
  } else {
    Message.error(res.message || '删除失败')
  }
}

function openAssignPerms(row: StoredUser) {
  currentAssignUserId.value = row.id
  currentAssignUsername.value = row.username
  selectedPerms.value = Array.isArray(row.permissions) ? [...row.permissions] : []
  permDialogVisible.value = true
}

function togglePerm(code: PermissionCode) {
  const idx = selectedPerms.value.indexOf(code)
  if (idx === -1) {
    selectedPerms.value.push(code)
  } else {
    selectedPerms.value.splice(idx, 1)
  }
}

async function savePerms() {
  if (!currentAssignUserId.value) return

  const res = await updateUserApi({
    id: currentAssignUserId.value,
    permissions: selectedPerms.value
  })

  if (res.code === 200) {
    Message.success('权限保存成功')
    permDialogVisible.value = false
    loadUsers()
  } else {
    Message.error(res.message || '保存权限失败')
  }
}
</script>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th,
.table td {
  padding: 10px 12px;
  border: 1px solid #ebeef5;
  text-align: left;
}

.table th {
  background: #fafafa;
  font-weight: 600;
  color: #303133;
}

.table tbody tr:nth-child(even) {
  background: #fafafa;
}

.table tbody tr:hover {
  background: #f0f9eb;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
}

.tag--success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.tag--danger {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.tag--warning {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.action-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
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
  padding: 5px 10px;
  font-size: 12px;
}

.btn--primary {
  background: #409eff;
  color: #fff;
}

.btn--primary:hover {
  background: #337ecc;
}

.btn--success {
  background: #1f8f45;
  color: #fff;
}

.btn--success:hover {
  background: #1a7d3c;
}

.btn--warning {
  background: #e6a23c;
  color: #fff;
}

.btn--warning:hover {
  background: #cf8c2e;
}

.btn--danger {
  background: #f56c6c;
  color: #fff;
}

.btn--danger:hover {
  background: #e64242;
}

.btn--default {
  background: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn--default:hover {
  color: #1f8f45;
  border-color: #1f8f45;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: #fff;
  border-radius: 8px;
  width: 520px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
}

.modal-header h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.modal-close {
  background: none;
  border: none;
  font-size: 20px;
  color: #909399;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

.modal-close:hover {
  color: #303133;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
}

.form-item {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 6px;
}

.form-input,
.form-select {
  width: 100%;
  height: 36px;
  padding: 0 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #303133;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus {
  border-color: #1f8f45;
}

.form-input:disabled {
  background: #f5f7fa;
  color: #c0c4cc;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #c0c4cc;
}

.has-error .form-input,
.has-error .form-select {
  border-color: #f56c6c;
}

.form-error {
  font-size: 12px;
  color: #f56c6c;
  margin-top: 4px;
}

.perm-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  padding: 4px 0;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1f8f45;
}
</style>
