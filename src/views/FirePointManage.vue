<template>
  <div class="page-container">
    <div class="page-title">火点数据管理</div>

    <div class="card" style="display:flex; gap:8px;">
      <button class="btn btn--primary">火点数据上传</button>
      <button class="btn btn--warning">火点数据审核</button>
      <button class="btn btn--success">火点数据查询</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>火点名称</th>
            <th>经度</th>
            <th>纬度</th>
            <th>等级</th>
            <th>数据来源</th>
            <th>审核状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.name">
            <td>{{ row.name }}</td>
            <td>{{ row.lon }}</td>
            <td>{{ row.lat }}</td>
            <td>
              <span class="tag" :class="row.level === '高' ? 'tag--danger' : 'tag--warning'">
                {{ row.level }}
              </span>
            </td>
            <td>{{ row.source }}</td>
            <td>{{ row.status }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
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

.btn--warning {
  background: #e6a23c;
  color: #fff;
}

.btn--warning:hover {
  background: #cf8c2e;
}

.btn--success {
  background: #1f8f45;
  color: #fff;
}

.btn--success:hover {
  background: #1a7d3c;
}
</style>
