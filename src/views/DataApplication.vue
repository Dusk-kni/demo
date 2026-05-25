<template>
  <div class="page-container">
    <div class="page-title">数据申请服务</div>

    <div class="card" style="display:flex; gap:8px;">
      <button class="btn btn--primary">数据使用申请</button>
      <button v-if="canManage" class="btn btn--success">申请记录管理</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>申请数据</th>
            <th>申请人</th>
            <th>使用目的</th>
            <th>审核状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.dataName">
            <td>{{ row.dataName }}</td>
            <td>{{ row.applicant }}</td>
            <td>{{ row.purpose }}</td>
            <td>
              <span class="tag" :class="row.status === '已通过' ? 'tag--success' : 'tag--warning'">
                {{ row.status }}
              </span>
            </td>
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

const canManage = computed<boolean>(() => hasPermission('UC16'))

const tableData = [
  {
    dataName: '四川凉山 Sentinel-2 影像',
    applicant: 'researcher',
    purpose: '森林火点识别研究',
    status: '待审核'
  },
  {
    dataName: '火险等级历史数据',
    applicant: 'user',
    purpose: '区域防火学习',
    status: '已通过'
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

.tag--success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.tag--warning {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
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
