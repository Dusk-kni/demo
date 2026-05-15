<template>
  <div class="page-container">
    <div class="page-title">遥感影像管理</div>

    <div class="card">
      <el-button v-if="canUpload" type="primary">遥感影像上传</el-button>
      <el-button type="success">遥感影像查询</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="影像名称" />
        <el-table-column prop="source" label="数据源" />
        <el-table-column prop="resolution" label="分辨率" />
        <el-table-column prop="cloud" label="云量" />
        <el-table-column prop="time" label="拍摄时间" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const { hasPermission } = useUserStore()

const canUpload = computed<boolean>(() => hasPermission('UC13'))


const tableData = [
  {
    name: 'Sentinel-2_20260401_四川凉山',
    source: 'Sentinel-2',
    resolution: '10m',
    cloud: '8%',
    time: '2026-04-01'
  },
  {
    name: 'Landsat-9_20260403_四川甘孜',
    source: 'Landsat-9',
    resolution: '30m',
    cloud: '15%',
    time: '2026-04-03'
  }
]
</script>
