<template>
  <div class="page-container">
    <div class="page-title">应急资源管理</div>

    <div class="card" style="display:flex; gap:8px;">
      <button class="btn btn--primary">应急资源上传</button>
      <button class="btn btn--success">应急资源查询</button>
      <button class="btn btn--warning">应急资源调度</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>资源名称</th>
            <th>资源类型</th>
            <th>位置</th>
            <th>联系电话</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.type }}</td>
            <td>{{ row.location }}</td>
            <td>{{ row.phone }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
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

.btn--warning {
  background: #e6a23c;
  color: #fff;
}

.btn--warning:hover {
  background: #cf8c2e;
}
</style>
