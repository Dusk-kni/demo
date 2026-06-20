<template>
  <div class="page-container">
    <!-- 顶部横幅区域 - 包含背景图和科普文字 -->
    <div class="hero-banner">
      <div class="banner-content">
        <!-- 科普文字 -->
        <div class="banner-text">
          <p class="banner-paragraph">
            数据分类管理是森林火灾监测系统的数据基础：通过标准化分类体系，实现多源数据的统一管理与快速检索，为火情研判、资源调度提供精准的数据支撑。
          </p>
        </div>

        <!-- 统计数据 -->
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">数据分类总数</span>
            <span class="stat-num">{{ stats.totalCategories }}</span>
            <span class="stat-trend up">+12%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">数据集总数</span>
            <span class="stat-num green">{{ stats.totalDatasets }}</span>
            <span class="stat-trend up">+8%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">存储容量</span>
            <span class="stat-num">{{ stats.dataSize }} GB</span>
            <span class="stat-trend up">+15%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">更新频率</span>
            <span class="stat-num orange">{{ stats.updateRate }}%</span>
            <span class="stat-trend up">+5%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="chart-section">
      <div class="chart-card">
        <div class="chart-header">
          <h3>数据分类统计</h3>
          <div class="chart-tabs">
            <button 
              class="chart-tab" 
              :class="{ active: chartType === 'bar' }"
              @click="switchChart('bar')"
            >
              柱状图
            </button>
            <button 
              class="chart-tab" 
              :class="{ active: chartType === 'pie' }"
              @click="switchChart('pie')"
            >
              饼图
            </button>
          </div>
        </div>
        <div ref="chartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 分类列表 -->
    <div class="category-list-section">
      <h3>分类列表</h3>
      <table class="category-table">
        <thead>
          <tr>
            <th>分类名称</th>
            <th>编码</th>
            <th>数据量</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="category in tableData" :key="category.code">
            <td>
              <span class="category-color" :style="{ background: category.color }"></span>
              {{ category.name }}
            </td>
            <td><code>{{ category.code }}</code></td>
            <td>{{ category.dataCount }} 个</td>
            <td>{{ category.createTime }}</td>
            <td>
              <button class="btn btn--small btn--primary" @click="showDetailModal(category)">管理数据</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 操作按钮 -->
    <div class="action-bar">
      <button class="btn btn--primary" @click="showAddModalFunc">+ 新增分类</button>
      <button class="btn btn--secondary" @click="showExportModalFunc">导出数据</button>
      <button class="btn btn--secondary" @click="handleRefresh">刷新</button>
      <button class="btn btn--secondary" @click="resetData">重置数据</button>
    </div>

    <!-- 详情弹窗 -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <span class="category-badge" :style="{ background: selectedCategory?.color }">
              {{ selectedCategory?.name }}
            </span>
            <span class="modal-subtitle">{{ isReadOnly ? '数据预览' : '数据管理' }}</span>
          </div>
          <button class="modal-close" @click="closeModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <!-- 分类信息 -->
          <div class="info-section">
            <h4>分类信息</h4>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">分类编码</span>
                <code>{{ selectedCategory?.code }}</code>
              </div>
              <div class="info-item">
                <span class="info-label">数据集数量</span>
                <span class="info-value">{{ currentDatasets.length }} 个</span>
              </div>
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">{{ selectedCategory?.createTime }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">描述</span>
                <span class="info-value">{{ selectedCategory?.desc }}</span>
              </div>
            </div>
          </div>
          
          <!-- 数据集列表 -->
          <div class="dataset-section">
            <div class="section-header">
              <h4>数据集列表</h4>
              <button v-if="!isReadOnly" class="btn btn--small btn--primary" @click="showAssignModal = true">+ 添加数据</button>
            </div>
            <table class="detail-table">
              <thead>
                <tr>
                  <th>序号</th>
                  <th>数据集名称</th>
                  <th>文件大小</th>
                  <th>更新时间</th>
                  <th>状态</th>
                  <th v-if="!isReadOnly">操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in currentDatasets" :key="item.id">
                  <td>{{ index + 1 }}</td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.size }}</td>
                  <td>{{ item.updateTime }}</td>
                  <td>
                    <span class="status-tag" :class="item.status">
                      {{ item.status === 'active' ? '正常' : item.status === 'warning' ? '警告' : '离线' }}
                    </span>
                  </td>
                  <td v-if="!isReadOnly">
                    <button class="btn btn--small btn--danger" @click="removeDataset(item.id)">移除</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--primary" @click="closeModal">关闭</button>
        </div>
      </div>
    </div>

    <!-- 数据分配弹窗 -->
    <div v-if="showAssignModal" class="modal-overlay" @click.self="showAssignModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">📥</span>
            <span>添加数据到 "{{ selectedCategory?.name }}"</span>
          </div>
          <button class="modal-close" @click="showAssignModal = false">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <h4>选择要添加的数据</h4>
            <div class="assign-search-wrapper">
              <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input type="text" placeholder="关键词搜索（数据集名称、文件大小）" v-model="assignSearchKeyword" class="assign-search-input" />
              <button v-if="assignSearchKeyword" class="search-clear" @click="assignSearchKeyword = ''">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </button>
            </div>
            <table class="select-table">
              <thead>
                <tr>
                  <th><input type="checkbox" @change="selectAllDatasets" :checked="selectedDatasets.length === unassignedDatasets.length && unassignedDatasets.length > 0" /></th>
                  <th>数据集名称</th>
                  <th>文件大小</th>
                  <th>当前分类</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="dataset in unassignedDatasets" :key="dataset.id">
                  <td><input type="checkbox" v-model="selectedDatasets" :value="dataset.id" /></td>
                  <td>{{ dataset.name }}</td>
                  <td>{{ dataset.size }}</td>
                  <td>
                    <span v-if="dataset.categoryCode" class="category-tag">
                      {{ tableData.find(c => c.code === dataset.categoryCode)?.name || '其他' }}
                    </span>
                    <span v-else class="category-tag unassigned">未分配</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary" @click="showAssignModal = false">取消</button>
          <button class="btn btn--primary" @click="confirmAssignDatasets">确认添加</button>
        </div>
      </div>
    </div>

    <!-- 新增分类弹窗 -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">➕</span>
            <span>新增数据分类</span>
          </div>
          <button class="modal-close" @click="closeAddModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <h4>选择分类类型</h4>
            <table class="select-table">
              <thead>
                <tr>
                  <th><input type="checkbox" @change="selectAllCategories" :checked="allCategoriesSelected" /></th>
                  <th>分类名称</th>
                  <th>描述</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="category in availableCategories" :key="category.name">
                  <td><input type="checkbox" v-model="selectedCategories" :value="category.name" /></td>
                  <td>{{ category.name }}</td>
                  <td>{{ category.desc }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="form-section">
            <h4>自定义分类信息</h4>
            <div class="form-row">
              <div class="form-item">
                <label>分类名称</label>
                <input v-model="newCategory.name" type="text" placeholder="请输入分类名称" class="form-input" />
              </div>
              <div class="form-item">
                <label>分类编码</label>
                <input v-model="newCategory.code" type="text" placeholder="请输入分类编码" class="form-input" />
              </div>
            </div>
            <div class="form-item">
              <label>描述</label>
              <textarea v-model="newCategory.desc" placeholder="请输入分类描述" class="form-textarea"></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary" @click="closeAddModal">取消</button>
          <button class="btn btn--primary" @click="confirmAddCategory">确认新增</button>
        </div>
      </div>
    </div>

    <!-- 导出数据弹窗 -->
    <div v-if="showExportModal" class="modal-overlay" @click.self="closeExportModal">
      <div class="modal-content">
        <div class="modal-header">
          <div class="modal-title">
            <span class="modal-icon">📥</span>
            <span>导出数据</span>
          </div>
          <button class="modal-close" @click="closeExportModal">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-section">
            <h4>导出设置</h4>
            <div class="path-detail">
              <input type="text" v-model="exportConfig.filename" placeholder="文件名（可选）" class="form-input" />
              <select v-model="exportConfig.format" class="form-input">
                <option value="json">JSON 格式</option>
                <option value="csv">CSV 格式</option>
                <option value="excel">Excel 格式</option>
              </select>
            </div>
          </div>
          <div class="form-section">
            <h4>选择要导出的数据</h4>
            <table class="select-table">
              <thead>
                <tr>
                  <th><input type="checkbox" @change="selectAllExport" :checked="allExportSelected" /></th>
                  <th>分类名称</th>
                  <th>数据量</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in tableData" :key="item.name">
                  <td><input type="checkbox" v-model="selectedExportItems" :value="item.name" /></td>
                  <td>{{ item.name }}</td>
                  <td>{{ item.dataCount }} 条</td>
                  <td>{{ item.createTime }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn--secondary" @click="closeExportModal">取消</button>
          <button class="btn btn--primary" @click="confirmExport">开始导出</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue'
import { getCategoriesApi } from '../api'
import * as echarts from 'echarts'

const stats = reactive({
  totalCategories: 0,
  totalDatasets: 0,
  dataSize: 0,
  updateRate: 0
})

interface TableDataItem {
  name: string
  code: string
  desc: string
  dataCount: number
  createTime: string
  color?: string
}

// 默认分类数据（从后端获取）
const defaultTableData: TableDataItem[] = []

// 从 localStorage 读取分类数据，如果没有则使用默认数据
const savedTableData = localStorage.getItem('dataCategory_tableData')
const tableData = ref<TableDataItem[]>(savedTableData ? JSON.parse(savedTableData) : defaultTableData)

// 所有可用数据（每条数据只能属于一个分类）
interface DatasetItem {
  id: number
  name: string
  size: string
  updateTime: string
  status: string
  categoryCode: string | null  // 当前所属分类
}

// 默认数据集（从后端获取）
const defaultDatasets: DatasetItem[] = []

// 从 localStorage 读取数据集，如果没有则使用默认数据
const savedDatasets = localStorage.getItem('dataCategory_allDatasets')
const allDatasets = ref<DatasetItem[]>(savedDatasets ? JSON.parse(savedDatasets) : defaultDatasets)

// 获取某分类的数据集
function getDatasetsByCategory(code: string): DatasetItem[] {
  return allDatasets.value.filter(d => d.categoryCode === code)
}

// 更新分类数据量
function updateCategoryDataCount() {
  tableData.value.forEach(category => {
    category.dataCount = getDatasetsByCategory(category.code).length
  })
}

// 分配数据到分类
function assignDatasetToCategory(datasetId: number, categoryCode: string) {
  const dataset = allDatasets.value.find(d => d.id === datasetId)
  if (dataset) {
    // 如果数据之前属于其他分类，先移除
    if (dataset.categoryCode) {
      const oldCategory = tableData.value.find(c => c.code === dataset.categoryCode)
      if (oldCategory) {
        oldCategory.dataCount--
      }
    }
    // 分配到新分类
    dataset.categoryCode = categoryCode
    const newCategory = tableData.value.find(c => c.code === categoryCode)
    if (newCategory) {
      newCategory.dataCount++
    }
    initChart()
  }
}

// 从分类移除数据
function removeDatasetFromCategory(datasetId: number) {
  const dataset = allDatasets.value.find(d => d.id === datasetId)
  if (dataset && dataset.categoryCode) {
    const category = tableData.value.find(c => c.code === dataset.categoryCode)
    if (category) {
      category.dataCount--
    }
    dataset.categoryCode = null
    initChart()
  }
}

// 图表相关
const chartRef = ref<HTMLElement | null>(null)
let chartInstance: echarts.ECharts | null = null
const chartType = ref<'bar' | 'pie'>('bar')

// 弹窗相关
const showModal = ref(false)
const selectedCategory = ref<TableDataItem | null>(null)
const isReadOnly = ref(false) // 只读模式：点击柱状图时为true，点击管理按钮时为false

const currentDatasets = computed(() => {
  if (!selectedCategory.value) return []
  return getDatasetsByCategory(selectedCategory.value.code)
})

// 数据分配弹窗相关
const showAssignModal = ref(false)
const selectedDatasets = ref<number[]>([])
const assignSearchKeyword = ref('')

// 获取未分配的数据和其他分类的数据（可重新分配），支持关键词搜索
const unassignedDatasets = computed(() => {
  let datasets = allDatasets.value.filter(d => !d.categoryCode || d.categoryCode !== selectedCategory.value?.code)
  
  if (assignSearchKeyword.value.trim()) {
    const keyword = assignSearchKeyword.value.toLowerCase().trim()
    datasets = datasets.filter(d => 
      d.name.toLowerCase().includes(keyword) ||
      d.size.toLowerCase().includes(keyword)
    )
  }
  
  return datasets
})

function removeDataset(datasetId: number) {
  if (confirm('确定要将此数据从该分类中移除吗？')) {
    removeDatasetFromCategory(datasetId)
  }
}

function confirmAssignDatasets() {
  if (selectedDatasets.value.length === 0) {
    alert('请至少选择一个数据')
    return
  }
  
  if (!selectedCategory.value) return
  
  selectedDatasets.value.forEach(id => {
    assignDatasetToCategory(id, selectedCategory.value!.code)
  })
  
  alert(`成功将 ${selectedDatasets.value.length} 个数据添加到 "${selectedCategory.value.name}" 分类`)
  selectedDatasets.value = []
  showAssignModal.value = false
}

function selectAllDatasets(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    selectedDatasets.value = unassignedDatasets.value.map(d => d.id)
  } else {
    selectedDatasets.value = []
  }
}

// 新增分类弹窗相关
const showAddModal = ref(false)
// 获取当前不存在的可选分类（过滤掉已有的分类）
const availableCategories = computed(() => {
  const existingNames = tableData.value.map(item => item.name)
  const allCategories = [
    { name: '火点数据', code: 'FIRE_POINT', desc: '遥感识别与人工审核后的火点矢量数据', color: '#FF6B6B' },
    { name: '遥感影像', code: 'REMOTE_IMAGE', desc: 'Sentinel、Landsat、MODIS 等多源遥感影像', color: '#4ECDC4' },
    { name: '应急资源', code: 'EMERGENCY_RESOURCE', desc: '消防站、水源、直升机坪等应急资源数据', color: '#45B7D1' },
    { name: '气象数据', code: 'WEATHER_DATA', desc: '温度、湿度、风速等气象因子', color: '#FFA07A' },
    { name: '地形数据', code: 'TERRAIN_DATA', desc: 'DEM、坡度、坡向等地形因子数据', color: '#96CEB4' },
    { name: '植被数据', code: 'VEGETATION_DATA', desc: 'NDVI、植被覆盖度等植被指数', color: '#88D8B0' },
    { name: '土壤数据', code: 'SOIL_DATA', desc: '土壤类型、有机质含量等土壤数据', color: '#CD853F' },
    { name: '水系数据', code: 'WATER_DATA', desc: '河流、湖泊、水库等水系分布数据', color: '#1E90FF' },
    { name: '道路数据', code: 'ROAD_DATA', desc: '公路、铁路、林道等交通路网数据', color: '#8B4513' },
    { name: '人口数据', code: 'POPULATION_DATA', desc: '居民点、人口密度等人口分布数据', color: '#9370DB' }
  ]
  return allCategories.filter(c => !existingNames.includes(c.name))
})
const selectedCategories = ref<string[]>([])
const newCategory = reactive({
  name: '',
  code: '',
  desc: ''
})

const allCategoriesSelected = computed(() => {
  return selectedCategories.value.length === availableCategories.value.length
})

function selectAllCategories(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    selectedCategories.value = availableCategories.value.map(c => c.name)
  } else {
    selectedCategories.value = []
  }
}

function showAddModalFunc() {
  showAddModal.value = true
}

function closeAddModal() {
  showAddModal.value = false
  selectedCategories.value = []
  newCategory.name = ''
  newCategory.code = ''
  newCategory.desc = ''
}

// 生成随机颜色
function generateRandomColor() {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#96CEB4', '#88D8B0', '#DDA0DD', '#F0E68C', '#87CEEB', '#98FB98']
  return colors[Math.floor(Math.random() * colors.length)]
}

function confirmAddCategory() {
  const selected = selectedCategories.value
  const custom = newCategory.name ? [newCategory] : []
  
  if (selected.length === 0 && custom.length === 0) {
    alert('请至少选择一个分类类型或填写自定义分类信息')
    return
  }
  
  let addedCount = 0
  
  selected.forEach(name => {
    const existing = tableData.value.find(item => item.name === name)
    if (!existing) {
      const categoryInfo = availableCategories.value.find(c => c.name === name)
      const newItem: TableDataItem = {
        name: name,
        code: categoryInfo?.code || name.replace(/\s+/g, '_').toUpperCase(),
        dataCount: 0,
        createTime: new Date().toISOString().split('T')[0],
        desc: categoryInfo?.desc || '',
        color: categoryInfo?.color || generateRandomColor()
      }
      tableData.value.push(newItem)
      addedCount++
    }
  })
  
  if (custom.length > 0) {
    const existing = tableData.value.find(item => item.name === newCategory.name)
    if (!existing) {
      const newItem: TableDataItem = {
        name: newCategory.name,
        code: newCategory.code || newCategory.name.replace(/\s+/g, '_').toUpperCase(),
        dataCount: 0,
        createTime: new Date().toISOString().split('T')[0],
        desc: newCategory.desc || '',
        color: generateRandomColor()
      }
      tableData.value.push(newItem)
      addedCount++
    }
  }
  
  if (addedCount > 0) {
    alert(`成功新增 ${addedCount} 个分类！`)
    initChart()
  } else {
    alert('所选分类已存在，无需重复添加')
  }
  
  closeAddModal()
}

// 导出数据弹窗相关
const showExportModal = ref(false)
const selectedExportItems = ref<string[]>([])
const exportConfig = reactive({
  filename: '',
  format: 'json'
})

const allExportSelected = computed(() => {
  return selectedExportItems.value.length === tableData.value.length
})

function selectAllExport(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.checked) {
    selectedExportItems.value = tableData.value.map(item => item.name)
  } else {
    selectedExportItems.value = []
  }
}

function showExportModalFunc() {
  showExportModal.value = true
}

function closeExportModal() {
  showExportModal.value = false
  selectedExportItems.value = []
  exportConfig.filename = ''
  exportConfig.format = 'json'
}

function confirmExport() {
  if (selectedExportItems.value.length === 0) {
    alert('请至少选择一个要导出的数据分类')
    return
  }
  
  const selectedData = tableData.value.filter(item => selectedExportItems.value.includes(item.name))
  let filename = exportConfig.filename || `data_export_${new Date().toISOString().split('T')[0]}`
  
  let content = ''
  let type = 'text/plain'
  
  if (exportConfig.format === 'json') {
    content = JSON.stringify(selectedData, null, 2)
    filename += '.json'
    type = 'application/json'
  } else if (exportConfig.format === 'csv') {
    content = '分类名称,编码,数据量,创建时间,描述\n' + 
              selectedData.map(item => 
                `"${item.name}","${item.code}",${item.dataCount},"${item.createTime}","${item.desc}"`
              ).join('\n')
    filename += '.csv'
    type = 'text/csv'
  } else {
    content = selectedData.map(item => 
      `${item.name}\t${item.code}\t${item.dataCount}\t${item.createTime}\t${item.desc}`
    ).join('\n')
    filename += '.txt'
  }
  
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  alert(`数据已导出！\n文件名: ${filename}\n格式: ${exportConfig.format.toUpperCase()}`)
  closeExportModal()
}

function switchChart(type: 'bar' | 'pie') {
  chartType.value = type
  initChart()
}

function initChart() {
  if (!chartRef.value) return
  
  if (chartInstance) {
    chartInstance.dispose()
  }
  
  chartInstance = echarts.init(chartRef.value)
  
  const option = chartType.value === 'bar' ? getBarOption() : getPieOption()
  chartInstance.setOption(option)
  
  // 使用 nextTick 确保图表完全渲染后再绑定点击事件
  nextTick(() => {
    if (chartInstance) {
      chartInstance.off('click') // 先移除旧的事件监听
      chartInstance.on('click', (params: any) => {
        if (params && params.name) {
          const categoryName = params.name
          const category = tableData.value.find(item => item.name === categoryName)
          if (category) {
            showDetailModal(category, true) // 点击柱状图：只读模式
          }
        }
      })
    }
  })
}

function getBarOption() {
  const defaultColors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4']
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      textStyle: {
        color: '#333'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: tableData.value.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisLabel: {
        interval: 0,
        rotate: 15,
        fontSize: 12,
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      name: '数据量 (条)',
      nameTextStyle: {
        color: '#666'
      },
      axisLine: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisTick: {
        lineStyle: {
          color: '#ccc'
        }
      },
      axisLabel: {
        color: '#666'
      },
      splitLine: {
        lineStyle: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    },
    series: [
      {
        name: '数据量',
        type: 'bar',
        data: tableData.value.map((item, index) => {
          const color = item.color || defaultColors[index % defaultColors.length]
          return {
            value: item.dataCount,
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: color },
                { offset: 1, color: echarts.color.modifyAlpha(color, 0.6) as string }
              ]),
              borderRadius: [4, 4, 0, 0]
            }
          }
        }),
        barWidth: '50%',
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        }
      }
    ]
  }
}

function getPieOption() {
  const defaultColors = ['#5470C6', '#91CC75', '#FAC858', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4']
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 条 ({d}%)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      textStyle: {
        color: '#333'
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '5%',
      itemGap: 20,
      textStyle: {
        color: '#666'
      }
    },
    series: [
      {
        name: '数据分类',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{d}%',
          color: '#666'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#333'
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          }
        },
        data: tableData.value.map((item, index) => ({
          value: item.dataCount,
          name: item.name,
          itemStyle: { color: item.color || defaultColors[index % defaultColors.length] }
        }))
      }
    ]
  }
}

function showDetailModal(category: TableDataItem, readOnly: boolean = false) {
  selectedCategory.value = category
  isReadOnly.value = readOnly
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  showAssignModal.value = false
  selectedCategory.value = null
  selectedDatasets.value = []
}

function handleRefresh() {
  initChart()
  alert('数据已刷新！')
}

function resetData() {
  if (confirm('确定要重置数据吗？这将清除所有自定义分类和数据分配，恢复到默认状态。')) {
    localStorage.removeItem('dataCategory_tableData')
    localStorage.removeItem('dataCategory_allDatasets')
    tableData.value = JSON.parse(JSON.stringify(defaultTableData))
    allDatasets.value = JSON.parse(JSON.stringify(defaultDatasets))
    updateCategoryDataCount()
    initChart()
    alert('数据已重置！')
  }
}

function handleResize() {
  chartInstance?.resize()
}

// 监听数据变化，自动保存到 localStorage
watch(tableData, (newVal) => {
  localStorage.setItem('dataCategory_tableData', JSON.stringify(newVal))
}, { deep: true })

watch(allDatasets, (newVal) => {
  localStorage.setItem('dataCategory_allDatasets', JSON.stringify(newVal))
}, { deep: true })

async function fetchCategories() {
  try {
    const res = await getCategoriesApi()
    if (res.code === 200 && res.data) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#96CEB4', '#88D8B0']
      tableData.value = res.data.map((item, index) => ({
        name: item.cate_name || '',
        code: String(item.cate_id || ''),
        desc: item.description || '',
        dataCount: 0,
        createTime: '',
        color: colors[index % colors.length]
      }))
      stats.totalCategories = tableData.value.length
    }
  } catch {
    // 后端未就绪时静默处理
  }
}

onMounted(() => {
  fetchCategories()
  updateCategoryDataCount()
  initChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped>
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
  margin-bottom: 12px;
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

.stat-card-icon {
  background: #f3e8ff;
  color: #8B5CF6;
}

.stat-card-content {
  flex: 1;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  color: #333;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #999;
  margin-top: 4px;
}

/* 图表区域 */
.chart-section {
  margin-bottom: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  overflow: hidden;
}

.chart-header {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
}

.chart-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.chart-tabs {
  display: flex;
  gap: 8px;
}

.chart-tab {
  padding: 6px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #f5f5f5;
  font-size: 13px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-tab:hover {
  border-color: #1E90FF;
  background: #e6f7ff;
}

.chart-tab.active {
  background: #1E90FF;
  border-color: #1E90FF;
  color: #fff;
}

.chart-container {
  height: 500px;
  padding: 20px;
  background: #fff;
}

/* 操作栏 */
/* 分类列表 */
.category-list-section {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.category-list-section h3 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.category-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.category-table th {
  text-align: left;
  padding: 12px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e8e8e8;
  font-weight: 600;
  color: #333;
}

.category-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  color: #666;
}

.category-table tr:hover td {
  background: #fafafa;
}

.category-color {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  margin-right: 8px;
  vertical-align: middle;
}

.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  line-height: 1;
  white-space: nowrap;
  font-weight: 500;
}

.btn--primary {
  background: #1E90FF;
  color: #fff;
}

.btn--primary:hover {
  background: #1874cc;
}

.btn--secondary {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn--secondary:hover {
  color: #1E90FF;
  border-color: #1E90FF;
}

.btn--small {
  padding: 4px 12px;
  font-size: 12px;
}

.btn--danger {
  background: #f56c6c;
  color: #fff;
  border: none;
}

.btn--danger:hover {
  background: #e64242;
}

/* 卡片 */
.card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.card-header {
  padding: 14px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.table-meta {
  font-size: 12px;
  color: #999;
}

/* 表格 */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  background: #fafafa;
  font-weight: 600;
  color: #666;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
}

.table td {
  padding: 12px 16px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
}

.table-row {
  transition: background-color 0.2s;
  cursor: pointer;
}

.table-row:hover {
  background-color: #f5f8ff;
}

.row-index {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #999;
}

.category-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
}

.code-text {
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: #666;
}

.desc-col {
  color: #999;
  max-width: 300px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.badge-info {
  background: #e6f7ff;
  color: #1E90FF;
}

.action-group {
  display: flex;
  gap: 6px;
  justify-content: center;
}

.btn-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  transition: all 0.2s;
  color: #666;
}

.btn-action:hover {
  border-color: #1E90FF;
  background: #e6f7ff;
  color: #1E90FF;
}

.btn-action--edit:hover {
  border-color: #1E90FF;
  background: #e6f7ff;
  color: #1E90FF;
}

.btn-action--view:hover {
  border-color: #32CD32;
  background: #f0f9eb;
  color: #32CD32;
}

.btn-action--delete:hover {
  border-color: #f56c6c;
  background: #fef0f0;
  color: #f56c6c;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 20px;
  border-top: 1px solid #f0f0f0;
}

.pagination-info {
  font-size: 13px;
  color: #999;
}

.pagination-controls {
  display: flex;
  gap: 6px;
}

.page-btn {
  padding: 4px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  color: #1E90FF;
  border-color: #1E90FF;
}

.page-btn:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 空状态 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: #999;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  color: #666;
  margin-bottom: 8px;
}

.empty-subtext {
  font-size: 13px;
  color: #999;
}

/* 表格头部 */
.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.tip-text {
  font-size: 12px;
  color: #999;
  margin-left: 4px;
}

.empty-hint {
  color: #999;
}

.category-badge.small {
  padding: 2px 8px;
  font-size: 11px;
}

.dataset-name {
  font-weight: 500;
  color: #333;
}

.badge-size {
  background: #f0f9eb;
  color: #32CD32;
}

.btn-action--download:hover {
  border-color: #32CD32;
  background: #f0f9eb;
  color: #32CD32;
}

/* 弹窗 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
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

.modal-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.modal-subtitle {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #e0e0e0;
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.info-section {
  margin-bottom: 24px;
}

.info-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 12px;
  color: #999;
}

.info-value {
  font-size: 14px;
  color: #333;
}

.info-item code {
  background: #f5f5f5;
  padding: 4px 8px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 13px;
  color: #666;
  display: inline-block;
}

.dataset-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h4 {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.category-tag {
  display: inline-block;
  padding: 2px 8px;
  font-size: 12px;
  border-radius: 4px;
  background: #e6f7ff;
  color: #1890ff;
}

.category-tag.unassigned {
  background: #fff7e6;
  color: #fa8c16;
}

.detail-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.detail-table th {
  background: #fafafa;
  font-weight: 600;
  color: #666;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
}

.detail-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
}

.status-tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.status-tag.active {
  background: #e8f5e9;
  color: #4caf50;
}

.status-tag.warning {
  background: #fff3e0;
  color: #ff9800;
}

.status-tag.offline {
  background: #ffebee;
  color: #f44336;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 新增分类和导出弹窗样式 */
.modal-icon {
  margin-right: 8px;
  font-size: 18px;
}

.form-section {
  margin-bottom: 24px;
}

.form-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-item label {
  font-size: 13px;
  font-weight: 500;
  color: #666;
}

.form-input {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #fff;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #1E90FF;
}

.form-textarea {
  padding: 10px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background: #fff;
  min-height: 80px;
  resize: vertical;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #1E90FF;
}

.assign-search-wrapper {
  position: relative;
  margin-bottom: 12px;
}

.assign-search-input {
  width: 100%;
  padding: 10px 12px 10px 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  box-sizing: border-box;
  background: #fff;
}

.assign-search-input:focus {
  outline: none;
  border-color: #1E90FF;
}

.assign-search-wrapper .search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
}

.assign-search-wrapper .search-clear {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 2px;
}

.assign-search-wrapper .search-clear:hover {
  color: #666;
}

.select-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  overflow: hidden;
}

.select-table th {
  background: #fafafa;
  font-weight: 600;
  color: #666;
  padding: 10px 12px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  font-size: 12px;
}

.select-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
}

.select-table tr:hover {
  background: #f5f8ff;
}

.select-table input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.path-selector {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.path-options {
  display: flex;
  gap: 24px;
}

.path-option {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 10px 16px;
  border: 2px solid transparent;
  border-radius: 6px;
  transition: all 0.2s;
}

.path-option:hover {
  background: #f5f7fa;
}

.path-option input[type="radio"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.path-option:has(input[type="radio"]:checked) {
  border-color: #1E90FF;
  background: #e6f7ff;
}

.path-icon {
  font-size: 20px;
}

.path-detail {
  display: flex;
  gap: 12px;
}

.path-detail .form-input {
  flex: 1;
}

</style>