<template>
  <div class="page-container">
    <div class="page-title">数据分类管理</div>

    <div class="card">
      <button class="btn btn--primary">新增分类</button>
    </div>

    <div class="card">
      <table class="table">
        <thead>
          <tr>
            <th>分类名称</th>
            <th>分类编码</th>
            <th>描述</th>
            <th style="width:180px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData" :key="row.code">
            <td>{{ row.name }}</td>
            <td>{{ row.code }}</td>
            <td>{{ row.desc }}</td>
            <td>
              <div class="action-group">
                <button class="btn btn--primary btn--small">编辑</button>
                <button class="btn btn--danger btn--small">删除</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
const tableData = [
  {
    name: '火点数据',
    code: 'FIRE_POINT',
    desc: '遥感识别与人工审核后的火点矢量数据'
  },
  {
    name: '遥感影像',
    code: 'REMOTE_IMAGE',
    desc: 'Sentinel、Landsat、MODIS 等多源遥感影像'
  },
  {
    name: '应急资源',
    code: 'EMERGENCY_RESOURCE',
    desc: '消防站、水源、直升机坪等应急资源数据'
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

.action-group {
  display: flex;
  gap: 6px;
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

.btn--small {
  padding: 5px 10px;
  font-size: 12px;
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
