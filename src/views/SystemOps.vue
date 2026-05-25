<template>
  <div class="page-container">
    <div class="page-title">系统运维管理</div>

    <div class="card" style="display:flex; gap:8px;">
      <button class="btn btn--primary">系统日志查看</button>
      <button class="btn btn--danger">数据库备份</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>操作用户</th>
            <th>操作内容</th>
            <th>IP地址</th>
            <th>操作时间</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.time">
            <td>{{ row.user }}</td>
            <td>{{ row.action }}</td>
            <td>{{ row.ip }}</td>
            <td>{{ row.time }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const tableData = [
  {
    user: 'admin',
    action: '登录系统',
    ip: '127.0.0.1',
    time: '2026-04-06 10:20:00'
  },
  {
    user: 'admin',
    action: '执行数据库备份',
    ip: '127.0.0.1',
    time: '2026-04-06 11:00:00'
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

.btn--danger {
  background: #f56c6c;
  color: #fff;
}

.btn--danger:hover {
  background: #e64242;
}
</style>
