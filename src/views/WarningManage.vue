<template>
  <div class="warning-page">
    <div class="main-content">
      <div class="left-section">
        <div id="warning-map" class="map-container"></div>
        <div class="chart-overlay">
          <div class="chart-header">近30天火险预警等级趋势</div>
          <div ref="trendChartRef" class="trend-chart"></div>
        </div>
      </div>

      <div class="right-section">
        <div class="alert-header">
          <h2 class="alert-title">报警信息列表</h2>
          <div class="sort-dropdown" :class="{ open: showSortMenu }">
            <button class="sort-btn" @click="showSortMenu = !showSortMenu">
              {{ sortMode === 'time' ? '按时间分类' : '按编号分类' }}
              <svg class="sort-icon" viewBox="0 0 12 12" fill="none">
                <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div v-if="showSortMenu" class="sort-menu">
              <div
                class="sort-option"
                :class="{ active: sortMode === 'time' }"
                @click="changeSortMode('time')"
              >
                按时间分类
                <svg v-if="sortMode === 'time'" class="check-icon" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div
                class="sort-option"
                :class="{ active: sortMode === 'id' }"
                @click="changeSortMode('id')"
              >
                按编号分类
                <svg v-if="sortMode === 'id'" class="check-icon" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div class="alert-list">
          <div
            v-for="alert in paginatedAlerts"
            :key="alert.id"
            :class="['alert-item', `alert-item--${alert.level}`]"
            @click="focusAlert(alert)"
          >
            <div class="alert-time">
              <svg class="time-icon" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="currentColor" stroke-width="1.2"/>
                <path d="M8 4v4l3 2" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/>
              </svg>
              {{ alert.time }}
            </div>
            <div class="alert-location">
              <svg class="location-icon" viewBox="0 0 16 16" fill="none">
                <path d="M8 1.5C5.24 1.5 3 3.74 3 6.5c0 3.54 5 9 5 9s5-5.46 5-9c0-2.76-2.24-5-5-5z" stroke="currentColor" stroke-width="1.2" fill="none"/>
                <circle cx="8" cy="6.5" r="1.5" fill="currentColor"/>
              </svg>
              {{ alert.location }}
            </div>
            <div class="alert-level-badge" :class="`level--${alert.level}`">
              {{ levelText[alert.level] }}
            </div>
          </div>

          <div v-if="filteredAlerts.length === 0" class="empty-alerts">
            <p>暂无报警信息</p>
          </div>
        </div>

        <div class="pagination">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="currentPage = 1"
          >
            首页
          </button>
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            上一页
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="['page-btn', 'page-num', { active: currentPage === page }]"
            @click="currentPage = page"
          >
            {{ page }}
          </button>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
          >
            下一页
          </button>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage = totalPages"
          >
            尾页
          </button>
        </div>

        <div class="refresh-bar">
          <span class="update-time">最后更新：{{ lastUpdateTime }}</span>
          <button class="refresh-btn" @click="refreshData">
            <svg class="refresh-icon" viewBox="0 0 16 16" fill="none">
              <path d="M13.65 2.35A7.96 7.96 0 008 0C3.58 0 .01 3.58.01 8s3.57 8 8 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 018 14c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z" fill="currentColor"/>
            </svg>
            刷新数据
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface AlertInfo {
  id: number
  time: string
  location: string
  level: 'red' | 'orange' | 'yellow' | 'blue'
  lat: number
  lng: number
}

const trendChartRef = ref<HTMLDivElement>()
let map: L.Map | null = null
let chartInstance: echarts.ECharts | null = null
let markersLayer: L.LayerGroup | null = null

const showSortMenu = ref(false)
const sortMode = ref<'time' | 'id'>('time')
const currentPage = ref(1)
const pageSize = 8
const lastUpdateTime = ref('')

const levelText: Record<string, string> = {
  red: '红色预警',
  orange: '橙色预警',
  yellow: '黄色预警',
  blue: '蓝色预警'
}

const allAlerts = ref<AlertInfo[]>([
  { id: 1, time: '2019-05-20 16:00:00', location: '山东省 青岛市 平度市', level: 'red', lat: 36.78, lng: 119.97 },
  { id: 2, time: '2019-05-20 16:00:00', location: '山东省 青岛市 平度市', level: 'orange', lat: 36.79, lng: 119.98 },
  { id: 3, time: '2019-05-20 15:40:00', location: '山东省 青岛市 平度市', level: 'yellow', lat: 36.77, lng: 119.96 },
  { id: 4, time: '2019-05-20 15:20:00', location: '山东省 青岛市 平度市', level: 'blue', lat: 36.80, lng: 119.95 },
  { id: 5, time: '2019-05-20 15:10:00', location: '山东省 青岛市 平度市', level: 'red', lat: 36.76, lng: 119.99 },
  { id: 6, time: '2019-05-20 15:00:00', location: '山东省 青岛市 平度市', level: 'orange', lat: 36.81, lng: 119.94 },
  { id: 7, time: '2019-05-20 14:50:00', location: '四川省 凉山州 木里县', level: 'red', lat: 27.93, lng: 101.28 },
  { id: 8, time: '2019-05-20 14:40:00', location: '四川省 凉山州 盐源县', level: 'orange', lat: 27.42, lng: 101.51 },
  { id: 9, time: '2019-05-20 14:30:00', location: '云南省 大理州 洱源县', level: 'yellow', lat: 26.11, lng: 99.95 },
  { id: 10, time: '2019-05-20 14:20:00', location: '贵州省 黔东南州 雷山县', level: 'blue', lat: 26.38, lng: 108.08 },
  { id: 11, time: '2019-05-20 14:10:00', location: '四川省 甘孜州 康定市', level: 'red', lat: 30.05, lng: 101.96 },
  { id: 12, time: '2019-05-20 14:00:00', location: '四川省 阿坝州 汶川县', level: 'orange', lat: 31.48, lng: 103.59 },
  { id: 13, time: '2019-05-19 23:50:00', location: '云南省 丽江市 宁蒗县', level: 'yellow', lat: 27.28, lng: 100.85 },
  { id: 14, time: '2019-05-19 23:40:00', location: '四川省 雅安市 石棉县', level: 'red', lat: 29.23, lng: 102.37 },
  { id: 15, time: '2019-05-19 23:30:00', location: '四川省 攀枝花市 仁和区', level: 'orange', lat: 26.49, lng: 101.72 },
  { id: 16, time: '2019-05-19 23:20:00', location: '云南省 楚雄州 牟定县', level: 'blue', lat: 25.31, lng: 101.70 },
  { id: 17, time: '2019-05-19 23:10:00', location: '四川省 凉山州 昭觉县', level: 'red', lat: 28.02, lng: 102.84 },
  { id: 18, time: '2019-05-19 23:00:00', location: '贵州省 六盘水市 盘州市', level: 'yellow', lat: 25.71, lng: 104.47 }
])

const filteredAlerts = computed<AlertInfo[]>(() => {
  const result = allAlerts.value.slice()

  if (sortMode.value === 'time') {
    result.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
  } else {
    result.sort((a, b) => a.id - b.id)
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredAlerts.value.length / pageSize)))

const paginatedAlerts = computed<AlertInfo[]>(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredAlerts.value.slice(start, start + pageSize)
})

const visiblePages = computed<number[]>(() => {
  const pages: number[] = []
  const total = totalPages.value
  const current = currentPage.value

  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)

  if (current <= 3) {
    end = Math.min(5, total)
  }
  if (current >= total - 2) {
    start = Math.max(1, total - 4)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})

function initMap(): void {
  if (!document.getElementById('warning-map')) return

  map = L.map('warning-map', {
    center: [30.67, 104.06],
    zoom: 5,
    zoomControl: true,
    attributionControl: false
  })

  L.control.zoom({ position: 'topright' }).addTo(map)

  L.tileLayer(
    'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    {
      attribution: '',
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      minZoom: 3
    }
  ).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
  addMarkers()
}

function addMarkers(): void {
  if (!markersLayer || !map) return
  markersLayer.clearLayers()

  const colorMap: Record<string, string> = {
    red: '#f56c6c',
    orange: '#e6a23c',
    yellow: '#e6a23c',
    blue: '#409eff'
  }

  allAlerts.value.forEach(alert => {
    const color = colorMap[alert.level] || '#666'

    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 24px;
        height: 32px;
        background: ${color};
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 2px solid #fff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [24, 32],
      iconAnchor: [12, 32]
    })

    const marker = L.marker([alert.lat, alert.lng], { icon })
      .bindPopup(`
        <div style="min-width:180px;font-size:13px;">
          <strong>${levelText[alert.level]}</strong><br/>
          <span style="color:#666;">${alert.location}</span><br/>
          <span style="color:#999;">${alert.time}</span>
        </div>
      `)

    markersLayer!.addLayer(marker)
  })
}

function focusAlert(alert: AlertInfo): void {
  if (!map) return
  map.setView([alert.lat, alert.lng], 10, { animate: true })
}

function generateTrendData() {
  const dates: string[] = []
  const lowRisk: number[] = []
  const mediumRisk: number[] = []
  const highRisk: number[] = []
  const criticalRisk: number[] = []

  const today = new Date()
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(`${date.getMonth() + 1}/${date.getDate()}`)

    lowRisk.push(Math.floor(Math.random() * 15) + 5)
    mediumRisk.push(Math.floor(Math.random() * 10) + 8)
    highRisk.push(Math.floor(Math.random() * 8) + 3)
    criticalRisk.push(Math.floor(Math.random() * 5) + 1)
  }

  return { dates, lowRisk, mediumRisk, highRisk, criticalRisk }
}

function initTrendChart(): void {
  if (!trendChartRef.value) return

  if (chartInstance) {
    chartInstance.dispose()
  }

  chartInstance = echarts.init(trendChartRef.value)
  const data = generateTrendData()

  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    grid: {
      top: 30,
      right: 20,
      bottom: 30,
      left: 45
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255,255,255,0.95)',
      borderColor: '#eee',
      textStyle: { color: '#333', fontSize: 12 },
      axisPointer: { type: 'cross' }
    },
    legend: {
      data: ['蓝色预警', '黄色预警', '红色预警'],
      bottom: 0,
      textStyle: { fontSize: 11, color: '#666' },
      itemWidth: 16,
      itemHeight: 8,
      itemGap: 12
    },
    xAxis: {
      type: 'category',
      data: data.dates,
      axisLabel: {
        fontSize: 10,
        color: '#999',
        interval: 4
      },
      axisLine: { lineStyle: { color: '#e0e0e0' } }
    },
    yAxis: {
      type: 'value',
      name: '预警次数',
      nameTextStyle: { fontSize: 11, color: '#999' },
      axisLabel: { fontSize: 10, color: '#999' },
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } }
    },
    series: [
      {
        name: '蓝色预警',
        type: 'line',
        smooth: true,
        data: data.lowRisk,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(64,158,255,0.4)' },
            { offset: 1, color: 'rgba(64,158,255,0.05)' }
          ])
        },
        lineStyle: { color: '#409eff', width: 2 },
        itemStyle: { color: '#409eff' }
      },
      {
        name: '黄色预警',
        type: 'line',
        smooth: true,
        data: data.mediumRisk,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(230,162,60,0.4)' },
            { offset: 1, color: 'rgba(230,162,60,0.05)' }
          ])
        },
        lineStyle: { color: '#e6a23c', width: 2 },
        itemStyle: { color: '#e6a23c' }
      },
      {
        name: '红色预警',
        type: 'line',
        smooth: true,
        data: data.highRisk,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245,108,108,0.4)' },
            { offset: 1, color: 'rgba(245,108,108,0.05)' }
          ])
        },
        lineStyle: { color: '#f56c6c', width: 2 },
        itemStyle: { color: '#f56c6c' }
      },
    ]
  }

  chartInstance.setOption(option)
}

function refreshData(): void {
  lastUpdateTime.value = new Date().toLocaleString('zh-CN')
  addMarkers()
  initTrendChart()
}

function changeSortMode(mode: 'time' | 'id'): void {
  sortMode.value = mode
  showSortMenu.value = false
  currentPage.value = 1
}

watch(currentPage, () => {
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

onMounted(async () => {
  await nextTick()
  initMap()
  initTrendChart()
  refreshData()

  window.addEventListener('resize', handleResize)
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

  if (map) {
    map.remove()
    map = null
  }

  window.removeEventListener('resize', handleResize)
  document.removeEventListener('click', handleClickOutside)
})

function handleClickOutside(e: MouseEvent): void {
  const target = e.target as HTMLElement
  if (!target.closest('.sort-dropdown')) {
    showSortMenu.value = false
  }
}

function handleResize(): void {
  chartInstance?.resize()
  map?.invalidateSize()
}
</script>

<style scoped>
.warning-page {
  width: 100%;
  height: calc(100vh - 96px);
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.main-content {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 16px;
  min-height: 0;
}

.left-section {
  flex: 7;
  position: relative;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-container {
  flex: 1;
  min-height: 300px;
  z-index: 1;
}

.chart-overlay {
  position: absolute;
  bottom: 16px;
  left: 16px;
  right: 16px;
  height: 220px;
  background: rgba(255, 255, 255, 0.96);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 1000;
  padding: 12px 16px;
  backdrop-filter: blur(8px);
}

.chart-header {
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  text-align: center;
}

.trend-chart {
  width: 100%;
  height: calc(100% - 28px);
}

.right-section {
  flex: 3;
  min-width: 320px;
  max-width: 400px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.alert-header {
  padding: 16px 20px;
  border-bottom: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.alert-title {
  font-size: 16px;
  font-weight: 700;
  color: #303133;
  margin: 0;
}

.sort-dropdown {
  position: relative;
}

.sort-btn {
  padding: 6px 14px;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.sort-btn:hover {
  border-color: #1f8f45;
  color: #1f8f45;
}

.sort-dropdown.open .sort-btn {
  border-color: #1f8f45;
  color: #1f8f45;
}

.sort-icon {
  width: 12px;
  height: 12px;
  transition: transform 0.2s;
}

.sort-dropdown.open .sort-icon {
  transform: rotate(180deg);
}

.sort-menu {
  position: absolute;
  top: calc(100% + 6px);
  right: 0;
  min-width: 140px;
  background: #fff;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  z-index: 2000;
  padding: 4px 0;
  animation: sortMenuIn 0.15s ease;
}

@keyframes sortMenuIn {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: translateY(0); }
}

.sort-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 16px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.15s;
}

.sort-option:hover {
  background: #f5f7fa;
  color: #1f8f45;
}

.sort-option.active {
  color: #1f8f45;
  font-weight: 600;
}

.check-icon {
  width: 12px;
  height: 12px;
  color: #1f8f45;
  flex-shrink: 0;
}

.alert-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}

.alert-item {
  padding: 14px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.alert-item:hover {
  background: #fafafa;
}

.alert-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
}

.alert-item--red::before { background: #f56c6c; }
.alert-item--orange::before { background: #e6a23c; }
.alert-item--yellow::before { background: #e6a23c; }
.alert-item--blue::before { background: #409eff; }

.alert-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #909399;
  margin-bottom: 6px;
}

.time-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.alert-location {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
  line-height: 1.4;
}

.location-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #1f8f45;
}

.alert-level-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.level--red {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.level--orange {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.level--yellow {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.level--blue {
  background: #ecf5ff;
  color: #409eff;
  border: 1px solid #d9ecff;
}

.empty-alerts {
  padding: 60px 20px;
  text-align: center;
  color: #c0c4cc;
  font-size: 14px;
}

.pagination {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  background: #fff;
  border-radius: 4px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.page-btn:hover:not(:disabled):not(.active) {
  border-color: #1f8f45;
  color: #1f8f45;
}

.page-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.page-num.active {
  background: #1f8f45;
  color: #fff;
  border-color: #1f8f45;
}

.refresh-bar {
  padding: 12px 20px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.update-time {
  font-size: 12px;
  color: #c0c4cc;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: #1f8f45;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #167a38;
}

.refresh-icon {
  width: 14px;
  height: 14px;
}

:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

@media (max-width: 1200px) {
  .main-content {
    flex-direction: column;
  }

  .left-section {
    min-height: 500px;
  }

  .right-section {
    max-width: 100%;
    min-width: auto;
  }

  .chart-overlay {
    position: relative;
    bottom: auto;
    left: auto;
    right: auto;
    margin: 16px;
    height: 280px;
  }
}
</style>
