<template>
  <div class="page-container">
    <div class="page-title">系统首页</div>

    <div class="stat-row">
      <div class="card stat-card">
        <div class="stat-value">128</div>
        <div class="stat-label">火点数据总量</div>
      </div>

      <div class="card stat-card">
        <div class="stat-value">36</div>
        <div class="stat-label">遥感影像数量</div>
      </div>

      <div class="card stat-card">
        <div class="stat-value">12</div>
        <div class="stat-label">应急资源点</div>
      </div>

      <div class="card stat-card">
        <div class="stat-value">5</div>
        <div class="stat-label">当前预警数量</div>
      </div>
    </div>

    <div class="card">
      <h3>平台说明</h3>
      <p>
        森林火灾是全球重大自然灾害，具有突发性强、蔓延快、破坏性大的特点。遥感技术凭借大范围、实时、非接触的优势，是森林火灾监测的核心手段；结合地理信息系统（GIS）的空间分析与可视化能力，可实现森林火灾早发现、早预警、早处置。
        本平台面向森林火灾监测与预警业务，支持火点数据管理、应急资源管理、火险预警发布、
        遥感影像管理、数据申请服务和系统运维管理。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.stat-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1f3f2b;
}

.stat-label {
  margin-top: 8px;
  color: #606266;
}
</style>
