<template>
  <div class="page-container">
    <div class="page-title">应急资源管理</div>

    <div class="card">
      <el-button v-if="canUpload" type="primary">应急资源上传</el-button>
      <el-button type="success">应急资源查询</el-button>
      <el-button v-if="canDispatch" type="warning">应急资源调度</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="资源名称" />
        <el-table-column prop="type" label="资源类型" />
        <el-table-column prop="location" label="位置" />
        <el-table-column prop="phone" label="联系电话" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const { hasPermission } = useUserStore()

const canUpload = computed<boolean>(() => hasPermission('UC08'))
const canDispatch = computed<boolean>(() => hasPermission('UC10'))


const tableData = [
  {
    name: '凉山消防站',
    type: '消防站',
    location: '四川凉山',
    phone: '119'
  },
  {
    name: '应急水源点A',
    type: '水源',
    location: '四川凉山西部林区',
    phone: '-'
  }
]
</script>
