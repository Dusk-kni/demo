<template>
  <div class="page-container">
    <div class="page-title">遥感影像管理</div>

    <div class="card" style="display:flex; gap:8px;">
      <button v-if="canUpload" class="btn btn--primary">遥感影像上传</button>
      <button class="btn btn--success">遥感影像查询</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>影像名称</th>
            <th>数据源</th>
            <th>分辨率</th>
            <th>云量</th>
            <th>拍摄时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.source }}</td>
            <td>{{ row.resolution }}</td>
            <td>{{ row.cloud }}</td>
            <td>{{ row.time }}</td>
          </tr>
        </tbody>
      </table>
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
</style>
