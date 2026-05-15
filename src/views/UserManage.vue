<template>
  <div class="page-container">
    <div class="page-title">用户与权限管理</div>

    <div class="card" style="display:flex; gap:8px;">
      <el-button type="primary" @click="openAdd">新增用户</el-button>
      <el-button type="success" @click="refreshUsers">刷新列表</el-button>
    </div>

    <div class="card">
      <el-table :data="users" border stripe>
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="roleName" label="角色" />
        <el-table-column prop="phone" label="联系电话" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '正常' ? 'success' : 'danger'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="360">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="warning" @click="openAssignPerms(row)">分配权限</el-button>
            <el-button
              size="small"
              :type="row.status === '正常' ? 'danger' : 'success'"
              @click="toggleStatus(row)"
            >
              {{ row.status === '正常' ? '禁用' : '启用' }}
            </el-button>
            <el-button size="small" type="danger" @click="confirmDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑用户弹窗 -->
    <el-dialog v-model="userDialogVisible" :title="form.id ? '编辑用户' : '新增用户'">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" :disabled="!!form.id" />
        </el-form-item>

        <el-form-item label="密码" :prop="form.id ? '' : 'password'">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="创建用户请填写，编辑时不改则留空"
            show-password
          />
        </el-form-item>

        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="系统管理员" value="admin" />
            <el-option label="科研人员" value="researcher" />
            <el-option label="普通用户" value="user" />
          </el-select>
        </el-form-item>

        <el-form-item label="昵称" prop="nickname">
          <el-input v-model="form.nickname" />
        </el-form-item>

        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="form.phone" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="userDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveUser">确定</el-button>
      </template>
    </el-dialog>

    <!-- 权限分配弹窗 -->
    <el-dialog v-model="permDialogVisible" title="分配权限" width="520px">
      <div style="margin-bottom:12px">为用户 <strong>{{ currentAssignUsername }}</strong> 分配权限：</div>

      <el-checkbox-group v-model="selectedPerms">
        <el-row :gutter="12">
          <el-col v-for="p in allPermissions" :key="p.code" :span="12">
            <el-checkbox :label="p.code">{{ p.label }}</el-checkbox>
          </el-col>
        </el-row>
      </el-checkbox-group>

      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="savePerms">保存权限</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import {
  getUsersApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
  StoredUser,
  PermissionCode,
  UserRole
} from '../api'

const users = ref<StoredUser[]>([])

const userDialogVisible = ref(false)
const permDialogVisible = ref(false)

const formRef = ref<FormInstance>()
const form = reactive<{
  id?: number
  username: string
  password?: string
  role?: UserRole
  nickname?: string
  phone?: string
}>({
  id: undefined,
  username: '',
  password: '',
  role: 'user',
  nickname: '',
  phone: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

// 权限列表（可根据需要完善描述）
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
    ElMessage.error(res.message || '加载用户失败')
  }
}

onMounted(() => {
  loadUsers()
})

function refreshUsers() {
  loadUsers()
  ElMessage.success('已刷新用户列表')
}

function openAdd() {
  form.id = undefined
  form.username = ''
  form.password = ''
  form.role = 'user'
  form.nickname = ''
  form.phone = ''
  userDialogVisible.value = true
}

function openEdit(row: StoredUser) {
  form.id = row.id
  form.username = row.username
  form.password = ''
  form.role = row.role
  form.nickname = row.nickname
  form.phone = row.phone
  userDialogVisible.value = true
}

async function saveUser() {
  if (!formRef.value) return

  // el-form 的 validate 回调写法（与 Login.vue 保持一致）
  formRef.value.validate(async valid => {
    if (!valid) return

    if (form.id) {
      // 编辑
      const payload: Partial<StoredUser> & { id: number } = {
        id: form.id,
        nickname: form.nickname,
        phone: form.phone,
        role: form.role
      }
      // 只有在填写密码时才更新密码
      if (form.password) {
        payload.password = form.password
      }

      const res = await updateUserApi(payload)
      if (res.code === 200 && res.data) {
        ElMessage.success('用户更新成功')
        userDialogVisible.value = false
        loadUsers()
      } else {
        ElMessage.error(res.message || '更新失败')
      }
    } else {
      // 新增
      if (!form.password) {
        ElMessage.error('请填写密码')
        return
      }

      const res = await addUserApi({
        username: form.username,
        password: form.password!,
        role: form.role!,
        nickname: form.nickname,
        phone: form.phone
      })

      if (res.code === 200 && res.data) {
        ElMessage.success('新增用户成功')
        userDialogVisible.value = false
        loadUsers()
      } else {
        ElMessage.error(res.message || '新增失败')
      }
    }
  })
}

async function toggleStatus(row: StoredUser) {
  const newStatus = row.status === '正常' ? '已禁用' : '正常'
  const res = await updateUserApi({ id: row.id, status: newStatus })
  if (res.code === 200) {
    ElMessage.success(`用户已${newStatus === '正常' ? '启用' : '禁用'}`)
    loadUsers()
  } else {
    ElMessage.error(res.message || '操作失败')
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
    ElMessage.success('删除成功')
    loadUsers()
  } else {
    ElMessage.error(res.message || '删除失败')
  }
}

function openAssignPerms(row: StoredUser) {
  currentAssignUserId.value = row.id
  currentAssignUsername.value = row.username
  selectedPerms.value = Array.isArray(row.permissions) ? [...row.permissions] : []
  permDialogVisible.value = true
}

async function savePerms() {
  if (!currentAssignUserId.value) return

  const res = await updateUserApi({
    id: currentAssignUserId.value,
    permissions: selectedPerms.value
  })

  if (res.code === 200) {
    ElMessage.success('权限保存成功')
    permDialogVisible.value = false
    loadUsers()
  } else {
    ElMessage.error(res.message || '保存权限失败')
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
}
</style>
