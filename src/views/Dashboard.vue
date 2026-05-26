<template>
  <div class="dashboard">
    <nav class="top-nav">
      <div class="nav-brand">
        <span class="nav-brand-text">森林火灾监测预警平台</span>
      </div>
      <div class="nav-tabs">
        <button
          v-for="tab in navTabs"
          :key="tab.key"
          class="nav-tab"
          :class="{ active: activeTab === tab.key }"
          @click="handleTabClick(tab)"
        >
          <span class="nav-tab-icon"></span>
          {{ tab.label }}
        </button>
      </div>
      <div class="nav-right">
        <span class="nav-time">{{ currentTime }}</span>
        <div class="nav-user">
          <span class="nav-role" :class="'nav-role--' + currentUser?.role">{{ currentUser?.roleName }}</span>
          <span class="nav-username">{{ currentUser?.username }}</span>
          <button class="nav-logout-btn" @click="handleLogout">退出</button>
        </div>
      </div>
    </nav>

    <div class="dashboard-body">
      <aside class="panel panel-left">
        <div class="panel-section">
          <div class="panel-header">
            空间态势总览
          </div>
          <div class="stat-grid">
            <div class="stat-item stat-item--danger">
              <div class="stat-value">{{ fireCount }}</div>
              <div class="stat-label">实时火点</div>
            </div>
            <div class="stat-item stat-item--warning">
              <div class="stat-value">{{ highRiskCount }}</div>
              <div class="stat-label">高风险区</div>
            </div>
            <div class="stat-item stat-item--success">
              <div class="stat-value">{{ resourceCount }}</div>
              <div class="stat-label">应急资源</div>
            </div>
            <div class="stat-item stat-item--info">
              <div class="stat-value">{{ warningCount }}</div>
              <div class="stat-label">预警信息</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-header">
            监测区域信息
          </div>
          <div class="desc-list">
            <div class="desc-row">
              <div class="desc-label">监测区域</div>
              <div class="desc-value">四川省重点林区</div>
            </div>
            <div class="desc-row">
              <div class="desc-label">遥感数据</div>
              <div class="desc-value">Sentinel-2 / Landsat-9 / MODIS</div>
            </div>
            <div class="desc-row">
              <div class="desc-label">火点提取</div>
              <div class="desc-value">SWIR阈值 + NDVI</div>
            </div>
            <div class="desc-row">
              <div class="desc-label">火险模型</div>
              <div class="desc-value">AHP加权叠加</div>
            </div>
            <div class="desc-row">
              <div class="desc-label">监测面积</div>
              <div class="desc-value">约 12.8 万 km²</div>
            </div>
            <div class="desc-row">
              <div class="desc-label">更新频率</div>
              <div class="desc-value">每 15 分钟</div>
            </div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-header">
            图例
          </div>
          <div class="legend-list">
            <div class="legend-item"><span class="legend-dot fire"></span>火点</div>
            <div class="legend-item"><span class="legend-dot high"></span>高风险</div>
            <div class="legend-item"><span class="legend-dot middle"></span>中风险</div>
            <div class="legend-item"><span class="legend-dot low"></span>低风险</div>
            <div class="legend-item"><span class="legend-dot resource"></span>应急资源</div>
            <div class="legend-item"><span class="legend-dot forest"></span>监测林区</div>
          </div>
        </div>
      </aside>

      <div class="map-area">
        <div class="map-toolbar">
          <button class="btn btn--primary" @click="loadFirePoints">加载火点</button>
          <button class="btn btn--warning" @click="loadRiskHeat">加载火险热力</button>
          <button class="btn btn--success" @click="loadResources">加载应急资源</button>
          <button class="btn btn--danger" @click="clearLayers">清除图层</button>
          <button class="btn btn--default" @click="locateToSichuan">定位四川</button>
          <div class="toolbar-stats">
            <span class="tag tag--danger">火点 {{ fireCount }}</span>
            <span class="tag tag--warning">高风险 {{ highRiskCount }}</span>
            <span class="tag tag--success">资源 {{ resourceCount }}</span>
          </div>
        </div>
        <div id="dashboard-map" class="map-container"></div>
      </div>

      <aside class="panel panel-right">
        <div class="panel-section">
          <div class="panel-header">
            火灾报警趋势
          </div>
          <div class="chart-area" ref="trendChartRef"></div>
        </div>

        <div class="panel-section">
          <div class="panel-header">
            最新火点动态
          </div>
          <div class="fire-list">
            <div
              v-for="item in latestFires"
              :key="item.id"
              class="fire-item"
              @click="locateToPoint(item.lat, item.lon)"
            >
              <span class="fire-level" :class="'fire-level--' + item.levelClass">{{ item.level }}</span>
              <div class="fire-info">
                <div class="fire-name">{{ item.name }}</div>
                <div class="fire-meta">{{ item.time }} · {{ item.temperature }}℃</div>
              </div>
            </div>
            <div v-if="latestFires.length === 0" class="empty-hint">暂无火点数据</div>
          </div>
        </div>

        <div class="panel-section">
          <div class="panel-header">
            功能说明
          </div>
          <div class="func-desc">
            <p>本平台基于 <b>Leaflet + ECharts</b> 实现森林火灾监测与预警可视化，核心功能包括：</p>
            <ul>
              <li><b>火点监测</b>：基于 SWIR 阈值与 NDVI 的遥感火点自动提取</li>
              <li><b>火险评估</b>：AHP 加权叠加模型生成火险等级分布</li>
              <li><b>应急调度</b>：消防站、水源、直升机坪等资源点位管理</li>
              <li><b>趋势分析</b>：历史火点时序趋势与预警等级统计</li>
            </ul>
            <p>后续可接入 PostGIS 空间接口，实现缓冲区分析、路径规划和火点蔓延模拟。</p>
          </div>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import type { Map, LayerGroup, Polygon } from 'leaflet'
import * as echarts from 'echarts'
import { Message } from '../utils/message'
import {
  getFirePointsApi,
  getRiskHeatApi,
  getEmergencyResourcesApi,
  type FirePoint
} from '../api'
import { useUserStore } from '../stores/user'

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
})

interface NavTab {// 顶部 Tab 配置
  key: string// 唯一标识
  label: string// 显示文本
  route?: string// 可选的路由路径
}

interface LatestFire {
  id: number
  name: string
  level: string
  levelClass: string
  time: string
  temperature: number
  lat: number
  lon: number
}

const router = useRouter()// 获取路由器实例（用于编程式导航）
const { userInfo: currentUser, clearUser } = useUserStore()

const navTabs: NavTab[] = [
  { key: 'overview', label: '综合态势' },
  { key: 'data-category', label: '数据分类管理',  route: '/data-category' },
  { key: 'fire-point', label: '火点数据管理',  route: '/fire-point' },
  { key: 'emergency-resource', label: '应急资源管理',  route: '/emergency-resource' },
  { key: 'warning', label: '火险预警管理', route: '/warning' },
  { key: 'remote-image', label: '遥感影像管理', route: '/remote-image' },
  { key: 'data-application', label: '数据申请服务',  route: '/data-application' },
  { key: 'system-ops', label: '系统运维管理',  route: '/system-ops' }
]

const activeTab = ref<string>('overview')
const currentTime = ref<string>('')
const fireCount = ref<number>(0)
const highRiskCount = ref<number>(0)
const resourceCount = ref<number>(0)
const warningCount = ref<number>(5)
const latestFires = ref<LatestFire[]>([])
const trendChartRef = ref<HTMLElement | null>(null)

let map: Map | null = null
let fireLayer: LayerGroup | null = null
let riskLayer: LayerGroup | null = null
let resourceLayer: LayerGroup | null = null
let forestLayer: Polygon | null = null
let trendChart: echarts.ECharts | null = null
let timeTimer: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  updateTime()
  timeTimer = setInterval(updateTime, 1000)
  initMap()
  loadAllData()
})

onUnmounted(() => {
  if (timeTimer) clearInterval(timeTimer)
  if (trendChart) {
    trendChart.dispose()
    trendChart = null
  }
  if (map) {
    map.remove()
    map = null
  }
})

function handleTabClick(tab: NavTab): void {
  activeTab.value = tab.key
  if (tab.route) {
    router.push(tab.route)
  }
}

function handleLogout(): void {
  clearUser()
  router.push('/login')
}

function updateTime(): void {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${y}-${m}-${d} ${h}:${min}:${s}`
}

function initMap(): void {
  map = L.map('dashboard-map', {
    center: [30.67, 104.06],
    zoom: 7,
    zoomControl: false
  })

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer(
    'https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}',
    {
      attribution: '© 高德地图',
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      minZoom: 3
    }
  ).addTo(map)

  L.tileLayer(
    'https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}',
    {
      attribution: '© 高德地图',
      subdomains: ['1', '2', '3', '4'],
      maxZoom: 18,
      minZoom: 3,
      opacity: 0.8
    }
  ).addTo(map)

  fireLayer = L.layerGroup().addTo(map)
  riskLayer = L.layerGroup().addTo(map)
  resourceLayer = L.layerGroup().addTo(map)

  addForestArea()
}

function addForestArea(): void {
  if (!map) return

  const forestPolygon: [number, number][] = [
    [27.55, 101.35],
    [28.65, 101.55],
    [29.05, 102.55],
    [28.65, 103.55],
    [27.75, 103.25],
    [27.35, 102.25]
  ]

  forestLayer = L.polygon(forestPolygon, {
    color: '#1f8f45',
    weight: 2,
    fillColor: '#67c23a',
    fillOpacity: 0.18
  }).addTo(map)

  forestLayer.bindPopup(`
    <b>森林重点监测区域</b><br/>
    区域：四川省西南部林区<br/>
    类型：高山峡谷森林区<br/>
    功能：火险监测与空间预警
  `)
}

async function loadAllData(): Promise<void> {
  await Promise.all([loadFirePoints(), loadRiskHeat(), loadResources()])
  initTrendChart()
}

async function loadFirePoints(): Promise<void> {
  if (!fireLayer) return
  fireLayer.clearLayers()

  const res = await getFirePointsApi()
  if (res.code === 200) {
    fireCount.value = res.data.length

    latestFires.value = res.data.map(item => {
      let levelClass = 'mid'
      if (item.level === '高') levelClass = 'high'
      else if (item.level === '较高') levelClass = 'higher'
      else if (item.level === '低' || item.level === '较低') levelClass = 'low'

      return {
        id: item.id,
        name: item.name,
        level: item.level,
        levelClass,
        time: item.time.substring(5, 16),
        temperature: item.temperature,
        lat: item.lat,
        lon: item.lon
      }
    })

    res.data.forEach(item => {
      const color = item.level === '高' ? '#f56c6c' : '#e6a23c'

      const marker = L.circleMarker([item.lat, item.lon], {
        radius: 9,
        color,
        fillColor: color,
        fillOpacity: 0.85
      })

      marker.bindPopup(`
        <b>${item.name}</b><br/>
        经度：${item.lon}<br/>
        纬度：${item.lat}<br/>
        等级：${item.level}<br/>
        温度：${item.temperature}℃<br/>
        时间：${item.time}<br/>
        数据源：${item.source}
      `)

      marker.addTo(fireLayer!)
    })
  }
}

async function loadRiskHeat(): Promise<void> {
  if (!riskLayer) return
  riskLayer.clearLayers()

  const res = await getRiskHeatApi()
  if (res.code === 200) {
    highRiskCount.value = res.data.filter(
      item => item.level === '高' || item.level === '较高'
    ).length

    res.data.forEach(item => {
      let color = '#67c23a'
      if (item.value >= 80) color = '#f56c6c'
      else if (item.value >= 60) color = '#e6a23c'
      else if (item.value >= 40) color = '#ffd666'

      const circle = L.circle([item.lat, item.lon], {
        radius: item.value * 80,
        color,
        fillColor: color,
        fillOpacity: 0.28,
        weight: 1
      })

      circle.bindPopup(`
        <b>火险等级点</b><br/>
        火险指数：${item.value}<br/>
        火险等级：${item.level}<br/>
        模型：AHP加权叠加
      `)

      circle.addTo(riskLayer!)
    })
  }
}

async function loadResources(): Promise<void> {
  if (!resourceLayer) return
  resourceLayer.clearLayers()

  const res = await getEmergencyResourcesApi()
  if (res.code === 200) {
    resourceCount.value = res.data.length

    res.data.forEach(item => {
      const marker = L.marker([item.lat, item.lon])
      marker.bindPopup(`
        <b>${item.name}</b><br/>
        类型：${item.type}<br/>
        联系方式：${item.phone}<br/>
        功能：应急调度资源点
      `)
      marker.addTo(resourceLayer!)
    })
  }
}

function clearLayers(): void {
  fireLayer?.clearLayers()
  riskLayer?.clearLayers()
  resourceLayer?.clearLayers()
  fireCount.value = 0
  highRiskCount.value = 0
  resourceCount.value = 0
  latestFires.value = []
  Message.info('业务图层已清除')
}

function locateToSichuan(): void {
  map?.setView([30.67, 104.06], 7)
}

function locateToPoint(lat: number, lon: number): void {
  map?.setView([lat, lon], 10)
}

function initTrendChart(): void {
  if (!trendChartRef.value) return

  trendChart = echarts.init(trendChartRef.value)

  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const fireData = [3, 5, 8, 12, 18, 25, 32, 28, 15, 9, 6, 4]
  const warningData = [1, 2, 3, 5, 8, 12, 15, 13, 7, 4, 2, 1]

  trendChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.96)',
      borderColor: '#e4e7ed',
      textStyle: { color: '#303133', fontSize: 12 }
    },
    legend: {
      data: ['火点数量', '预警次数'],
      textStyle: { color: '#606266', fontSize: 11 },
      top: 0,
      itemWidth: 16,
      itemHeight: 8
    },
    grid: {
      left: 36,
      right: 12,
      top: 32,
      bottom: 24
    },
    xAxis: {
      type: 'category',
      data: months,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#909399', fontSize: 10 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: '#ebeef5', type: 'dashed' } },
      axisLabel: { color: '#909399', fontSize: 10 }
    },
    series: [
      {
        name: '火点数量',
        type: 'line',
        data: fireData,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#f56c6c', width: 2 },
        itemStyle: { color: '#f56c6c' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(245, 108, 108, 0.35)' },
            { offset: 1, color: 'rgba(245, 108, 108, 0.02)' }
          ])
        }
      },
      {
        name: '预警次数',
        type: 'bar',
        data: warningData,
        barWidth: 12,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#e6a23c' },
            { offset: 1, color: 'rgba(230, 162, 60, 0.3)' }
          ]),
          borderRadius: [3, 3, 0, 0]
        }
      }
    ]
  })
}
</script>

<style scoped>
.dashboard {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
  overflow: hidden;
}

.top-nav {
  height: 52px;
  background: #ffffff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 40px;
}

.nav-brand-icon {
  font-size: 22px;
}

.nav-brand-text {
  font-size: 16px;
  font-weight: bold;
  color: #1f8f45;
  white-space: nowrap;
}

.nav-tabs {
  display: flex;
  gap: 4px;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s;
  white-space: nowrap;
}

.nav-tab:hover {
  background: rgba(31, 143, 69, 0.08);
  color: #1f8f45;
}

.nav-tab.active {
  background: rgba(31, 143, 69, 0.12);
  color: #1f8f45;
  font-weight: 600;
}

.nav-tab-icon {
  font-size: 15px;
}

.nav-info {
  margin-left: auto;
}

.nav-right {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-role {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  line-height: 18px;
}

.nav-role--admin {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.nav-role--researcher {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.nav-role--user {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.nav-username {
  color: #303133;
  font-size: 13px;
}

.nav-logout-btn {
  padding: 4px 10px;
  border: none;
  border-radius: 4px;
  background: #fef0f0;
  color: #f56c6c;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-logout-btn:hover {
  background: #fde2e2;
}

.nav-time {
  color: #909399;
  font-size: 13px;
  font-variant-numeric: tabular-nums;
}

.dashboard-body {
  flex: 1;
  display: flex;
  gap: 0;
  overflow: hidden;
}

.panel {
  width: 300px;
  flex-shrink: 0;
  background: #ffffff;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-left {
  border-right: 1px solid #e4e7ed;
}

.panel-right {
  border-left: 1px solid #e4e7ed;
}

.panel-section {
  background: #fafafa;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 14px;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #ebeef5;
}

.panel-header-icon {
  font-size: 16px;
}

.stat-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-item {
  text-align: center;
  padding: 12px 8px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #ebeef5;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  font-variant-numeric: tabular-nums;
}

.stat-label {
  font-size: 12px;
  margin-top: 4px;
  color: #909399;
}

.stat-item--danger .stat-value {
  color: #f56c6c;
}

.stat-item--warning .stat-value {
  color: #e6a23c;
}

.stat-item--success .stat-value {
  color: #67c23a;
}

.stat-item--info .stat-value {
  color: #409eff;
}

.desc-list {
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.desc-row {
  display: flex;
  border-bottom: 1px solid #f2f6fc;
}

.desc-row:last-child {
  border-bottom: none;
}

.desc-label {
  width: 72px;
  padding: 8px 10px;
  background: #fafafa;
  font-weight: 500;
  color: #606266;
  font-size: 12px;
  flex-shrink: 0;
}

.desc-value {
  flex: 1;
  padding: 8px 10px;
  color: #303133;
  font-size: 12px;
}

.legend-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #606266;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
  flex-shrink: 0;
}

.legend-dot.fire {
  background: #f56c6c;
}

.legend-dot.high {
  background: #e64242;
}

.legend-dot.middle {
  background: #e6a23c;
}

.legend-dot.low {
  background: #67c23a;
}

.legend-dot.resource {
  background: #409eff;
}

.legend-dot.forest {
  background: #1f8f45;
  border: 1px dashed #67c23a;
}

.map-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.map-toolbar {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #ffffff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
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

.btn--danger {
  background: #f56c6c;
  color: #fff;
}

.btn--danger:hover {
  background: #e64242;
}

.btn--default {
  background: #ffffff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn--default:hover {
  background: #ecf5ff;
  color: #409eff;
  border-color: #b3d8ff;
}

.toolbar-stats {
  margin-left: auto;
  display: flex;
  gap: 8px;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 12px;
  line-height: 18px;
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

.tag--success {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.map-container {
  flex: 1;
  background: #e8e8e8;
}

.chart-area {
  width: 100%;
  height: 200px;
}

.fire-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.fire-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #ffffff;
  border-radius: 6px;
  border: 1px solid #ebeef5;
  cursor: pointer;
  transition: all 0.2s;
}

.fire-item:hover {
  background: #f0f9eb;
  border-color: #c2e7b0;
}

.fire-level {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 24px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  flex-shrink: 0;
}

.fire-level--high {
  background: #fef0f0;
  color: #f56c6c;
  border: 1px solid #fde2e2;
}

.fire-level--higher {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.fire-level--mid {
  background: #fdf6ec;
  color: #e6a23c;
  border: 1px solid #faecd8;
}

.fire-level--low {
  background: #f0f9eb;
  color: #67c23a;
  border: 1px solid #e1f3d8;
}

.fire-info {
  flex: 1;
  min-width: 0;
}

.fire-name {
  font-size: 13px;
  color: #303133;
  font-weight: 500;
}

.fire-meta {
  font-size: 11px;
  color: #909399;
  margin-top: 2px;
}

.empty-hint {
  text-align: center;
  color: #909399;
  font-size: 13px;
  padding: 20px 0;
}

.func-desc {
  font-size: 12px;
  color: #606266;
  line-height: 1.8;
}

.func-desc p {
  margin: 0 0 8px;
}

.func-desc b {
  color: #1f8f45;
}

.func-desc ul {
  margin: 6px 0;
  padding-left: 18px;
}

.func-desc li {
  margin-bottom: 4px;
}

.panel::-webkit-scrollbar {
  width: 4px;
}

.panel::-webkit-scrollbar-track {
  background: transparent;
}

.panel::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}

.fire-list::-webkit-scrollbar {
  width: 3px;
}

.fire-list::-webkit-scrollbar-track {
  background: transparent;
}

.fire-list::-webkit-scrollbar-thumb {
  background: #dcdfe6;
  border-radius: 2px;
}
</style>
