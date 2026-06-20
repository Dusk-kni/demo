<template>
  <div class="page-container">
    <!-- 顶部横幅区域 - 包含背景图和科普文字 -->
    <div class="hero-banner">
      <div class="banner-content">
        <!-- 科普文字 -->
        <div class="banner-text">
          <p class="banner-paragraph">
            火点数据管理，是森林火灾监测预警、应急处置与风险防控的核心数据底座：通过多源数据标准化整合、质量控制与全生命周期管理，既为火情研判、资源调度提供实时精准支撑，也为风险区划、模型优化和长效防控提供可靠数据保障。
          </p>
        </div>

        <!-- 统计数据 -->
        <div class="stats-row">
          <div class="stat-item">
            <span class="stat-label">火点总数</span>
            <span class="stat-num">156</span>
            <span class="stat-trend up">+12%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">高危火点</span>
            <span class="stat-num red">45</span>
            <span class="stat-trend down">-5%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已审核火点</span>
            <span class="stat-num green">98</span>
            <span class="stat-trend up">+8%</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">审核覆盖率</span>
            <span class="stat-num orange">63%</span>
            <span class="stat-trend up">+3%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 中间内容区 -->
    <div class="dashboard-row">
      <div class="chart-section">
        <div class="section-header">
          <h3>火点趋势分析</h3>
        </div>
        <div ref="trendChartRef" class="line-chart"></div>
      </div>

      <div class="progress-section">
        <div class="section-header">
          <h3>区域火点处理率</h3>
        </div>
        <div ref="progressChartRef" class="progress-chart"></div>
      </div>
    </div>

    <!-- 底部：数据表格 + 时间线 -->
    <div class="bottom-row">
      <div class="table-section">
        <div class="section-header">
          <h3>火点数据列表</h3>
          <div class="table-actions">
            <div class="search-box-wrapper">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="search-icon">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                v-model="searchKeyword" 
                class="search-input"
                placeholder="搜索火点名称、等级、来源..."
              />
            </div>
            <input
              ref="fileInput"
              type="file"
              accept=".csv,.json,.xlsx"
              style="display: none"
              @change="handleFileUpload"
            />
            <button v-if="canUpload" class="btn btn--primary" @click="triggerUpload">+ 上传数据</button>
            <button class="btn btn--secondary" @click="exportReport">导出报告</button>
          </div>
        </div>
        
        <!-- 检索区域 -->
        <div class="search-card">
          <!-- 卫星监测 -->
          <div class="search-section">
            <span class="section-label">卫星监测:</span>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" v-model="searchForm.satellite.all" @change="toggleAll('satellite')" />
                <span>全部</span>
              </label>
              <label class="checkbox-item" v-for="sat in satellites" :key="sat">
                <input type="checkbox" v-model="searchForm.satellite.items" :value="sat" @change="updateAllStatus('satellite')" />
                <span>{{ sat }}</span>
              </label>
            </div>
          </div>

          <!-- 天空监测 -->
          <div class="search-section">
            <span class="section-label">天空监测:</span>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" v-model="searchForm.sky.all" @change="toggleAll('sky')" />
                <span>全部</span>
              </label>
              <label class="checkbox-item" v-for="item in skyItems" :key="item">
                <input type="checkbox" v-model="searchForm.sky.items" :value="item" @change="updateAllStatus('sky')" />
                <span>{{ item }}</span>
              </label>
            </div>
          </div>

          <!-- 地面监测 -->
          <div class="search-section">
            <span class="section-label">地面监测:</span>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" v-model="searchForm.ground.all" @change="toggleAll('ground')" />
                <span>全部</span>
              </label>
              <label class="checkbox-item" v-for="item in groundItems" :key="item">
                <input type="checkbox" v-model="searchForm.ground.items" :value="item" @change="updateAllStatus('ground')" />
                <span>{{ item }}</span>
              </label>
            </div>
          </div>

          <!-- 时间段 -->
          <div class="search-section">
            <span class="section-label">时间段:</span>
            <div class="time-group">
              <input 
                type="datetime-local" 
                v-model="searchForm.timeRange.start" 
                class="time-input"
                placeholder="请输入开始时间"
              />
              <span class="time-separator">-</span>
              <input 
                type="datetime-local" 
                v-model="searchForm.timeRange.end" 
                class="time-input"
                placeholder="请输入结束时间"
              />
            </div>
          </div>

          <!-- 地貌类型 -->
          <div class="search-section">
            <span class="section-label">地貌类型:</span>
            <div class="checkbox-group">
              <label class="checkbox-item">
                <input type="checkbox" v-model="searchForm.landform.all" @change="toggleAll('landform')" />
                <span>全部</span>
              </label>
              <label class="checkbox-item" v-for="item in landformItems" :key="item">
                <input type="checkbox" v-model="searchForm.landform.items" :value="item" @change="updateAllStatus('landform')" />
                <span>{{ item }}</span>
              </label>
            </div>
          </div>

          <!-- 火警数量 -->
          <div class="search-section">
            <span class="section-label">火警数量:</span>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="searchForm.fireCount" value="" />
                <span>全部</span>
              </label>
              <label class="radio-item" v-for="num in fireCountOptions" :key="num">
                <input type="radio" v-model="searchForm.fireCount" :value="num" />
                <span>{{ num }}</span>
              </label>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="search-actions">
            <button class="btn btn-reset" @click="resetForm">重置</button>
            <button class="btn btn-search" @click="startSearch">开始查询</button>
          </div>
        </div>
        
        <table class="data-table">
          <thead>
            <tr>
              <th>序号</th>
              <th>火点名称</th>
              <th>经度</th>
              <th>纬度</th>
              <th>地貌类型</th>
              <th>火点数量</th>
              <th>等级</th>
              <th>数据来源</th>
              <th>审核状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in paginatedTableData" :key="row.name">
              <td><span class="index-badge">{{ (currentPage - 1) * pageSize + index + 1 }}</span></td>
              <td><strong>{{ row.name }}</strong></td>
              <td>{{ row.lon }}</td>
              <td>{{ row.lat }}</td>
              <td>
                <span class="landform-tag">{{ row.landform }}</span>
              </td>
              <td>{{ row.fireCount }}</td>
              <td>
                <span class="level-tag" :class="'level-' + row.level">{{ row.level }}</span>
              </td>
              <td>{{ row.source }}</td>
              <td>
                <span class="audit-tag" :class="row.status === '已审核' ? 'audited' : 'pending'">
                  {{ row.status }}
                </span>
              </td>
              <td>
                <div class="action-btns">
                  <button class="icon-btn view" title="查看" @click="viewDetail(row)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button v-if="canAudit && row.status !== '已审核'" class="icon-btn audit" title="审核" @click="auditItem(row)">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">
          <span class="page-info">共 {{ filteredTableData.length }} 条记录</span>
          <div class="pagination">
            <button class="page-btn" :disabled="currentPage <= 1" @click="prevPage">上一页</button>
            <button 
              v-for="page in totalPages" 
              :key="page"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="goToPage(page)"
            >{{ page }}</button>
            <button class="page-btn" :disabled="currentPage >= totalPages" @click="nextPage">下一页</button>
          </div>
        </div>
      </div>

      <div class="timeline-section">
        <div class="section-header">
          <h3>最新动态</h3>
          <span class="timeline-count">{{ timelineData.length }}条</span>
        </div>
        <div class="timeline">
          <div class="timeline-item" v-for="(item, idx) in timelineData" :key="idx">
            <div class="timeline-dot" :class="item.type"></div>
            <div class="timeline-content">
              <div class="timeline-time">{{ item.time }}</div>
              <div class="timeline-text">{{ item.content }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted, onUnmounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getFirePointsApi } from '../api'
import * as echarts from 'echarts'

const { hasPermission } = useUserStore()

const canUpload = computed<boolean>(() => hasPermission('UC05'))
const canAudit = computed<boolean>(() => hasPermission('UC06'))

// 列表搜索关键词
const searchKeyword = ref('')

// 当前生效的检索条件（点击查询后保存）
const activeSearchForm = reactive({
  satellite: { all: true, items: [] as string[] },
  sky: { all: true, items: [] as string[] },
  ground: { all: true, items: [] as string[] },
  timeRange: { start: '', end: '' },
  landform: { all: true, items: [] as string[] },
  fireCount: '',
  foreignHeatSource: false,
  includeBuffer: false,
  keyword: ''
})

// 是否应用检索条件
const applySearchFilters = ref(false)

// 分页配置
const currentPage = ref(1)
const pageSize = ref(6)

// 分页后的数据
const paginatedTableData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTableData.value.slice(start, end)
})

// 总页数
const totalPages = computed(() => {
  return Math.ceil(filteredTableData.value.length / pageSize.value)
})

// 上一页
function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// 下一页
function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// 跳转到指定页码
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// 过滤后的数据列表
const filteredTableData = computed(() => {
  let result = [...tableData.value]
  
  // 应用顶部检索条件
  if (applySearchFilters.value) {
    // 根据卫星监测过滤（匹配数据来源）
    if (!activeSearchForm.satellite.all && activeSearchForm.satellite.items.length > 0) {
      result = result.filter(item => 
        activeSearchForm.satellite.items.some(sat => item.source.toLowerCase().includes(sat.toLowerCase()))
      )
    }
    
    // 根据天空监测过滤
    if (!activeSearchForm.sky.all && activeSearchForm.sky.items.length > 0) {
      result = result.filter(item => 
        item.monitorType === '天空'
      )
    }
    
    // 根据地面监测过滤
    if (!activeSearchForm.ground.all && activeSearchForm.ground.items.length > 0) {
      result = result.filter(item => 
        item.monitorType === '地面'
      )
    }
    
    // 根据时间段过滤
    if (activeSearchForm.timeRange.start || activeSearchForm.timeRange.end) {
      result = result.filter(item => {
        if (!item.time) return false
        const itemTime = new Date(item.time).getTime()
        const startTime = activeSearchForm.timeRange.start ? new Date(activeSearchForm.timeRange.start).getTime() : 0
        const endTime = activeSearchForm.timeRange.end ? new Date(activeSearchForm.timeRange.end).getTime() : Infinity
        return itemTime >= startTime && itemTime <= endTime
      })
    }
    
    // 根据等级过滤（模拟地貌类型/火警等级）
    if (!activeSearchForm.landform.all && activeSearchForm.landform.items.length > 0) {
      const levelMap: Record<string, string[]> = {
        '林地': ['高'],
        '草地': ['中'],
        '农田': ['低'],
        '其他': ['低', '中']
      }
      const allowedLevels = activeSearchForm.landform.items.flatMap(item => levelMap[item] || [])
      if (allowedLevels.length > 0) {
        result = result.filter(item => allowedLevels.includes(item.level))
      }
    }
    
    // 根据火警数量过滤
    if (activeSearchForm.fireCount) {
      const fireCount = Number(activeSearchForm.fireCount)
      result = result.filter(item => item.fireCount === fireCount)
    }
    
    // 应用列表搜索关键词
    if (activeSearchForm.keyword) {
      const keyword = activeSearchForm.keyword.toLowerCase()
      result = result.filter(item => 
        item.name.toLowerCase().includes(keyword) ||
        item.level.toLowerCase().includes(keyword) ||
        item.source.toLowerCase().includes(keyword) ||
        item.status.toLowerCase().includes(keyword)
      )
    }
  }
  
  return result
})

// 检索表单数据
const searchForm = reactive({
  satellite: {
    all: true,
    items: [] as string[]
  },
  sky: {
    all: true,
    items: [] as string[]
  },
  ground: {
    all: true,
    items: [] as string[]
  },
  timeRange: {
    start: '',
    end: ''
  },
  landform: {
    all: true,
    items: [] as string[]
  },
  fireCount: '',
  foreignHeatSource: false,
  includeBuffer: false
})

// 选项数据
const satellites = ['NPP', 'FY-4', 'FY-3', 'Himawari-8', 'NOAA-0', 'NOAA-15', 'NOAA-18', 'NOAA-19']
const skyItems = ['无人机', '浮空器（高空气球）']
const groundItems = ['摄像机', '护林员', '瞭望员', '群众']
const landformItems = ['林地', '草地', '农田', '其他']
const fireCountOptions = ['100', '500', '1000', '2000', '5000']

// 全选/取消全选
function toggleAll(type: 'satellite' | 'sky' | 'ground' | 'landform') {
  const options: Record<string, string[]> = {
    satellite: satellites,
    sky: skyItems,
    ground: groundItems,
    landform: landformItems
  }
  if (searchForm[type].all) {
    searchForm[type].items = [...options[type]]
  } else {
    searchForm[type].items = []
  }
}

// 当子选项变化时更新"全部"状态
function updateAllStatus(type: 'satellite' | 'sky' | 'ground' | 'landform') {
  const options: Record<string, string[]> = {
    satellite: satellites,
    sky: skyItems,
    ground: groundItems,
    landform: landformItems
  }
  // 检查是否所有选项都被选中
  searchForm[type].all = options[type].every(opt => searchForm[type].items.includes(opt))
}

// 重置表单
function resetForm() {
  searchForm.satellite.all = true
  searchForm.satellite.items = []
  searchForm.sky.all = true
  searchForm.sky.items = []
  searchForm.ground.all = true
  searchForm.ground.items = []
  searchForm.timeRange.start = ''
  searchForm.timeRange.end = ''
  searchForm.landform.all = true
  searchForm.landform.items = []
  searchForm.fireCount = ''
  searchForm.foreignHeatSource = false
  searchForm.includeBuffer = false
  applySearchFilters.value = false
  searchKeyword.value = ''
}

// 开始查询
function startSearch() {
  // 保存当前表单条件到生效条件
  activeSearchForm.satellite.all = searchForm.satellite.all
  activeSearchForm.satellite.items = [...searchForm.satellite.items]
  activeSearchForm.sky.all = searchForm.sky.all
  activeSearchForm.sky.items = [...searchForm.sky.items]
  activeSearchForm.ground.all = searchForm.ground.all
  activeSearchForm.ground.items = [...searchForm.ground.items]
  activeSearchForm.timeRange.start = searchForm.timeRange.start
  activeSearchForm.timeRange.end = searchForm.timeRange.end
  activeSearchForm.landform.all = searchForm.landform.all
  activeSearchForm.landform.items = [...searchForm.landform.items]
  activeSearchForm.fireCount = searchForm.fireCount
  activeSearchForm.foreignHeatSource = searchForm.foreignHeatSource
  activeSearchForm.includeBuffer = searchForm.includeBuffer
  activeSearchForm.keyword = searchKeyword.value
  
  applySearchFilters.value = true
}

// 统计数据
const stats = reactive({
  totalFirePoints: 0,
  highRiskCount: 0,
  auditedCount: 0,
  auditRate: 0
})

// 折线图数据（从后端获取）
const weekData: { name: string; current: number; last: number }[] = []

// ECharts折线图配置
const trendChartRef = ref<HTMLElement | null>(null)
let trendChart: echarts.ECharts | null = null

function initTrendChart() {
  if (!trendChartRef.value) return
  
  trendChart = echarts.init(trendChartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params: any) => {
        let html = `<div style="font-weight: 600; margin-bottom: 8px;">${params[0].axisValue}</div>`
        params.forEach((item: any) => {
          html += `<div style="display: flex; align-items: center; margin: 4px 0;">
            <span style="display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: ${item.color}; margin-right: 8px;"></span>
            <span>${item.seriesName}: <strong>${item.value}</strong></span>
          </div>`
        })
        return html
      }
    },
    legend: {
      data: ['本周', '上周'],
      top: 0,
      right: 0,
      textStyle: {
        color: '#666'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: weekData.map(item => item.name),
      axisLine: {
        lineStyle: {
          color: '#ddd'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      max: 8000,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#eee',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#666',
        fontSize: 12
      }
    },
    series: [
      {
        name: '本周',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#1E90FF'
        },
        itemStyle: {
          color: '#1E90FF',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(30, 144, 255, 0.3)' },
            { offset: 1, color: 'rgba(30, 144, 255, 0.05)' }
          ])
        },
        data: weekData.map(item => item.current)
      },
      {
        name: '上周',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 3,
          color: '#FFA500',
          type: 'dashed'
        },
        itemStyle: {
          color: '#FFA500',
          borderWidth: 2,
          borderColor: '#fff'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(255, 165, 0, 0.2)' },
            { offset: 1, color: 'rgba(255, 165, 0, 0.02)' }
          ])
        },
        data: weekData.map(item => item.last)
      }
    ]
  }
  
  trendChart.setOption(option)
}

function handleResize() {
  trendChart?.resize()
  progressChart?.resize()
}

async function fetchFirePoints() {
  try {
    const res = await getFirePointsApi(0, 100)
    if (res.code === 200 && res.data) {
      tableData.value = res.data.map(item => ({
        name: item.name || `火点${item.fid}`,
        lon: item.longitude ?? item.lon,
        lat: item.latitude ?? item.lat,
        landform: '林地',
        fireCount: 1,
        level: item.level || '中',
        source: item.source || '未知',
        status: item.audit_status || '待审核',
        time: item.acq_date || item.time || '',
        monitorType: '卫星'
      }))
      stats.totalFirePoints = tableData.value.length
      stats.highRiskCount = tableData.value.filter(r => r.level === '高').length
      stats.auditedCount = tableData.value.filter(r => r.status === '已审核').length
      stats.auditRate = tableData.value.length > 0 ? Math.round(stats.auditedCount / tableData.value.length * 100) : 0
    }
  } catch {
    // 后端未就绪时静默处理
  }
}

onMounted(() => {
  fetchFirePoints()
  initTrendChart()
  initProgressChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  progressChart?.dispose()
})

// 区域进度数据（从后端获取）
const regionProgress: { name: string; value: number; color: string }[] = []

// ECharts横向柱状图配置
const progressChartRef = ref<HTMLElement | null>(null)
let progressChart: echarts.ECharts | null = null

function initProgressChart() {
  if (!progressChartRef.value) return
  
  progressChart = echarts.init(progressChartRef.value)
  
  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: {
        color: '#333'
      },
      formatter: (params: any) => {
        const item = params[0]
        return `<div style="font-weight: 600;">${item.name}</div>
                <div style="margin-top: 8px;">处理率：<strong>${item.value}%</strong></div>`
      }
    },
    grid: {
      left: '10',
      right: '60',
      top: '10',
      bottom: '10',
      containLabel: true
    },
    xAxis: {
      type: 'value',
      max: 100,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        lineStyle: {
          color: '#eee',
          type: 'dashed'
        }
      },
      axisLabel: {
        color: '#666',
        formatter: '{value}%'
      }
    },
    yAxis: {
      type: 'category',
      data: regionProgress.map(item => item.name),
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#333',
        fontSize: 13
      }
    },
    series: [
      {
        type: 'bar',
        barWidth: '60%',
        data: regionProgress.map(item => ({
          value: item.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
              { offset: 0, color: item.color },
              { offset: 1, color: item.color + '80' }
            ]),
            borderRadius: [0, 4, 4, 0]
          }
        })),
        label: {
          show: true,
          position: 'right',
          color: '#666',
          fontSize: 13,
          fontWeight: 600,
          formatter: '{c}%'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        animationDuration: 1500,
        animationEasing: 'cubicOut'
      }
    ]
  }
  
  progressChart.setOption(option)
}

type FirePointRow = { name: string; lon: number; lat: number; landform: string; fireCount: number; level: string; source: string; status: string; time: string; monitorType: string }

const tableData = ref<FirePointRow[]>([])

const timelineData = ref<{ time: string; content: string; type: string }[]>([])

const fileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInput.value?.click()
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    alert(`已选择文件: ${file.name}\n大小: ${(file.size / 1024).toFixed(2)} KB`)
    target.value = ''
  }
}

function exportReport() {
  const csvContent = [
    ['火点名称', '经度', '纬度', '等级', '数据来源', '审核状态'],
    ...tableData.value.map(row => [row.name, row.lon, row.lat, row.level, row.source, row.status])
  ].map(e => e.join(',')).join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `火点数据报告_${new Date().toLocaleDateString('zh-CN')}.csv`
  link.click()
  URL.revokeObjectURL(link.href)
}

function viewDetail(row: FirePointRow) {
  alert(`火点详情:\n名称: ${row.name}\n坐标: ${row.lon}, ${row.lat}\n等级: ${row.level}\n来源: ${row.source}\n状态: ${row.status}`)
}

function auditItem(row: FirePointRow) {
  if (confirm(`确认审核通过 ${row.name} 吗？`)) {
    row.status = '已审核'
    alert(`${row.name} 审核通过！`)
  }
}
</script>

<style scoped>
.page-container {
  padding: 20px;
  background: #f5f7fa;
  min-height: 100vh;
}

/* 顶部横幅区域 */
.hero-banner {
  position: relative;
  width: 100%;
  height: 180px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  background-image: url('/satellite.png');
  background-size: cover;
  background-position: center;
}

.banner-content {
  position: relative;
  z-index: 1;
  height: 100%;
  padding: 20px 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: rgba(15, 23, 42, 0.5);
}

.banner-text {
  max-width: 100%;
  display: flex;
  align-items: center;
}

.banner-paragraph {
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  line-height: 1.8;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  font-family: "SimSun", "Songti SC", serif;
  text-align: justify;
  letter-spacing: 0.5px;
}

/* 统计数据行 */
.stats-row {
  display: flex;
  gap: 20px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 6px;
}

.stat-num {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
  margin-bottom: 6px;
}

.stat-num.red {
  color: #fff;
}

.stat-num.green {
  color: #fff;
}

.stat-num.orange {
  color: #fff;
}

.stat-trend {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
  align-self: flex-start;
  margin-bottom: 10px;
}

.stat-trend.up {
  color: #10b981;
  background: rgba(16, 185, 129, 0.2);
}

.stat-trend.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.2);
}

.mini-chart {
  height: 30px;
}

.mini-chart svg {
  width: 100%;
  height: 100%;
}

/* 检索卡片 */
.search-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  margin-bottom: 20px;
}

.search-section {
  margin-bottom: 16px;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 12px;
}

.section-label {
  font-weight: 500;
  color: #606266;
  min-width: 80px;
  flex-shrink: 0;
}

.checkbox-group,
.radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.checkbox-item,
.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: #303133;
}

.checkbox-item input[type="checkbox"],
.radio-item input[type="radio"] {
  width: 14px;
  height: 14px;
  cursor: pointer;
}

.time-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.time-input {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  min-width: 180px;
}

.time-separator {
  color: #999;
}

.other-options {
  gap: 24px;
}

.search-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 32px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-reset {
  background: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-reset:hover {
  background: #f5f7fa;
}

.btn-search {
  background: #1E90FF;
  color: #fff;
}

.btn-search:hover {
  background: #1874cc;
}

/* 统计卡片 */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 20px;
  padding: 14px;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-radius: 12px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.25);
}

.stat-card {
  position: relative;
  padding: 14px;
  background: linear-gradient(145deg, #2a3544 0%, #1e293b 100%);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 3px 8px rgba(0, 0, 0, 0.18);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.04),
    0 6px 16px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(16, 185, 129, 0.15);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.stat-title {
  font-size: 12px;
  color: #94a3b8;
  letter-spacing: 0.3px;
}

.stat-trend {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-trend.up {
  color: #10b981;
  background: rgba(16, 185, 129, 0.15);
}

.stat-trend.down {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.15);
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #f1f5f9;
  margin-bottom: 12px;
  line-height: 1;
}

.sparkline {
  height: 40px;
  width: 100%;
}

.sparkline svg {
  width: 100%;
  height: 100%;
}

/* 中间行 */
.dashboard-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.chart-section,
.progress-section,
.table-section,
.timeline-section {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

/* 柱状图 */
.chart-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-dot.blue {
  background: #1E90FF;
}

.legend-dot.orange {
  background: #e6a23c;
}

.line-chart {
  height: 280px;
  width: 100%;
}

.progress-chart {
  height: 280px;
  width: 100%;
}

.progress-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
}

.progress-name {
  color: #333;
}

.progress-value {
  color: #666;
  font-weight: 500;
}

.progress-bar-bg {
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* 底部行 */
.bottom-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

/* 表格 */
.table-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-box-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #999;
}

.search-input {
  padding: 8px 12px 8px 36px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  width: 200px;
  outline: none;
  transition: all 0.2s;
}

.search-input:focus {
  border-color: #1E90FF;
  box-shadow: 0 0 0 2px rgba(30, 144, 255, 0.1);
}

.search-input::placeholder {
  color: #999;
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

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.data-table th {
  background: #fafafa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #666;
  border-bottom: 1px solid #ebeef5;
}

.data-table td {
  padding: 12px;
  border-bottom: 1px solid #f0f0f0;
  color: #333;
}

.data-table tr:hover {
  background: #f5f8ff;
}

.index-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
}

.level-tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.level-tag.level-高 {
  background: #fef0f0;
  color: #f56c6c;
}

.landform-tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  background: #e6f7ff;
  color: #1E90FF;
}

.level-tag.level-中 {
  background: #fdf6ec;
  color: #e6a23c;
}

.level-tag.level-低 {
  background: #f0f9eb;
  color: #67c23a;
}

.audit-tag {
  display: inline-flex;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
}

.audit-tag.audited {
  background: #e6f7ff;
  color: #1E90FF;
}

.audit-tag.pending {
  background: #fff7e6;
  color: #e6a23c;
}

.action-btns {
  display: flex;
  gap: 8px;
}

.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: #fff;
  cursor: pointer;
  color: #666;
  transition: all 0.2s;
}

.icon-btn:hover {
  border-color: #1E90FF;
  color: #1E90FF;
  background: #e6f7ff;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0 0;
  margin-top: 10px;
  border-top: 1px solid #f0f0f0;
}

.page-info {
  font-size: 13px;
  color: #999;
}

.pagination {
  display: flex;
  gap: 8px;
}

.page-btn {
  padding: 6px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #fff;
  color: #606266;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  color: #1E90FF;
  border-color: #1E90FF;
}

.page-btn.active {
  background: #1E90FF;
  color: #fff;
  border-color: #1E90FF;
}

.page-btn:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

/* 时间线 */
.timeline-count {
  font-size: 12px;
  color: #999;
  background: #f5f7fa;
  padding: 2px 8px;
  border-radius: 10px;
}

.timeline {
  position: relative;
  padding-left: 20px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  padding-bottom: 20px;
}

.timeline-dot {
  position: absolute;
  left: -17px;
  top: 4px;
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

.timeline-dot.info {
  background: #1E90FF;
  color: #1E90FF;
}

.timeline-dot.warning {
  background: #e6a23c;
  color: #e6a23c;
}

.timeline-dot.danger {
  background: #f56c6c;
  color: #f56c6c;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timeline-time {
  font-size: 12px;
  color: #999;
}

.timeline-text {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

/* 检索按钮美化 */
.search-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.search-actions .btn {
  padding: 10px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-reset {
  background: #f5f7fa;
  color: #606266;
  border: 1px solid #dcdfe6;
}

.btn-reset:hover {
  background: #e8eaed;
  border-color: #c0c4cc;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.btn-search {
  background: linear-gradient(135deg, #1E90FF 0%, #4169E1 100%);
  color: #fff;
  border: none;
}

.btn-search:hover {
  background: linear-gradient(135deg, #1874cc 0%, #3659c9 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 144, 255, 0.4);
}

.btn-search:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(30, 144, 255, 0.3);
}

.btn--primary {
  background: linear-gradient(135deg, #67c23a 0%, #5eb838 100%);
  color: #fff;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn--primary:hover {
  background: linear-gradient(135deg, #5cb83a 0%, #55af34 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}

.btn--secondary {
  background: #fff;
  color: #606266;
  border: 1px solid #dcdfe6;
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn--secondary:hover {
  background: #f5f7fa;
  color: #1E90FF;
  border-color: #1E90FF;
  transform: translateY(-1px);
}
</style>