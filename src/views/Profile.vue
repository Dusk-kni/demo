<template>
  <div class="page-container">
    <div class="page-title">个人信息</div>

    <div class="card">
      <h3 class="desc-title">当前用户信息</h3>

      <div class="desc-list">
        <div class="desc-row">
          <div class="desc-label">用户名</div>
          <div class="desc-value">{{ userInfo?.username }}</div>
        </div>

        <div class="desc-row">
          <div class="desc-label">用户角色</div>
          <div class="desc-value">{{ userInfo?.roleName }}</div>
        </div>

        <div class="desc-row">
          <div class="desc-label">角色编码</div>
          <div class="desc-value">{{ userInfo?.role }}</div>
        </div>

        <div class="desc-row">
          <div class="desc-label">权限数量</div>
          <div class="desc-value">{{ userInfo?.permissions.length }}</div>
        </div>

        <div class="desc-row">
          <div class="desc-label">权限列表</div>
          <div class="desc-value">
            <span
              v-for="item in userInfo?.permissions"
              :key="item"
              class="tag"
            >
              {{ item }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { getCurrentUser } from '../api'

const userInfo = computed(() => getCurrentUser())
</script>

<style scoped>
.desc-title {
  margin: 0 0 16px;
  font-size: 16px;
  color: #303133;
}

.desc-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.desc-row {
  display: flex;
  border-bottom: 1px solid #ebeef5;
}

.desc-row:last-child {
  border-bottom: none;
}

.desc-label {
  width: 120px;
  padding: 12px 16px;
  background: #fafafa;
  font-weight: 500;
  color: #606266;
  font-size: 14px;
  flex-shrink: 0;
}

.desc-value {
  flex: 1;
  padding: 12px 16px;
  color: #303133;
  font-size: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
  border-radius: 4px;
  font-size: 12px;
  line-height: 20px;
}
</style>
