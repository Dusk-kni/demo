<template>
  <div class="page-container">
    <div class="page-title">个人信息</div>

    <div class="card">
      <el-descriptions title="当前用户信息" :column="1" border>
        <el-descriptions-item label="用户名">
          {{ userInfo?.username }}
        </el-descriptions-item>

        <el-descriptions-item label="用户角色">
          {{ userInfo?.roleName }}
        </el-descriptions-item>

        <el-descriptions-item label="角色编码">
          {{ userInfo?.role }}
        </el-descriptions-item>

        <el-descriptions-item label="权限数量">
          {{ userInfo?.permissions.length }}
        </el-descriptions-item>

        <el-descriptions-item label="权限列表">
          <el-tag
            v-for="item in userInfo?.permissions"
            :key="item"
            style="margin-right: 6px; margin-bottom: 6px"
          >
            {{ item }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getCurrentUser } from '../api'

const userInfo = computed(() => getCurrentUser())
</script>
