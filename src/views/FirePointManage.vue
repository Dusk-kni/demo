<template>
  <div class="page-container">
    <div class="page-title">火点数据管理</div>

    <div class="card">
      <el-button
        v-if="canUpload"
        type="primary"
      >
        火点数据上传
      </el-button>

      <el-button
        v-if="canAudit"
        type="warning"
      >
        火点数据审核
      </el-button>

      <el-button type="success">火点数据查询</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="火点名称" />
        <el-table-column prop="lon" label="经度" />
        <el-table-column prop="lat" label="纬度" />
        <el-table-column prop="level" label="等级">
          <template #default="{ row }">
            <el-tag :type="row.level === '高' ? 'danger' : 'warning'">
              {{ row.level }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="source" label="数据来源" />
        <el-table-column prop="status" label="审核状态" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const { hasPermission } = useUserStore()

const canUpload = computed<boolean>(() => hasPermission('UC05'))
const canAudit = computed<boolean>(() => hasPermission('UC06'))

const tableData = [
  {
    name: '火点001',
    lon: 102.25,
    lat: 27.88,
    level: '高',
    source: 'Sentinel-2',
    status: '已审核'
  },
  {
    name: '火点002',
    lon: 103.05,
    lat: 28.12,
    level: '中',
    source: 'MODIS',
    status: '待审核'
  }
]
</script>


