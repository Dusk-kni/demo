<template>
  <div class="page-container">
    <div class="page-title">系统运维管理</div>

    <div class="card">
      <el-button type="primary">系统日志查看</el-button>
      <el-button type="danger">数据库备份</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="user" label="操作用户" />
        <el-table-column prop="action" label="操作内容" />
        <el-table-column prop="ip" label="IP地址" />
        <el-table-column prop="time" label="操作时间" />
      </el-table>
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
