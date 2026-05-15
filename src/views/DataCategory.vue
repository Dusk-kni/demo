<template>
  <div class="page-container">
    <div class="page-title">数据分类管理</div>

    <div class="card">
      <el-button type="primary">新增分类</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="name" label="分类名称" />
        <el-table-column prop="code" label="分类编码" />
        <el-table-column prop="desc" label="描述" />
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button size="small" type="primary">编辑</el-button>
            <el-button size="small" type="danger">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
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
