<template>
  <div class="remote-image-page">
    <div class="hero-banner">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-left">
          <div class="hero-text">
            <p class="hero-desc">
              森林具有覆盖范围广、地形复杂、地面监测盲区多的特点，传统地面巡检、摄像头监控难以实现全域、全天候监测，而遥感卫星（Sentinel-2/MODIS/Landsat-9 等）、航空遥感能快速获取大范围地表影像，通过影像的光谱特征（如火灾高温异常、植被燃烧的红外波段特征）可精准识别火点位置、燃烧状态。
            </p>
            <div class="stat-grid" v-if="stats">
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalScenes }}</div>
                <div class="stat-label">系统共享数据集数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalDataSize }}</div>
                <div class="stat-label">系统共享数据总量</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalUsers }}</div>
                <div class="stat-label">当前注册用户数</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalServices }}</div>
                <div class="stat-label">服务次数统计</div>
              </div>
              <div class="stat-item">
                <div class="stat-value">{{ stats.totalDatasets }}</div>
                <div class="stat-label">数据集总数</div>
              </div>
            </div>
            <div class="stat-grid" v-else>
              <div class="stat-item" v-for="n in 5" :key="n">
                <div class="stat-skeleton" style="width:100px;height:34px"></div>
                <div class="stat-skeleton" style="width:80px;height:14px;margin-top:6px"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="hero-right">
          <div class="satellite-img-wrap">
            <img class="satellite-img" src="/public/image/remotesatellite.webp" alt="卫星遥感影像" />
          </div>
          <div class="search-bar">
            <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              v-model="keyword"
              type="text"
              class="search-input"
              placeholder="输入关键词搜索遥感影像..."
              @keyup.enter="handleSearch"
            />
            <button v-if="keyword" class="search-clear" @click="clearSearch">&times;</button>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="toolbar">
        <div class="toolbar-left">
          <select v-model="sourceFilter" class="source-select" @change="handleSearch">
            <option value="">全部数据源</option>
            <option v-for="s in sourceOptions" :key="s" :value="s">{{ s }}</option>
          </select>
          <span class="result-count" v-if="!listLoading">共 {{ total }} 条结果</span>
        </div>
      </div>

      <div class="image-grid" v-if="!listLoading && imageList.length > 0">
        <div v-for="item in imageList" :key="item.id" class="image-card">
          <div class="card-thumb">
            <img :src="item.thumbnail" :alt="item.name" />
            <span class="card-status" :class="'card-status--' + item.status">{{ item.status }}</span>
          </div>
          <div class="card-body">
            <div class="card-type">原始遥感影像数据</div>
            <div class="card-meta-row">
              <span>数据景数：{{ item.sceneCount }}景</span>
              <span>数据量：{{ item.dataSize }}</span>
            </div>
            <div class="card-title" :title="item.name">{{ item.name }}</div>
            <div class="card-info-row">
              <span>数据源：{{ item.source }}</span>
              <span>分辨率：{{ item.resolution }}</span>
            </div>
            <div class="card-stats-row">
              <span>访问量：{{ item.views }}</span>
              <span>下载量：{{ item.downloads }}</span>
            </div>
            <div class="card-actions">
              <button class="btn btn--outline" @click="openDetail(item)">查看数据</button>
              <button
                class="btn btn--primary"
                :disabled="item.status !== '可申请'"
                @click="openApply(item)"
              >
                {{ item.status === '已申请' ? '已申请' : item.status === '处理中' ? '处理中' : '在线申请' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="grid-skeleton" v-if="listLoading">
        <div class="skeleton-card" v-for="n in 4" :key="n">
          <div class="skeleton-thumb"></div>
          <div class="skeleton-body">
            <div class="stat-skeleton" style="width:60%;height:14px"></div>
            <div class="stat-skeleton" style="width:90%;height:16px;margin-top:10px"></div>
            <div class="stat-skeleton" style="width:70%;height:14px;margin-top:10px"></div>
            <div class="stat-skeleton" style="width:80%;height:14px;margin-top:8px"></div>
          </div>
        </div>
      </div>

      <div class="empty-result" v-if="!listLoading && imageList.length === 0">
        <svg viewBox="0 0 64 41" width="64" height="41" style="margin-bottom:12px;opacity:0.4">
          <g fill="none" fill-rule="evenodd"><ellipse fill="#f5f5f5" cx="32" cy="33" rx="32" ry="7"/><path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z" fill="#fafafa"/><path d="M41.613 15.931c0-1.605.994-2.93 2.227-2.931H55v18.137C55 33.26 53.68 35 52.05 35h-40.1C10.32 35 9 33.259 9 31.137V13h11.16c1.233 0 2.227 1.323 2.227 2.928v.022c0 1.605 1.005 2.901 2.237 2.901h14.752c1.232 0 2.237-1.308 2.237-2.913v-.007z" fill="#f5f5f5"/></g>
        </svg>
        <p>未找到匹配的遥感影像数据</p>
        <p class="empty-sub">请尝试其他关键词或筛选条件</p>
      </div>

      <div class="pagination" v-if="total > pageSize && !listLoading">
        <button class="page-btn" :disabled="page <= 1" @click="goPage(page - 1)">上一页</button>
        <button
          v-for="p in pageNumbers"
          :key="p"
          class="page-btn"
          :class="{ active: p === page, ellipsis: p === -1 }"
          :disabled="p === -1"
          @click="p !== -1 && goPage(p)"
        >
          {{ p === -1 ? '...' : p }}
        </button>
        <button class="page-btn" :disabled="page >= totalPages" @click="goPage(page + 1)">下一页</button>
      </div>
    </div>

    <div class="modal-overlay" v-if="showDetailModal" @click.self="showDetailModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">影像数据详情</span>
          <button class="modal-close" @click="showDetailModal = false">&times;</button>
        </div>
        <div class="modal-body" v-if="detailItem">
          <div class="detail-thumb">
            <img :src="detailItem.thumbnail" :alt="detailItem.name" />
          </div>
          <div class="detail-info">
            <div class="detail-name">{{ detailItem.name }}</div>
            <div class="detail-grid">
              <div class="detail-row"><span class="detail-label">数据源</span><span class="detail-value">{{ detailItem.source }}</span></div>
              <div class="detail-row"><span class="detail-label">分辨率</span><span class="detail-value">{{ detailItem.resolution }}</span></div>
              <div class="detail-row"><span class="detail-label">云量</span><span class="detail-value">{{ detailItem.cloudCover }}</span></div>
              <div class="detail-row"><span class="detail-label">拍摄时间</span><span class="detail-value">{{ detailItem.captureTime }}</span></div>
              <div class="detail-row"><span class="detail-label">数据景数</span><span class="detail-value">{{ detailItem.sceneCount }}景</span></div>
              <div class="detail-row"><span class="detail-label">数据量</span><span class="detail-value">{{ detailItem.dataSize }}</span></div>
              <div class="detail-row"><span class="detail-label">访问量</span><span class="detail-value">{{ detailItem.views }}</span></div>
              <div class="detail-row"><span class="detail-label">下载量</span><span class="detail-value">{{ detailItem.downloads }}</span></div>
              <div class="detail-row"><span class="detail-label">状态</span><span class="detail-value"><span class="card-status" :class="'card-status--' + detailItem.status">{{ detailItem.status }}</span></span></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-overlay" v-if="showApplyModal" @click.self="showApplyModal = false">
      <div class="modal">
        <div class="modal-header">
          <span class="modal-title">在线申请</span>
          <button class="modal-close" @click="showApplyModal = false">&times;</button>
        </div>
        <div class="modal-body">
          <div class="apply-info" v-if="applyItem">
            <span class="apply-label">申请数据集：</span>{{ applyItem.name }}
          </div>
          <div class="form-group">
            <label class="form-label">用途说明 <span class="required">*</span></label>
            <textarea
              v-model="applyForm.purpose"
              class="form-textarea"
              rows="4"
              placeholder="请简要描述数据使用目的和研究方向..."
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">联系邮箱 <span class="required">*</span></label>
            <input
              v-model="applyForm.email"
              type="email"
              class="form-input"
              placeholder="example@mail.com"
            />
          </div>
          <div class="form-error" v-if="applyError">{{ applyError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--outline" @click="showApplyModal = false">取消</button>
          <button class="btn btn--primary" :disabled="applySubmitting" @click="submitApply">
            {{ applySubmitting ? '提交中...' : '确认申请' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Message } from '../utils/message'
import {
  getRemoteImageStatsApi,
  getRemoteImagesApi,
  applyRemoteImageApi,
  type RemoteImageItem,
  type RemoteImageStats
} from '../api'

const stats = ref<RemoteImageStats | null>(null)
const imageList = ref<RemoteImageItem[]>([])
const total = ref<number>(0)
const page = ref<number>(1)
const pageSize = ref<number>(8)
const keyword = ref<string>('')
const sourceFilter = ref<string>('')
const listLoading = ref<boolean>(false)
const statsLoading = ref<boolean>(false)

const showDetailModal = ref<boolean>(false)
const detailItem = ref<RemoteImageItem | null>(null)

const showApplyModal = ref<boolean>(false)
const applyItem = ref<RemoteImageItem | null>(null)
const applyForm = ref({ purpose: '', email: '' })
const applyError = ref<string>('')
const applySubmitting = ref<boolean>(false)

const sourceOptions = [
  'ERS-2',
  'IRS-P6',
  'Landsat-5',
  'Landsat-7',
  'Sentinel-2',
  'MODIS',
  'HJ-1',
  'GF-1',
  'GF-2',
  'ZY-3'
]

const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

const pageNumbers = computed(() => {
  const pages: number[] = []
  const tp = totalPages.value
  const p = page.value

  if (tp <= 7) {
    for (let i = 1; i <= tp; i++) pages.push(i)
  } else {
    pages.push(1)
    if (p > 3) pages.push(-1)
    for (let i = Math.max(2, p - 1); i <= Math.min(tp - 1, p + 1); i++) {
      pages.push(i)
    }
    if (p < tp - 2) pages.push(-1)
    pages.push(tp)
  }

  return pages
})

async function loadStats(): Promise<void> {
  statsLoading.value = true
  try {
    const res = await getRemoteImageStatsApi()
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch {
    Message.error('统计数据加载失败')
  } finally {
    statsLoading.value = false
  }
}

async function loadImages(): Promise<void> {
  listLoading.value = true
  try {
    const res = await getRemoteImagesApi({
      keyword: keyword.value || undefined,
      source: sourceFilter.value || undefined,
      page: page.value,
      pageSize: pageSize.value
    })
    if (res.code === 200) {
      imageList.value = res.data.list
      total.value = res.data.total
    }
  } catch {
    Message.error('影像数据加载失败')
  } finally {
    listLoading.value = false
  }
}

function handleSearch(): void {
  page.value = 1
  loadImages()
}

function clearSearch(): void {
  keyword.value = ''
  handleSearch()
}

function goPage(p: number): void {
  if (p < 1 || p > totalPages.value) return
  page.value = p
  loadImages()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function openDetail(item: RemoteImageItem): void {
  detailItem.value = item
  showDetailModal.value = true
}

function openApply(item: RemoteImageItem): void {
  if (item.status !== '可申请') return
  applyItem.value = item
  applyForm.value = { purpose: '', email: '' }
  applyError.value = ''
  showApplyModal.value = true
}

async function submitApply(): Promise<void> {
  if (!applyForm.value.purpose.trim()) {
    applyError.value = '请填写用途说明'
    return
  }
  if (!applyForm.value.email.trim()) {
    applyError.value = '请填写联系邮箱'
    return
  }
  const emailReg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailReg.test(applyForm.value.email)) {
    applyError.value = '请输入有效的邮箱地址'
    return
  }

  applySubmitting.value = true
  applyError.value = ''

  try {
    const res = await applyRemoteImageApi({
      imageId: applyItem.value!.id,
      purpose: applyForm.value.purpose,
      email: applyForm.value.email
    })
    if (res.code === 200) {
      Message.success('申请提交成功')
      showApplyModal.value = false
      loadImages()
    } else {
      applyError.value = res.message || '申请失败'
    }
  } catch {
    applyError.value = '网络异常，请稍后重试'
  } finally {
    applySubmitting.value = false
  }
}

onMounted(() => {
  loadStats()
  loadImages()
})
</script>

<style scoped>
.remote-image-page {
  width: 100%;
  min-height: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.hero-banner {
  position: relative;
  overflow: hidden;
  padding: 32px 36px 28px;
  color: #ffffff;
}

.hero-bg {
  position: absolute;
  inset: 0;
  background: url('/image/remote-hero.webp') center center / cover no-repeat;
  z-index: 0;
  transform: translateZ(0);
}

.hero-content {
  position: relative;
  z-index: 1;
  max-width: 1400px;
  display: flex;
  gap: 40px;
  align-items: stretch;
}

.hero-left {
  flex: 1;
  min-width: 0;
}

.hero-right {
  width: 420px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  gap: 16px;
}

.satellite-img-wrap {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.satellite-img {
  width: 100%;
  height: 220px;
  object-fit: cover;
  display: block;
}

.hero-desc {
  font-size: 20px;
  font-family: '楷体';
  line-height: 1.8;
  letter-spacing: 0.5px;
  opacity: 0.88;
  margin-bottom: 22px;
  max-width: 900px;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(5, auto);
  gap: 28px 36px;
}

.stat-item .stat-value {
  font-size: 34px;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.stat-item .stat-label {
  font-size: 15px;
  font-family: '楷体';
  margin-top: 4px;
  opacity: 0.72;
  letter-spacing: 0.5px;
  line-height: 1.4;
}

.stat-skeleton {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
}

.main-content {
  flex: 1;
  padding: 24px 36px 36px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.toolbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.source-select {
  padding: 8px 32px 8px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  color: #606266;
  background: #ffffff;
  cursor: pointer;
  outline: none;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23909399' d='M2.5 4.5l3.5 3.5 3.5-3.5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  transition: border-color 0.25s;
  letter-spacing: 0.5px;
}

.source-select:focus {
  border-color: #409eff;
}

.result-count {
  font-size: 14px;
  color: #909399;
  letter-spacing: 0.5px;
}

.search-bar {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  background: #ffffff;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 0 14px;
  transition: border-color 0.25s, box-shadow 0.25s;
}

.search-bar:focus-within {
  border-color: #409eff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.15);
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #909399;
  flex-shrink: 0;
}

.search-input {
  font-family: '楷体';
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 12px;
  font-size: 16px;
  color: #303133;
  background: transparent;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.search-input::placeholder {
  color: #c0c4cc;
}

.search-clear {
  border: none;
  background: none;
  font-size: 22px;
  color: #c0c4cc;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}

.search-clear:hover {
  color: #909399;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.image-card {
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  transition: transform 0.25s, box-shadow 0.25s;
  display: flex;
  flex-direction: column;
}

.image-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.card-thumb {
  position: relative;
  width: 100%;
  height: 170px;
  overflow: hidden;
  background: #1a1f2e;
}

.card-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s;
}

.image-card:hover .card-thumb img {
  transform: scale(1.06);
}

.card-status {
  position: absolute;
  top: 10px;
  right: 10px;
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.card-status--可申请 {
  background: rgba(103, 194, 58, 0.9);
  color: #ffffff;
}

.card-status--处理中 {
  background: rgba(230, 162, 60, 0.9);
  color: #ffffff;
}

.card-status--已申请 {
  background: rgba(144, 147, 153, 0.9);
  color: #ffffff;
}

.card-body {
  padding: 14px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.card-type {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.card-meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.5;
  letter-spacing: 0.5px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.card-stats-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #b0b3b8;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
  padding-top: 6px;
}

.btn {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 9px 0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  letter-spacing: 1px;
  line-height: 1.4;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn--outline {
  background: #ffffff;
  color: #17a2b8;
  border: 1px solid #17a2b8;
}

.btn--outline:hover:not(:disabled) {
  background: #eaf7f9;
  border-color: #138496;
  color: #138496;
}

.btn--primary {
  background: #ffffff;
  color: #52c41a;
  border: 1px solid #52c41a;
}

.btn--primary:hover:not(:disabled) {
  background: #f0faf3;
  border-color: #42ad12;
  color: #42ad12;
}

.grid-skeleton {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.skeleton-card {
  background: #ffffff;
  border-radius: 10px;
  overflow: hidden;
}

.skeleton-thumb {
  width: 100%;
  height: 170px;
  background: linear-gradient(90deg, #f0f2f5 25%, #e8eaed 50%, #f0f2f5 75%);
  background-size: 200% 100%;
  animation: skeleton-slide 1.5s ease-in-out infinite;
}

.skeleton-body {
  padding: 14px 16px 16px;
}

@keyframes skeleton-slide {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.empty-result {
  text-align: center;
  color: #909399;
  font-size: 15px;
  padding: 60px 0;
  letter-spacing: 0.5px;
  line-height: 1.6;
}

.empty-sub {
  font-size: 13px;
  color: #c0c4cc;
  margin-top: 4px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 28px;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  background: #ffffff;
  color: #606266;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 10px;
  letter-spacing: 0.5px;
}

.page-btn:hover:not(:disabled):not(.active) {
  color: #409eff;
  border-color: #409eff;
}

.page-btn.active {
  background: #409eff;
  color: #ffffff;
  border-color: #409eff;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-btn.ellipsis {
  border: none;
  background: transparent;
  cursor: default;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal {
  background: #ffffff;
  border-radius: 12px;
  width: 560px;
  max-width: 92vw;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
  animation: modal-in 0.25s ease;
}

@keyframes modal-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 24px;
  border-bottom: 1px solid #ebeef5;
}

.modal-title {
  font-size: 17px;
  font-weight: 600;
  color: #303133;
  letter-spacing: 0.5px;
}

.modal-close {
  border: none;
  background: none;
  font-size: 24px;
  color: #909399;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
  padding: 0;
}

.modal-close:hover {
  color: #303133;
}

.modal-body {
  padding: 20px 24px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 14px 24px;
  border-top: 1px solid #ebeef5;
}

.modal-footer .btn {
  flex: none;
  padding: 9px 24px;
}

.detail-thumb {
  width: 100%;
  height: 220px;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 16px;
}

.detail-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px 24px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-label {
  font-size: 13px;
  color: #909399;
  letter-spacing: 0.5px;
}

.detail-value {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.apply-info {
  background: #f0f9eb;
  border: 1px solid #e1f3d8;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 14px;
  color: #303133;
  margin-bottom: 20px;
  line-height: 1.5;
  letter-spacing: 0.5px;
}

.apply-label {
  color: #67c23a;
  font-weight: 600;
}

.form-group {
  margin-bottom: 18px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
  letter-spacing: 0.5px;
}

.required {
  color: #f56c6c;
}

.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  color: #303133;
  outline: none;
  transition: border-color 0.25s;
  letter-spacing: 0.5px;
  line-height: 1.5;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: #409eff;
}

.form-textarea {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  font-size: 14px;
  color: #303133;
  outline: none;
  resize: vertical;
  transition: border-color 0.25s;
  letter-spacing: 0.5px;
  line-height: 1.6;
  box-sizing: border-box;
  font-family: inherit;
}

.form-textarea:focus {
  border-color: #409eff;
}

.form-error {
  color: #f56c6c;
  font-size: 13px;
  margin-top: -8px;
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  line-height: 1.5;
}

@media (max-width: 1600px) {
  .image-grid,
  .grid-skeleton {
    grid-template-columns: repeat(3, 1fr);
  }

  .stat-grid {
    grid-template-columns: repeat(3, auto);
    row-gap: 20px;
  }

  .stat-item .stat-value {
    font-size: 28px;
  }

  .hero-right {
    width: 360px;
  }

  .satellite-img {
    height: 190px;
  }
}

@media (max-width: 1200px) {
  .image-grid,
  .grid-skeleton {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .hero-banner {
    padding: 24px 24px 20px;
  }

  .hero-content {
    flex-direction: column;
    gap: 24px;
  }

  .hero-right {
    width: 100%;
    flex-direction: row;
    align-items: flex-end;
    gap: 20px;
  }

  .satellite-img-wrap {
    flex: 1;
  }

  .satellite-img {
    height: 180px;
  }

  .search-bar {
    width: 320px;
    flex-shrink: 0;
  }

  .main-content {
    padding: 20px 24px 28px;
  }
}

@media (max-width: 768px) {
  .image-grid,
  .grid-skeleton {
    grid-template-columns: 1fr;
  }

  .stat-grid {
    grid-template-columns: repeat(2, auto);
  }

  .hero-banner {
    padding: 20px 16px 16px;
  }

  .hero-right {
    flex-direction: column;
  }

  .satellite-img {
    height: 160px;
  }

  .search-bar {
    width: 100%;
  }

  .main-content {
    padding: 16px 16px 24px;
  }

  .card-thumb {
    height: 200px;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    width: 95vw;
  }
}
</style>
