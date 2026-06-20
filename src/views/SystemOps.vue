<template>
  <div class="page-container">
    <!-- 统计卡片 - 运维仪表盘风格 -->
    <div class="stat-cards">
      <!-- 今日访问量 -->
      <div class="stat-card">
        <div class="stat-ring">
          <svg viewBox="0 0 100 100" class="ring-svg">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#2a3544" stroke-width="6"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#10b981" stroke-width="6" stroke-linecap="round" 
                    stroke-dasharray="211" stroke-dashoffset="42" transform="rotate(-90 50 50)"/>
          </svg>
          <div class="ring-content">
            <div class="ring-value">126</div>
            <div class="ring-label">今日访问量</div>
            <div class="ring-trend">↑12%</div>
          </div>
        </div>
        <div class="stat-status status-normal">正常</div>
      </div>

      <!-- 活跃用户数 -->
      <div class="stat-card">
        <div class="stat-ring">
          <svg viewBox="0 0 100 100" class="ring-svg">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#2a3544" stroke-width="6"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#06b6d4" stroke-width="6" stroke-linecap="round" 
                    stroke-dasharray="211" stroke-dashoffset="127" transform="rotate(-90 50 50)"/>
          </svg>
          <div class="ring-content">
            <div class="ring-value">10</div>
            <div class="ring-label">活跃用户</div>
            <div class="ring-sub">在线3人</div>
          </div>
        </div>
        <div class="stat-status status-success">在线</div>
      </div>

      <!-- 今日操作次数 -->
      <div class="stat-card">
        <div class="stat-ring">
          <svg viewBox="0 0 100 100" class="ring-svg">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#2a3544" stroke-width="6"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#8b5cf6" stroke-width="6" stroke-linecap="round" 
                    stroke-dasharray="211" stroke-dashoffset="53" transform="rotate(-90 50 50)"/>
          </svg>
          <div class="ring-content">
            <div class="ring-value">321</div>
            <div class="ring-label">操作次数</div>
            <div class="ring-trend">↑8%</div>
          </div>
        </div>
        <div class="stat-status status-warning">频繁</div>
      </div>

      <!-- 系统运行时间 -->
      <div class="stat-card">
        <div class="stat-ring">
          <svg viewBox="0 0 100 100" class="ring-svg">
            <circle cx="50" cy="50" r="42" fill="none" stroke="#2a3544" stroke-width="6"/>
            <circle cx="50" cy="50" r="42" fill="none" stroke="#f59e0b" stroke-width="6" stroke-linecap="round" 
                    stroke-dasharray="211" stroke-dashoffset="0" transform="rotate(-90 50 50)"/>
          </svg>
          <div class="ring-content">
            <div class="ring-value">543</div>
            <div class="ring-label">运行天数</div>
            <div class="ring-sub">稳定运行</div>
          </div>
        </div>
        <div class="stat-status status-normal">稳定</div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <div class="card chart-card">
        <div class="card-header">
          <div class="header-left">
            <span class="header-icon">📈</span>
            <h3>近7天系统访问量趋势</h3>
          </div>
          <span class="chart-badge">实时</span>
        </div>
        <div ref="lineChartRef" class="chart-container"></div>
      </div>

      <div class="card chart-card">
        <div class="card-header">
          <div class="header-left">
            <span class="header-icon">📊</span>
            <h3>系统资源使用率</h3>
          </div>
          <span class="chart-badge">监控中</span>
        </div>
        <div ref="pieChartRef" class="chart-container"></div>
      </div>
    </div>

    <!-- 日志查询 -->
    <div class="card log-card">
      <div class="card-header">
        <div class="header-left">
          <span class="header-icon">📋</span>
          <h3>日志查询</h3>
        </div>
        <span class="log-count">{{ filteredLogs.length }} 条记录</span>
      </div>
      <div class="filter-bar">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#999" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="关键词搜索..." v-model="searchKeyword" class="search-input" @keyup.enter="handleSearch" />
          <button v-if="searchKeyword" class="search-clear" @click="searchKeyword = ''">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </button>
          <button class="search-btn" @click="handleSearch">搜索</button>
        </div>
        <div class="level-tags">
          <label 
            v-for="level in logLevels" 
            :key="level.value" 
            class="level-tag"
            :class="{ active: selectedLevels.includes(level.value), [level.value.toLowerCase()]: true }"
            @click.prevent="selectLevel(level.value)"
          >
            <span class="tag-dot" :class="level.value.toLowerCase()"></span>
            <span>{{ level.label }}</span>
          </label>
        </div>
        <div class="time-select-wrapper">
          <select class="time-select" v-model="selectedTimeRange">
            <option value="" disabled>时间范围</option>
            <option value="today">今日</option>
            <option value="week">近7天</option>
            <option value="month">近30天</option>
          </select>
          <svg class="select-arrow" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
        <button class="btn btn-export" @click="handleExport">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          导出
        </button>
      </div>

      <!-- 日志表格 -->
      <table class="table">
        <thead>
          <tr>
            <th>日志时间</th>
            <th>级别</th>
            <th>模块</th>
            <th>日志内容</th>
            <th>操作人</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in filteredLogs" :key="index" class="table-row" :style="{ animationDelay: index * 0.05 + 's' }">
            <td>
              <div class="time-cell">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#999" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                </svg>
                {{ row.time }}
              </div>
            </td>
            <td>
              <span class="level-badge" :class="row.level.toLowerCase()">
                {{ row.level }}
              </span>
            </td>
            <td>
              <span class="module-tag">{{ row.module }}</span>
            </td>
            <td>{{ row.content }}</td>
            <td>
              <span class="operator">{{ row.operator }}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 分页 -->
      <div class="pagination">
        <span class="pagination-info">当前显示 <strong>10</strong> 条/共 <strong>{{ filteredLogs.length }}</strong> 条</span>
        <div class="pagination-controls">
          <button class="page-btn" disabled>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>
            </svg>
          </button>
          <button class="page-btn" disabled>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <span class="page-current">1</span>
          <button class="page-btn" disabled>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
          <button class="page-btn" disabled>
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import { getLogsApi } from '../api'
import { Message } from '../utils/message'

// ========== 图表 ==========
const lineChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let updateTimer: number | null = null

// 实时数据（从后端获取）
const lineChartData = ref<number[]>([])
const dates = ref<string[]>([])

// 生成最近7天的日期
function generateDates() {
  const result: string[] = []
  const today = new Date()
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    result.push(`${date.getMonth() + 1}/${date.getDate()}`)
  }
  return result
}

function initLineChart() {
  if (!lineChartRef.value) return
  lineChart = echarts.init(lineChartRef.value)

  // 生成动态日期（最近7天）
  dates.value = generateDates()
  // 数据从后端获取，初始为空

  lineChart.setOption({
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#fff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 13 },
      formatter: (params: any) => {
        const p = params[0]
        return `${p.axisValue}<br/><span style="color:#667eea">● 访问量: ${p.value}</span>`
      }
    },
    grid: {
      left: 50,
      right: 30,
      top: 30,
      bottom: 35
    },
    xAxis: {
      type: 'category',
      data: dates.value,
      axisLine: { lineStyle: { color: '#e0e0e0' } },
      axisLabel: { color: '#999', fontSize: 12 },
      axisTick: { show: false }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 200,
      splitLine: { lineStyle: { color: '#f0f0f0', type: 'dashed' } },
      axisLabel: { color: '#999', fontSize: 12 },
      axisLine: { show: false },
      axisTick: { show: false }
    },
    series: [{
      name: '访问量',
      type: 'line',
      data: lineChartData.value,
      smooth: true,
      symbol: 'circle',
      symbolSize: 8,
      lineStyle: { 
        color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ]),
        width: 3 
      },
      itemStyle: { color: '#667eea', borderColor: '#fff', borderWidth: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(102,126,234,0.4)' },
          { offset: 1, color: 'rgba(102,126,234,0.02)' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        color: '#666',
        fontSize: 12,
        fontWeight: 500
      }
    }]
  })
}

function initPieChart() {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)

  pieChart.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderColor: '#e0e0e0',
      borderWidth: 1,
      textStyle: { color: '#333', fontSize: 13 },
      formatter: '{b}: {d}%'
    },
    legend: {
      orient: 'horizontal',
      bottom: 10,
      itemWidth: 12,
      itemHeight: 12,
      itemGap: 24,
      textStyle: { color: '#666', fontSize: 13 }
    },
    series: [{
      name: '系统资源',
      type: 'pie',
      radius: ['45%', '70%'],
      center: ['50%', '45%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 8,
        borderColor: '#fff',
        borderWidth: 3
      },
      label: {
        show: true,
        formatter: '{b}\n{d}%',
        fontSize: 13,
        color: '#666',
        lineHeight: 20
      },
      labelLine: {
        length: 15,
        length2: 10,
        lineStyle: { color: '#ccc' }
      },
      emphasis: {
        label: { show: true, fontSize: 14, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 15, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.2)' }
      },
      data: [
        { value: 42, name: 'CPU使用率', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#667eea' }, { offset: 1, color: '#764ba2' }]) } },
        { value: 50, name: '内存使用率', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#11998e' }, { offset: 1, color: '#38ef7d' }]) } },
        { value: 8, name: '磁盘使用率', itemStyle: { color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [{ offset: 0, color: '#f093fb' }, { offset: 1, color: '#f5576c' }]) } }
      ]
    }]
  })
}

function handleResize() {
  lineChart?.resize()
  pieChart?.resize()
}

async function fetchLogs() {
  try {
    const res = await getLogsApi()
    if (res.code === 200 && res.data) {
      allLogs.value = res.data.map(log => ({
        time: log.operate_time || '',
        level: 'INFO',
        module: '系统模块',
        content: log.operation || '',
        operator: 'system'
      }))
    }
  } catch {
    // 后端未就绪时静默处理
  }
}

onMounted(() => {
  fetchLogs()
  initLineChart()
  initPieChart()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  lineChart?.dispose()
  pieChart?.dispose()
})

// ========== 日志筛选 ==========
const searchKeyword = ref('')
const selectedLevels = ref<string[]>(['ALL'])
const selectedTimeRange = ref('')

// // 单选切换：点一个取消其他的
function selectLevel(value: string) {
  if (selectedLevels.value.includes(value)) {
    return
  }
  selectedLevels.value = [value]
}

function handleSearch() {
  if (!searchKeyword.value.trim()) {
    Message.warning('请输入搜索关键词')
    return
  }
  Message.success(`搜索完成，找到 ${filteredLogs.value.length} 条记录`)
}

const logLevels = [
  { label: '全部', value: 'ALL' },
  { label: 'INFO', value: 'INFO' },
  { label: 'WARN', value: 'WARN' },
  { label: 'ERROR', value: 'ERROR' }
]

const allLogs = ref<{ time: string; level: string; module: string; content: string; operator: string }[]>([])

const filteredLogs = computed(() => {
  const now = new Date()
  return allLogs.value.filter(log => {
    // 关键词筛选
    const matchKeyword = !searchKeyword.value || log.content.includes(searchKeyword.value) || log.module.includes(searchKeyword.value)
    // 级别筛选
    const isAll = selectedLevels.value.includes('ALL')
    const matchLevel = isAll || selectedLevels.value.includes(log.level)
    // 时间范围筛选
    let matchTime = true
    if (selectedTimeRange.value) {
      const logDate = new Date(log.time.replace(/-/g, '/'))
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      if (selectedTimeRange.value === 'today') {
        matchTime = logDate >= today
      } else if (selectedTimeRange.value === 'week') {
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
        matchTime = logDate >= weekAgo
      } else if (selectedTimeRange.value === 'month') {
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        matchTime = logDate >= monthAgo
      }
    }
    return matchKeyword && matchLevel && matchTime
  })
})

function handleExport() {
  // 生成 CSV 内容
  const headers = ['日志时间', '级别', '模块', '日志内容', '操作人']
  const rows = filteredLogs.value.map(log => [log.time, log.level, log.module, log.content, log.operator])
  const csvContent = '\uFEFF' + [headers, ...rows].map(row => row.join(',')).join('\n')

  // 创建下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `系统日志_${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)

  Message.success(`已导出 ${filteredLogs.value.length} 条日志`)
}
</script>

<style scoped>
/* 统计卡片 - 运维仪表盘风格 */
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

/* 环形进度条容器 */
.stat-ring {
  position: relative;
  width: 100%;
  height: 90px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.ring-svg {
  width: 80px;
  height: 80px;
  transform: rotate(-90deg);
}

.ring-svg circle:nth-child(2) {
  transition: stroke-dashoffset 1s ease;
}

/* 环形内容 */
.ring-content {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.ring-value {
  font-size: 22px;
  font-weight: 700;
  color: #f1f5f9;
  line-height: 1;
}

.ring-label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 3px;
  letter-spacing: 0.3px;
}

.ring-trend {
  font-size: 10px;
  color: #10b981;
  margin-top: 1px;
  font-weight: 600;
}

.ring-sub {
  font-size: 9px;
  color: #64748b;
  margin-top: 1px;
}

/* 状态标签 */
.stat-status {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-normal {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.status-success {
  background: rgba(6, 182, 212, 0.15);
  color: #06b6d4;
}

.status-warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.status-error {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

/* 图表行 */
.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.card {
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.8);
}

.chart-card {
  overflow: hidden;
}

.card-header {
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(180deg, #fff, #fafafa);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.header-icon {
  font-size: 18px;
}

.card-header h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.chart-badge {
  font-size: 11px;
  color: #667eea;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1));
  padding: 4px 10px;
  border-radius: 12px;
  font-weight: 500;
}

.chart-container {
  width: 100%;
  height: 300px;
  padding: 10px;
}

/* 日志卡片 */
.log-card {
  overflow: hidden;
}

.log-count {
  font-size: 12px;
  color: #999;
  background: #f0f0f0;
  padding: 4px 10px;
  border-radius: 12px;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  flex-wrap: wrap;
  background: #fafafa;
}

.search-wrapper {
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
  padding: 10px 12px 10px 36px;
  border: 1px solid #e8e8e8;
  border-radius: 24px;
  font-size: 13px;
  color: #333;
  background: #fff;
  outline: none;
  width: 200px;
  transition: all 0.3s;
}

.search-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.search-input::placeholder {
  color: #c0c4cc;
}

.search-clear {
  position: absolute;
  right: 60px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  border: none;
  background: #e8e8e8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #999;
  transition: all 0.2s;
}

.search-clear:hover {
  background: #ddd;
  color: #666;
}

.search-btn {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  padding: 0 16px;
  border: none;
  border-radius: 0 24px 24px 0;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover {
  opacity: 0.9;
}

/* 级别标签 */
.level-tags {
  display: flex;
  gap: 8px;
}

.level-tag {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  background: #fff;
  font-size: 12px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border: 1px solid #e8e8e8;
}

.level-tag:hover {
  border-color: #667eea;
}

.level-tag.active {
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.level-tag input[type="checkbox"] {
  display: none;
}

.tag-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.tag-dot.all { background: #999; }
.tag-dot.info { background: #2196F3; }
.tag-dot.warn { background: #FF9800; }
.tag-dot.error { background: #f56c6c; }

.level-tag.active .tag-dot {
  background: #fff !important;
}

/* 时间选择 */
.time-select-wrapper {
  position: relative;
}

.time-select {
  padding: 10px 32px 10px 14px;
  border: 1px solid #e8e8e8;
  border-radius: 24px;
  font-size: 13px;
  color: #666;
  background: #fff;
  outline: none;
  cursor: pointer;
  appearance: none;
  transition: all 0.3s;
}

.time-select:focus {
  border-color: #667eea;
}

.select-arrow {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* 导出按钮 */
.btn-export {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  border: none;
  border-radius: 24px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s;
}

.btn-export:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

/* 表格 */
.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  background: linear-gradient(180deg, #fafafa, #f5f5f5);
  font-weight: 600;
  color: #666;
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
}

.table td {
  padding: 14px 16px;
  border-bottom: 1px solid #f5f5f5;
  color: #333;
}

.table-row {
  transition: all 0.3s;
  animation: fadeInRow 0.5s ease-out both;
}

@keyframes fadeInRow {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.table-row:hover {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.05), transparent);
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #666;
}

.level-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.level-badge.info {
  background: linear-gradient(135deg, #2196F3, #1976D2);
  color: #fff;
}

.level-badge.warn {
  background: linear-gradient(135deg, #FF9800, #F57C00);
  color: #fff;
}

.level-badge.error {
  background: linear-gradient(135deg, #f56c6c, #e64242);
  color: #fff;
}

.module-tag {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f0f0;
  border-radius: 6px;
  font-size: 12px;
  color: #666;
}

.operator {
  color: #667eea;
  font-weight: 500;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 20px;
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
}

.pagination-info {
  font-size: 13px;
  color: #999;
}

.pagination-info strong {
  color: #667eea;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  background: #fff;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  border-color: #667eea;
  color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.page-btn:disabled {
  color: #d0d0d0;
  cursor: not-allowed;
  background: #f5f5f5;
}

.page-current {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
}
</style>
