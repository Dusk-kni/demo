<template>
  <div class="page-container">
    <!-- 顶部横幅区域 - 包含背景图和科普文字 -->
    <div class="hero-banner">
      <div class="banner-content">
        <!-- 科普文字 -->
        <div class="banner-text">
          <p class="banner-paragraph">
            应急资源管理的核心意义，是通过统一台账、动态调度与跨部门协同，实现消防、医疗、物资等资源的快速定位与最优调配，既提升火情响应效率、减少损失，也为资源优化配置与应急体系长效完善提供数据支撑。
          </p>
        </div>

        <!-- 统计数据 -->
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">资源总数</span>
            <span class="stat-num">{{ stats.total }}</span>
            <span class="stat-trend up">+12%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">可用资源</span>
            <span class="stat-num green">{{ stats.available }}</span>
            <span class="stat-trend up">+8%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">调度中</span>
            <span class="stat-num">{{ stats.dispatching }}</span>
            <span class="stat-trend down">-3%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">待响应</span>
            <span class="stat-num orange">{{ stats.pending }}</span>
            <span class="stat-trend up">+5%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧地图区域 -->
      <div class="map-section">
        <div id="resource-map" class="map-container"></div>

        <!-- 地图图层控制 -->
        <div class="map-controls">
          <button class="map-btn map-btn-fire" :class="{ active: showFireMarkers }" @click="showFireMarkers = !showFireMarkers">
            <span class="btn-bg"></span>
            <span class="dot orange"></span>
            <span>火点标记</span>
            <span class="count-badge">{{ fireMarkers.length }}</span>
          </button>
        </div>

        <!-- 调度历史 -->
        <div class="history-panel">
          <div class="history-header">
            <div class="header-left">
              <span class="history-icon">📋</span>
              <span>调度历史</span>
            </div>
            <span class="history-count">{{ dispatchHistory.length }} 条</span>
          </div>
          <div class="history-list">
            <div v-for="(item, index) in dispatchHistory" :key="item.id" class="history-item" :style="{ animationDelay: index * 0.1 + 's' }">
              <div class="history-timeline">
                <div class="timeline-dot" :class="item.status"></div>
                <div class="timeline-line" v-if="index < dispatchHistory.length - 1"></div>
              </div>
              <div class="history-content-wrapper">
                <div class="history-time">
                  <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#999" stroke-width="2">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {{ item.time }}
                </div>
                <div class="history-content">{{ item.statusText }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧筛选面板 -->
      <div class="filter-panel">
        <div class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">📦</span>
            资源分类
          </h3>
          <div class="resource-grid">
            <button
              v-for="(type, index) in resourceTypes"
              :key="type.value"
              class="resource-btn"
              :class="{ active: selectedTypes.includes(type.value) }"
              :style="{ animationDelay: index * 0.05 + 's' }"
              @click="toggleType(type.value)"
            >
              <span class="btn-icon">{{ typeIcons[type.value] }}</span>
              {{ type.label }}
            </button>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">🔍</span>
            状态筛选
          </h3>
          <div class="status-tags">
            <label 
              v-for="status in statusOptions" 
              :key="status.value" 
              class="status-tag"
              :class="{ active: selectedStatus.includes(status.value), [status.value]: true }"
              @click.prevent="selectStatus(status.value)"
            >
              <span class="tag-dot" :class="status.value"></span>
              <span>{{ status.label }}</span>
            </label>
          </div>
        </div>

        <div class="panel-section">
          <h3 class="section-title">
            <span class="title-icon">🗺️</span>
            区域筛选
          </h3>
          <div class="region-select-wrapper">
            <select v-model="selectedRegion" class="filter-select">
              <option value="">按行政区筛选</option>
              <option v-for="region in regions" :key="region" :value="region">{{ region }}</option>
            </select>
            <div class="select-arrow">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </div>
          </div>
        </div>

        <div class="panel-section form-section">
          <h3 class="section-title">
            <span class="title-icon">🔎</span>
            精确搜索
          </h3>
          <div class="form-row">
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input v-model="resourceName" type="text" placeholder="资源名称" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <input v-model="resourceCode" type="text" placeholder="编号" class="form-input" />
            </div>
          </div>
        </div>

        <div class="btn-group">
          <button class="btn btn-reset" @click="resetFilters">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
            重置
          </button>
          <button class="btn btn-search" @click="handleSearch">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            查询
          </button>
        </div>
        <div class="result-count" v-if="hasActiveFilter">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#5DBDBD" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          匹配 <strong>{{ filteredMarkers.length }}</strong> / {{ resourceMarkers.length }} 个资源
          <span v-if="filteredMarkers.length === 0" class="no-result-tip">（无匹配）</span>
        </div>

        <div class="panel-section dispatch-section">
          <h3 class="section-title">
            <span class="title-icon">🚀</span>
            调度控制
          </h3>
          <div class="dispatch-form">
            <div class="select-wrapper">
              <select v-model="selectedFirePoint" class="filter-select">
                <option value="">选择火点</option>
                <option v-for="fp in firePoints" :key="fp.id" :value="fp.id">{{ fp.name }}</option>
              </select>
              <span class="fire-icon">🔥</span>
            </div>
            <div class="select-wrapper">
              <select v-model="selectedResource" class="filter-select">
                <option value="">选择可用资源</option>
                <option v-for="r in availableResources" :key="r.id" :value="r.id">{{ r.name }}</option>
              </select>
              <span class="resource-icon">🚒</span>
            </div>
            <button class="btn btn-dispatch" @click="handleDispatch">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
              </svg>
              发起调度
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 资源详情弹窗 -->
    <div v-if="showDetailModal" class="detail-modal-overlay" @click.self="closeDetailModal">
      <div class="detail-modal">
        <div class="modal-header">
          <h3>{{ detailResource.name }}</h3>
          <button class="modal-close" @click="closeDetailModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="detail-label">资源名称</span>
              <span class="detail-value">{{ detailResource.name }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">资源类型</span>
              <span class="detail-value">{{ detailResource.type }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">资源编号</span>
              <code class="detail-value">{{ detailResource.code }}</code>
            </div>
            <div class="detail-item">
              <span class="detail-label">当前状态</span>
              <span class="status-badge" :class="detailResource.status.toLowerCase().replace('中', '')">
                {{ detailResource.status }}
              </span>
            </div>
            <div class="detail-item">
              <span class="detail-label">所属区域</span>
              <span class="detail-value">{{ detailResource.region }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">地理坐标</span>
              <span class="detail-value">
                <span class="coord">📍 {{ detailResource.lat }}, {{ detailResource.lon }}</span>
              </span>
            </div>
          </div>
          <div class="detail-actions">
            <button class="btn btn-primary">修改信息</button>
            <button class="btn btn-secondary">生成调度路线</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, watch, computed } from 'vue'
import L from 'leaflet'
import { getEmergencyResourcesApi } from '../api'
import { Message } from '../utils/message'

// 删除默认图标URL配置
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
})

// ========== 基础数据定义 ==========
const resourceTypes = [
  { label: '消防站', value: 'fire_station' },
  { label: '消防车', value: 'fire_truck' },
  { label: '直升机', value: 'helicopter' },
  { label: '物资仓库', value: 'warehouse' },
  { label: '医疗救护点', value: 'medical' },
  { label: '应急队伍', value: 'team' },
  { label: '水源', value: 'water' }
]

const typeIcons: Record<string, string> = {
  fire_station: '🏢',
  fire_truck: '🚒',
  helicopter: '🚁',
  warehouse: '🏭',
  medical: '🏥',
  team: '👥',
  water: '💧'
}

const typeValueMap: Record<string, string> = {
  '消防站': 'fire_station',
  '消防车': 'fire_truck',
  '直升机': 'helicopter',
  '物资仓库': 'warehouse',
  '医疗救护点': 'medical',
  '应急队伍': 'team',
  '水源': 'water'
}

const statusOptions = [
  { label: '全部', value: 'all' },
  { label: '可用', value: 'available' },
  { label: '调度中', value: 'dispatching' },
  { label: '维修中', value: 'maintenance' }
]

const regions = ['凉山州', '甘孜州', '阿坝州', '雅安市', '成都市']

// 模拟资源数据
const resourceMarkers = ref<{ name: string; type: string; code: string; region: string; lat: number; lon: number; status: string }[]>([])

// 火点数据（从后端获取）
const fireMarkers = ref<{ name: string; lat: number; lon: number; level: string }[]>([])

// ========== 统计数据 ==========
const stats = computed(() => {
  const total = resourceMarkers.value.length
  const available = resourceMarkers.value.filter(r => r.status === '可用').length
  const dispatching = resourceMarkers.value.filter(r => r.status === '调度中').length
  const maintenance = resourceMarkers.value.filter(r => r.status === '维修中').length
  return { total, available, dispatching, pending: maintenance }
})

const selectedTypes = ref<string[]>([])
const selectedStatus = ref<string[]>(['all'])
const selectedRegion = ref('')
const resourceName = ref('')
const resourceCode = ref('')

function toggleType(type: string) {
  if (selectedTypes.value.includes(type)) {
    selectedTypes.value = []
    if (resourceLayer && map) {
      resourceLayer.clearLayers()
      showResourceMarkers.value = false
    }
  } else {
    selectedTypes.value = [type]
    showResourceMarkers.value = true
    addResourceMarkers()
    // 地图视角适配到筛选结果
    if (map && filteredMarkers.value.length > 0) {
      const bounds = L.latLngBounds(filteredMarkers.value.map(m => [m.lat, m.lon]))
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 })
    }
  }
}

function selectStatus(value: string) {
  selectedStatus.value = [value]
}

function resetFilters() {
  selectedTypes.value = []
  selectedStatus.value = ['all']
  selectedRegion.value = ''
  resourceName.value = ''
  resourceCode.value = ''
  if (resourceLayer) {
    resourceLayer.clearLayers()
  }
  showResourceMarkers.value = false
  Message.info('筛选条件已重置')
}

function handleSearch() {
  showResourceMarkers.value = true
  addResourceMarkers()
  const count = filteredMarkers.value.length
  if (count === 0) {
    Message.warning('未找到匹配的资源')
  } else {
    Message.success(`查询完成，找到 ${count} 个资源`)
  }
  // 地图视角适配到筛选结果
  if (map && count > 0) {
    const bounds = L.latLngBounds(filteredMarkers.value.map(m => [m.lat, m.lon]))
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 })
  }
}

// ========== 调度控制 ==========
const firePoints = ref<{ id: number; name: string }[]>([])

// 可用资源列表（状态为"可用"的资源）
const availableResources = computed(() => {
  return resourceMarkers.value
    .filter(r => r.status === '可用')
    .map((r, index) => ({ id: index + 1, name: r.name }))
})

const selectedFirePoint = ref('')
const selectedResource = ref('')

const dispatchHistory = ref<{ id: number; time: string; from: string; to: string; status: string; statusText: string }[]>([])

function handleDispatch() {
  if (!selectedFirePoint.value || !selectedResource.value) {
    Message.warning('请选择火点和资源')
    return
  }
  const fp = firePoints.value.find(f => f.id === Number(selectedFirePoint.value))
  const r = availableResources.value.find(res => res.id === Number(selectedResource.value))
  if (fp && r) {
    // 1. 更新资源状态为"调度中"
    const rm = resourceMarkers.value.find(m => m.name === r.name)
    if (rm) rm.status = '调度中'

    // 2. 添加调度路线（模拟道路弯曲）
    const fm = fireMarkers.value.find(f => f.name === fp.name)
    if (rm && fm) {
      const routeCoords = generateSimulatedRoute(rm.lat, rm.lon, fm.lat, fm.lon)
      dispatchRoutes.value.push({
        from: r.name,
        to: fp.name,
        coords: routeCoords
      })
      // 自动显示调度路线图层
      if (map && routeLayer) {
        addDispatchRoutes()
        if (!map.hasLayer(routeLayer)) {
          map.addLayer(routeLayer)
          showDispatchRoutes.value = true
        }
      }
    }

    // 3. 刷新地图标记（更新颜色）
    addResourceMarkers()

    // 4. 添加历史记录
    dispatchHistory.value.unshift({
      id: Date.now(),
      time: new Date().toLocaleString('zh-CN'),
      from: r.name,
      to: fp.name,
      status: 'pending',
      statusText: '进行中'
    })

    // 5. 地图视角飞到调度路线
    if (rm && fm && map) {
      const bounds = L.latLngBounds([[rm.lat, rm.lon], [fm.lat, fm.lon]])
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 })
    }

    Message.success(`调度成功！${r.name} → ${fp.name}，地图已更新`)
  }
}

// ========== 地图 ==========
let map: L.Map | null = null
let resourceLayer: L.LayerGroup | null = null
let fireLayer: L.LayerGroup | null = null
let routeLayer: L.LayerGroup | null = null

const showResourceMarkers = ref(false)
const showFireMarkers = ref(true)
const showDispatchRoutes = ref(false)

// 详情弹窗相关
const showDetailModal = ref(false)
const detailResource = reactive({
  name: '',
  type: '',
  code: '',
  status: '',
  region: '',
  lat: '',
  lon: ''
})

function showResourceDetail(name: string, type: string, code: string, status: string, region: string, lon: string, lat: string) {
  detailResource.name = name
  detailResource.type = type
  detailResource.code = code
  detailResource.status = status
  detailResource.region = region
  detailResource.lon = lon
  detailResource.lat = lat
  showDetailModal.value = true
}

function closeDetailModal() {
  showDetailModal.value = false
}

// 暴露给全局用于弹窗按钮调用
;(window as any).showResourceDetail = showResourceDetail

// 存储实际调度产生的路线
const dispatchRoutes = ref<Array<{ from: string; to: string; coords: [number, number][] }>>([])

// 生成本地模拟道路路线（不依赖外部服务）
function generateSimulatedRoute(fromLat: number, fromLon: number, toLat: number, toLon: number): [number, number][] {
  const coords: [number, number][] = [[fromLat, fromLon]]
  const totalDist = Math.sqrt(Math.pow(toLat - fromLat, 2) + Math.pow(toLon - fromLon, 2))
  const segments = Math.max(8, Math.round(totalDist * 80)) // 根据距离决定分段数
  const perpScale = totalDist * 0.15 // 弯曲幅度

  for (let i = 1; i < segments; i++) {
    const t = i / segments
    // 线性插值
    let lat = fromLat + (toLat - fromLat) * t
    let lon = fromLon + (toLon - fromLon) * t
    // 添加正弦波偏移模拟道路弯曲
    const offset = Math.sin(t * Math.PI * 2.5) * perpScale * Math.sin(t * Math.PI)
    const angle = Math.atan2(toLat - fromLat, toLon - fromLon) + Math.PI / 2
    lat += Math.cos(angle) * offset
    lon += Math.sin(angle) * offset
    coords.push([lat, lon])
  }
  coords.push([toLat, toLon])
  return coords
}

// 是否有激活的筛选条件
const hasActiveFilter = computed(() => {
  return selectedTypes.value.length > 0
    || (selectedStatus.value.length > 0 && !selectedStatus.value.includes('all'))
    || !!selectedRegion.value
    || !!resourceName.value
    || !!resourceCode.value
})

// 筛选后的资源
const filteredMarkers = computed(() => {
  return resourceMarkers.value.filter(item => {
    // 类型筛选
    const matchType = selectedTypes.value.length === 0 || selectedTypes.value.includes(typeValueMap[item.type] || '')
    // 状态筛选
    const statusMap: Record<string, string> = { all: '可用', available: '可用', dispatching: '调度中', maintenance: '维修中' }
    const matchStatus = selectedStatus.value.length === 0 || selectedStatus.value.some(s => item.status === statusMap[s])
    // 区域筛选
    const matchRegion = !selectedRegion.value || item.region === selectedRegion.value
    // 名称搜索
    const matchName = !resourceName.value || item.name.includes(resourceName.value)
    // 编号搜索
    const matchCode = !resourceCode.value || item.code.includes(resourceCode.value)
    return matchType && matchStatus && matchRegion && matchName && matchCode
  })
})

function initMap() {
  map = L.map('resource-map', {
    center: [27.9, 102.5],
    zoom: 9
  })

  // 高德卫星底图
  L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    minZoom: 3
  }).addTo(map)

  // 高德路网标注
  L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    minZoom: 3,
    opacity: 0.8
  }).addTo(map)

  // 图层组
  resourceLayer = L.layerGroup().addTo(map)
  fireLayer = L.layerGroup().addTo(map)
  routeLayer = L.layerGroup()

  // 添加标记（默认不显示资源）
  addFireMarkers()
}

function addResourceMarkers() {
  if (!resourceLayer) return
  resourceLayer.clearLayers()

  filteredMarkers.value.forEach(item => {
    const color = item.status === '可用' ? '#2196F3' : '#FF9800'
    const marker = L.circleMarker([item.lat, item.lon], {
      radius: 10,
      color: '#fff',
      weight: 2,
      fillColor: color,
      fillOpacity: 0.9
    })
    marker.bindPopup(`
      <div style="min-width: 160px;">
        <b>${item.name}</b><br/>
        类型：${item.type}<br/>
        编号：${item.code}<br/>
        状态：${item.status}<br/>
        区域：${item.region}<br/>
        经度：${item.lon}<br/>
        纬度：${item.lat}<br/>
        <button onclick="showResourceDetail('${item.name}', '${item.type}', '${item.code}', '${item.status}', '${item.region}', '${item.lon}', '${item.lat}')" 
                style="margin-top: 8px; padding: 4px 12px; background: #1E90FF; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
          查看详情
        </button>
      </div>
    `)
    // 永久显示名称+状态标签
    const statusIcon = item.status === '可用' ? '🟢' : item.status === '调度中' ? '🟡' : '🔴'
    marker.bindTooltip(`${statusIcon} ${item.name}（${item.status}）`, {
      permanent: true,
      direction: 'top',
      offset: [0, -12],
      className: `resource-label resource-label--${item.status === '可用' ? 'available' : item.status === '调度中' ? 'dispatching' : 'maintenance'}`
    })
    marker.addTo(resourceLayer!)
  })
}

function addFireMarkers() {
  if (!fireLayer) return
  fireLayer.clearLayers()

  fireMarkers.value.forEach(item => {
    const color = item.level === '高' ? '#f56c6c' : item.level === '中' ? '#FF9800' : '#67c23a'
    const marker = L.circleMarker([item.lat, item.lon], {
      radius: 12,
      color: '#fff',
      weight: 2,
      fillColor: color,
      fillOpacity: 0.9
    })
    marker.bindPopup(`
      <b>${item.name}</b><br/>
      等级：${item.level}<br/>
      经度：${item.lon}<br/>
      纬度：${item.lat}
    `)
    // 永久显示名称+等级标签
    const levelIcon = item.level === '高' ? '🔴' : item.level === '中' ? '🟠' : '🟢'
    marker.bindTooltip(`${levelIcon} ${item.name}（${item.level}危）`, {
      permanent: true,
      direction: 'top',
      offset: [0, -14],
      className: `fire-label fire-label--${item.level === '高' ? 'high' : item.level === '中' ? 'medium' : 'low'}`
    })
    marker.addTo(fireLayer!)
  })
}

function addDispatchRoutes() {
  if (!routeLayer) return
  routeLayer.clearLayers()

  // 获取当前筛选后的资源名称列表
  const visibleResourceNames = filteredMarkers.value.map(m => m.name)

  // 只绘制起点资源在当前筛选结果中的路线
  dispatchRoutes.value.forEach((route) => {
    // 如果有筛选条件且起点资源不在可见列表中，跳过该路线
    if (hasActiveFilter.value && !visibleResourceNames.includes(route.from)) {
      return
    }
    
    const line = L.polyline(route.coords as L.LatLngExpression[], {
      color: '#00bcd4',
      weight: 4,
      opacity: 0.9,
      dashArray: '10, 5'
    })
    line.bindPopup(`<b>调度路线</b><br/>${route.from} → ${route.to}<br/>途经点: ${route.coords.length} 个`)
    line.addTo(routeLayer!)
  })
}

// 监听筛选条件变化，自动更新地图（仅在有选中类型时更新）
watch([selectedTypes, selectedStatus, selectedRegion, resourceName, resourceCode], () => {
  if (map && selectedTypes.value.length > 0) {
    addResourceMarkers()
    // 如果路线图层正在显示，同步更新路线
    if (showDispatchRoutes.value) {
      addDispatchRoutes()
    }
    // 自动适配到筛选结果
    const count = filteredMarkers.value.length
    if (count > 0) {
      const bounds = L.latLngBounds(filteredMarkers.value.map(m => [m.lat, m.lon]))
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 11 })
    }
  }
})

// 监听图层显示状态
watch(showResourceMarkers, (val) => {
  if (!map || !resourceLayer) return
  val ? map.addLayer(resourceLayer) : map.removeLayer(resourceLayer)
})

watch(showFireMarkers, (val) => {
  if (!map || !fireLayer) return
  val ? map.addLayer(fireLayer) : map.removeLayer(fireLayer)
})

watch(showDispatchRoutes, (val) => {
  if (!map || !routeLayer) return
  if (val) {
    addDispatchRoutes()
    map.addLayer(routeLayer)
  } else {
    map.removeLayer(routeLayer)
  }
})

async function fetchEmergencyResources() {
  try {
    const res = await getEmergencyResourcesApi()
    if (res.code === 200 && res.data) {
      resourceMarkers.value = res.data.map(item => ({
        name: item.name || '未知资源',
        type: item.type || '其他',
        code: item.code || '',
        region: item.region || '',
        lat: item.latitude ?? item.lat,
        lon: item.longitude ?? item.lon,
        status: item.status || '可用'
      }))
    }
  } catch {
    // 后端未就绪时静默处理
  }
}

onMounted(() => {
  fetchEmergencyResources()
  initMap()
})

onUnmounted(() => {
  map?.remove()
})
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  gap: 12px;
}

/* 顶部横幅区域 */
.hero-banner {
  position: relative;
  width: 100%;
  height: 140px;
  border-radius: 16px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background-image: url('/satellite.png');
  background-size: cover;
  background-position: center;
}

.banner-content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.5);
}

.banner-text {
  max-width: 100%;
}

.banner-paragraph {
  color: rgba(255, 255, 255, 0.95);
  font-size: 15px;
  line-height: 1.6;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-family: "SimSun", "Songti SC", serif;
  letter-spacing: 0.5px;
}

/* 统计数据行 */
.stats-row {
  display: flex;
  gap: 15px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-row .stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stats-row .stat-label {
  font-size: 10px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 3px;
}

.stats-row .stat-num {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.stats-row .stat-num.green {
  color: #fff;
}

.stats-row .stat-num.orange {
  color: #fff;
}

.stats-row .stat-trend {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 6px;
  font-weight: 600;
  align-self: flex-start;
  margin-top: 2px;
}

.stats-row .stat-trend.up {
  color: #10b981;
  background: rgba(16, 185, 129, 0.2);
}

.stats-row .stat-trend.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

/* 主内容区域 */
.main-content {
  flex: 1;
  display: flex;
  gap: 12px;
  min-height: 0;
  overflow: hidden;
}

/* 左侧筛选面板 */
.filter-panel {
  width: 380px;
  height: 100%;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  padding: 16px;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
}

.panel-section {
  margin-bottom: 12px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 6px;
}

.title-icon {
  font-size: 16px;
}

/* 资源分类网格 */
.resource-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.resource-btn {
  padding: 10px 8px;
  border: 1px solid #e8e8e8;
  border-radius: 10px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  animation: fadeInUp 0.5s ease-out both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.resource-btn:hover {
  border-color: #5DBDBD;
  color: #5DBDBD;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(93, 189, 189, 0.2);
}

.resource-btn.active {
  background: linear-gradient(145deg, #5DBDBD, #4ca8a8);
  border-color: #5DBDBD;
  color: #fff;
  font-weight: 500;
  box-shadow: 0 4px 15px rgba(93, 189, 189, 0.4);
}

.btn-icon {
  font-size: 20px;
  line-height: 1;
}

/* 状态标签组 */
.status-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.status-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  background: #f5f5f5;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid transparent;
}

.status-tag:hover {
  background: #e8e8e8;
}

.status-tag.active {
  background: linear-gradient(145deg, #5DBDBD, #4ca8a8);
  color: #fff;
  box-shadow: 0 2px 8px rgba(93, 189, 189, 0.3);
}

.status-tag input[type="checkbox"] {
  display: none;
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tag-dot.all {
  background: #999;
}

.tag-dot.available {
  background: #4ade80;
}

.tag-dot.dispatching {
  background: #fbbf24;
}

.tag-dot.maintenance {
  background: #f87171;
}

.status-tag.active .tag-dot {
  background: #fff !important;
}

/* 下拉选择 */
.region-select-wrapper {
  position: relative;
}

.filter-select {
  width: 100%;
  padding: 8px 32px 8px 12px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  background: linear-gradient(145deg, #ffffff, #f8f8f8);
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s;
}

.filter-select:focus {
  border-color: #5DBDBD;
  box-shadow: 0 0 0 3px rgba(93, 189, 189, 0.1);
}

.select-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #999;
  pointer-events: none;
}

.select-wrapper {
  position: relative;
  margin-bottom: 8px;
}

.fire-icon, .resource-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
}

/* 表单输入 */
.form-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.form-row {
  margin-bottom: 8px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 10px;
  color: #999;
}

.form-input {
  width: 100%;
  padding: 8px 10px 8px 32px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  font-size: 12px;
  outline: none;
  background: linear-gradient(145deg, #ffffff, #f8f8f8);
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #5DBDBD;
  box-shadow: 0 0 0 3px rgba(93, 189, 189, 0.1);
}

/* 按钮组 */
.btn-group {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-reset {
  background: linear-gradient(145deg, #f5f5f5, #e8e8e8);
  color: #666;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.btn-reset:hover {
  background: linear-gradient(145deg, #e8e8e8, #ddd);
  transform: translateY(-1px);
}

.btn-search {
  background: linear-gradient(145deg, #5DBDBD, #4ca8a8);
  color: #fff;
  box-shadow: 0 4px 12px rgba(93, 189, 189, 0.3);
}

.btn-search:hover {
  background: linear-gradient(145deg, #4ca8a8, #3d9999);
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(93, 189, 189, 0.4);
}

/* 筛选结果计数 */
.result-count {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(93, 189, 189, 0.1), rgba(93, 189, 189, 0.05));
  border-radius: 8px;
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.result-count strong {
  color: #5DBDBD;
  font-size: 16px;
}

.result-count .no-result-tip {
  color: #f56c6c;
  font-size: 11px;
}

/* 调度控制 */
.dispatch-section {
  border-top: 1px solid #f0f0f0;
  padding-top: 12px;
}

.dispatch-form {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.btn-dispatch {
  background: linear-gradient(145deg, #ff6b6b, #ee5a5a);
  color: #fff;
  margin-top: 4px;
  padding: 10px 12px;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-dispatch:hover {
  background: linear-gradient(145deg, #ee5a5a, #dd4949);
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(255, 107, 107, 0.4);
}

.btn-dispatch:hover {
  border-color: #5DBDBD;
  color: #5DBDBD;
}

/* 右侧地图区域 */
.map-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.map-container {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

/* 地图控制按钮 */
.map-controls {
  display: flex;
  gap: 10px;
}

.map-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 20px;
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.map-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
}

.map-btn.active {
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.map-btn-resource.active {
  background: linear-gradient(145deg, #2196F3, #1976D2);
}

.map-btn-fire.active {
  background: linear-gradient(145deg, #FF9800, #F57C00);
}

.map-btn-route.active {
  background: linear-gradient(145deg, #00bcd4, #00acc1);
}

.btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  transition: opacity 0.3s;
}

.map-btn.active .btn-bg {
  opacity: 1;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  position: relative;
  z-index: 1;
}

.dot.blue {
  background: #2196F3;
}

.dot.orange {
  background: #FF9800;
}

.dot.green {
  background: #00bcd4;
}

.map-btn.active .dot {
  background: #fff !important;
}

.count-badge {
  background: #f0f0f0;
  color: #666;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 10px;
  margin-left: 4px;
  position: relative;
  z-index: 1;
}

.map-btn.active .count-badge {
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
}

/* 调度历史面板 */
.history-panel {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05);
  max-height: 280px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.history-header {
  padding: 10px 14px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 6px;
}

.history-icon {
  font-size: 14px;
}

.history-count {
  font-size: 11px;
  color: #999;
  font-weight: normal;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.history-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px 14px;
}

.history-item {
  display: flex;
  gap: 10px;
  padding: 8px 0;
  animation: slideIn 0.5s ease-out both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.history-timeline {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 16px;
  flex-shrink: 0;
}

.timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px currentColor;
}

.timeline-dot.success {
  background: #67c23a;
  color: #67c23a;
}

.timeline-dot.pending {
  background: #e6a23c;
  color: #e6a23c;
}

.timeline-line {
  flex: 1;
  width: 2px;
  background: linear-gradient(180deg, #e0e0e0, transparent);
  margin: 4px 0;
}

.history-content-wrapper {
  flex: 1;
}

.history-time {
  font-size: 11px;
  color: #999;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.history-content {
  font-size: 12px;
  color: #666;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.route-text {
  color: #333;
}

.arrow {
  color: #5DBDBD;
  font-weight: bold;
}

.tag {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.tag.success {
  background: linear-gradient(145deg, #67c23a, #5daf34);
  color: #fff;
}

.tag.pending {
  background: linear-gradient(145deg, #e6a23c, #d4912d);
  color: #fff;
}

.empty-tip {
  text-align: center;
  color: #999;
  font-size: 13px;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 32px;
  opacity: 0.5;
}
</style>

<!-- 全局样式：地图标签（Leaflet tooltip 挂载在 body 上，scoped 无效） -->
<style>
/* 资源标签 - 可用 */
.resource-label--available {
  background: #2196F3 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 6px rgba(33,150,243,0.3) !important;
}
.resource-label--available::before {
  border-top-color: #2196F3 !important;
}

/* 资源标签 - 调度中 */
.resource-label--dispatching {
  background: #FF9800 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 6px rgba(255,152,0,0.3) !important;
}
.resource-label--dispatching::before {
  border-top-color: #FF9800 !important;
}

/* 资源标签 - 维修中 */
.resource-label--maintenance {
  background: #f56c6c !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 6px rgba(245,108,108,0.3) !important;
}
.resource-label--maintenance::before {
  border-top-color: #f56c6c !important;
}

/* 火点标签 - 高危 */
.fire-label--high {
  background: #f56c6c !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 6px rgba(245,108,108,0.3) !important;
}
.fire-label--high::before {
  border-top-color: #f56c6c !important;
}

/* 火点标签 - 中危 */
.fire-label--medium {
  background: #FF9800 !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 6px rgba(255,152,0,0.3) !important;
}
.fire-label--medium::before {
  border-top-color: #FF9800 !important;
}

/* 火点标签 - 低危 */
.fire-label--low {
  background: #67c23a !important;
  color: #fff !important;
  border: none !important;
  border-radius: 4px !important;
  padding: 2px 8px !important;
  font-size: 12px !important;
  font-weight: 600 !important;
  white-space: nowrap !important;
  box-shadow: 0 2px 6px rgba(103,194,58,0.3) !important;
}
.fire-label--low::before {
  border-top-color: #67c23a !important;
}
/* 资源详情弹窗 */
.detail-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.detail-modal {
  background: #fff;
  border-radius: 12px;
  width: 90%;
  max-width: 450px;
  overflow: hidden;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.detail-modal .modal-header {
  padding: 16px 20px;
  background: linear-gradient(135deg, #1E90FF, #00BCD4);
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-modal .modal-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.detail-modal .modal-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.detail-modal .modal-close:hover {
  background: rgba(255, 255, 255, 0.3);
}

.detail-modal .modal-body {
  padding: 20px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
  margin-bottom: 20px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-label {
  font-size: 12px;
  color: #999;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.detail-item code {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #666;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.可用 {
  background: #e8f5e9;
  color: #4caf50;
}

.status-badge.调度 {
  background: #fff3e0;
  color: #ff9800;
}

.status-badge.维修 {
  background: #ffebee;
  color: #f44336;
}

.coord {
  font-size: 13px;
  color: #1E90FF;
}

.detail-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.detail-actions .btn {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: linear-gradient(135deg, #1E90FF, #00BCD4);
  color: #fff;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(30, 144, 255, 0.3);
}

.btn-secondary {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-secondary:hover {
  border-color: #1E90FF;
  color: #1E90FF;
}

/* End of EmergencyResource.vue */
</style>
