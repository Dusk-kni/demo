<template>
  <div class="page-container">
    <div class="page-title">火险预警管理</div>

    <div class="card" style="display:flex; gap:8px;">
      <button v-if="canPublish" class="btn btn--danger">预警数据发布</button>
      <button class="btn btn--success">预警信息查看</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>预警标题</th>
            <th>预警等级</th>
            <th>发布区域</th>
            <th>发布时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.title">
            <td>{{ row.title }}</td>
            <td>
              <span class="tag tag--danger">{{ row.level }}</span>
            </td>
            <td>{{ row.area }}</td>
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

const canPublish = computed<boolean>(() => hasPermission('UC11'))

const tableData = [
  {
    title: '凉山州森林火险橙色预警',
    level: '橙色预警',
    area: '四川省凉山州',
    time: '2026-04-06 15:30:00'
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

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
}

.tag--danger {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
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

.btn--danger {
  background: #f56c6c;
  color: #fff;
}

.btn--danger:hover {
  background: #e64242;
}

.btn--success {
  background: #1f8f45;
  color: #fff;
}

.btn--success:hover {
  background: #1a7d3c;
}
</style>
