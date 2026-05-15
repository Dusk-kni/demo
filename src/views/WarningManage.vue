<template>
  <div class="page-container">
    <div class="page-title">火险预警管理</div>

    <div class="card">
      <el-button v-if="canPublish" type="danger">预警数据发布</el-button>
      <el-button type="success">预警信息查看</el-button>
    </div>

    <div class="card">
      <el-table :data="tableData" border stripe>
        <el-table-column prop="title" label="预警标题" />
        <el-table-column prop="level" label="预警等级">
          <template #default="{ row }">
            <el-tag type="danger">{{ row.level }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="area" label="发布区域" />
        <el-table-column prop="time" label="发布时间" />
      </el-table>
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
