<template>
  <div class="gis-page">
    <div class="toolbar">
      <button class="btn btn--primary" @click="loadFirePoints">加载火点</button>
      <button class="btn btn--warning" @click="loadRiskHeat">加载火险热力</button>
      <button class="btn btn--success" @click="loadResources">加载应急资源</button>
      <button class="btn btn--danger" @click="clearLayers">清除图层</button>
      <button class="btn btn--default" @click="locateToSichuan">定位四川</button>

      <span class="tag tag--danger">当前火点：{{ fireCount }}</span>
      <span class="tag tag--warning">高风险点：{{ highRiskCount }}</span>
    </div>

    <div class="content">
      <div id="map" class="map"></div>

      <div class="side-panel">
        <h3>空间态势信息</h3>

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
            <div class="desc-value">SWIR阈值 + NDVI + 形态学滤波</div>
          </div>
          <div class="desc-row">
            <div class="desc-label">火险模型</div>
            <div class="desc-value">AHP加权叠加</div>
          </div>
        </div>

        <h3 style="margin-top: 20px">图层控制</h3>

        <label class="checkbox-item">
          <input type="checkbox" v-model="layerVisible.fire" @change="toggleFireLayer" />
          <span>火点标注</span>
        </label>

        <label class="checkbox-item">
          <input type="checkbox" v-model="layerVisible.risk" @change="toggleRiskLayer" />
          <span>火险等级点</span>
        </label>

        <label class="checkbox-item">
          <input type="checkbox" v-model="layerVisible.resource" @change="toggleResourceLayer" />
          <span>应急资源</span>
        </label>

        <h3 style="margin-top: 20px">图例</h3>

        <div class="legend-item">
          <span class="legend-dot fire"></span>
          火点
        </div>

        <div class="legend-item">
          <span class="legend-dot high"></span>
          高风险
        </div>

        <div class="legend-item">
          <span class="legend-dot middle"></span>
          中风险
        </div>

        <div class="legend-item">
          <span class="legend-dot resource"></span>
          应急资源
        </div>

        <h3 style="margin-top: 20px">功能说明</h3>
        <p class="desc">
          当前页面基于 Leaflet 实现二维 GIS 可视化，支持森林区域展示、火点标注、火险等级展示、应急资源点位展示和属性查询。
          后续可接入 PostGIS 空间接口，实现缓冲区分析、路径规划和火点蔓延模拟。
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import L from 'leaflet'
import type { Map, LayerGroup, Polygon } from 'leaflet'
import { Message } from '../utils/message'
import {
  getFirePointsApi,
  getRiskHeatApi,
  getEmergencyResourcesApi
} from '../api'

delete (L.Icon.Default.prototype as any)._getIconUrl

L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href
})

let map: Map | null = null
let fireLayer: LayerGroup | null = null
let riskLayer: LayerGroup | null = null
let resourceLayer: LayerGroup | null = null
let forestLayer: Polygon | null = null

const fireCount = ref<number>(0)
const highRiskCount = ref<number>(0)

const layerVisible = reactive({
  fire: true,
  risk: true,
  resource: true
})

onMounted(() => {
  initMap()
})

function initMap(): void {
  map = L.map('map', {
    center: [30.67, 104.06],
    zoom: 7
  })

  const satelliteLayer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=6&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    minZoom: 3
  }).addTo(map)

  const labelLayer = L.tileLayer('https://webst0{s}.is.autonavi.com/appmaptile?style=8&x={x}&y={y}&z={z}', {
    attribution: '© 高德地图',
    subdomains: ['1', '2', '3', '4'],
    maxZoom: 18,
    minZoom: 3,
    opacity: 0.8
  }).addTo(map)

  fireLayer = L.layerGroup().addTo(map)
  riskLayer = L.layerGroup().addTo(map)
  resourceLayer = L.layerGroup().addTo(map)

  addForestArea()
  loadFirePoints()
  loadRiskHeat()
  loadResources()
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

async function loadFirePoints(): Promise<void> {
  if (!fireLayer) return

  fireLayer.clearLayers()

  const res = await getFirePointsApi()

  if (res.code === 200) {
    fireCount.value = res.data.length

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

    Message.success('火点图层加载完成')
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

      if (item.value >= 80) {
        color = '#f56c6c'
      } else if (item.value >= 60) {
        color = '#e6a23c'
      } else if (item.value >= 40) {
        color = '#ffd666'
      }

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

    Message.success('火险热力图层加载完成')
  }
}

async function loadResources(): Promise<void> {
  if (!resourceLayer) return

  resourceLayer.clearLayers()

  const res = await getEmergencyResourcesApi()

  if (res.code === 200) {
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

    Message.success('应急资源图层加载完成')
  }
}

function clearLayers(): void {
  fireLayer?.clearLayers()
  riskLayer?.clearLayers()
  resourceLayer?.clearLayers()

  fireCount.value = 0
  highRiskCount.value = 0

  Message.info('业务图层已清除')
}

function locateToSichuan(): void {
  map?.setView([30.67, 104.06], 7)
}

function toggleFireLayer(): void {
  if (!map || !fireLayer) return

  if (layerVisible.fire) {
    map.addLayer(fireLayer)
  } else {
    map.removeLayer(fireLayer)
  }
}

function toggleRiskLayer(): void {
  if (!map || !riskLayer) return

  if (layerVisible.risk) {
    map.addLayer(riskLayer)
  } else {
    map.removeLayer(riskLayer)
  }
}

function toggleResourceLayer(): void {
  if (!map || !resourceLayer) return

  if (layerVisible.resource) {
    map.addLayer(resourceLayer)
  } else {
    map.removeLayer(resourceLayer)
  }
}
</script>


<style scoped>
.gis-page {
  width: 100%;
  height: 100%;
}

.toolbar {
  height: 54px;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #ffffff;
  padding: 0 12px;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
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
  background: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn--default:hover {
  color: #1f8f45;
  border-color: #1f8f45;
}

.tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 20px;
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

.content {
  display: flex;
  gap: 12px;
  height: calc(100vh - 150px);
}

.map {
  flex: 1;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.side-panel {
  width: 330px;
  background: #ffffff;
  border-radius: 8px;
  padding: 16px;
  overflow-y: auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.side-panel h3 {
  color: #1f3f2b;
  margin-top: 0;
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
  width: 80px;
  padding: 10px 12px;
  background: #fafafa;
  font-weight: 500;
  color: #606266;
  font-size: 13px;
  flex-shrink: 0;
}

.desc-value {
  flex: 1;
  padding: 10px 12px;
  color: #303133;
  font-size: 13px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #303133;
  cursor: pointer;
  padding: 6px 0;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: #1f8f45;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  color: #606266;
}

.legend-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin-right: 8px;
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

.legend-dot.resource {
  background: #409eff;
}

.desc {
  font-size: 14px;
  color: #606266;
  line-height: 1.8;
}
</style>
