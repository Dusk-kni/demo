<template>
  <div class="page-container">
    <div class="page-title">数据申请服务</div>

    <div class="card">
      <el-button type="primary">数据使用申请</el-button>
      <el-button v-if="canManage" type="success">申请记录管理</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="dataName" label="申请数据" />
        <el-table-column prop="applicant" label="申请人" />
        <el-table-column prop="purpose" label="使用目的" />
        <el-table-column prop="status" label="审核状态">
          <template #default="{ row }">
            <el-tag :type="row.status === '已通过' ? 'success' : 'warning'">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
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
