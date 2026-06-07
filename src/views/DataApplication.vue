<template>
  <div class="data-nav-page">
    <div class="search-bar">
      <svg class="search-icon" viewBox="0 0 18 18" fill="none">
        <circle cx="7.5" cy="7.5" r="5.5" stroke="#666" stroke-width="1.5"/>
        <path d="m11 11 4.5 4.5" stroke="#666" stroke-width="1.5" stroke-linecap="round"/>
      </svg>
      <input
        v-model="searchKeyword"
        type="text"
        class="search-input"
        placeholder="输入关键词检索数据..."
        @keyup.enter="handleSearch"
      />
      <button class="query-btn" @click="handleSearch">查询</button>
    </div>

    <div class="letter-nav-bar">
      <span class="nav-label">字母导航</span>
      <button
        v-for="letter in letters"
        :key="letter"
        :class="['letter-btn', { 'letter-btn--active': activeLetter === letter }]"
        @click="activeLetter = letter"
      >
        {{ letter }}
      </button>
    </div>

    <div class="category-nav-bar">
      <span class="nav-label">分类导航</span>
      <button
        v-for="cat in categories"
        :key="cat.key"
        :class="['cat-btn', { 'cat-btn--active': activeCategory === cat.key }]"
        @click="activeCategory = cat.key"
      >
        {{ cat.label }}
      </button>
    </div>

    <div class="main-area">
      <aside class="sidebar">
        <div v-for="(panel, idx) in sidePanels" :key="idx" class="panel">
          <div class="panel-header" @click="togglePanel(idx)">
            <span>{{ panel.title }}</span>
            <svg :class="['arrow', { 'arrow--collapsed': !panel.expanded }]" viewBox="0 0 16 16" fill="none">
              <path d="M4 6l4 4 4-4" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <transition name="slide">
            <div v-show="panel.expanded" class="panel-body">
              <div
                v-for="item in panel.items"
                :key="item.label"
                :class="['panel-item', { 'panel-item--active': activeSideItem === item.label }]"
                @click="handleSideItemClick(item.label)"
              >
                {{ item.label }}<span class="count">({{ item.count }})</span>
              </div>
            </div>
          </transition>
        </div>
      </aside>

      <main class="content-area">
        <div class="sort-bar">
          <span class="sort-label">排序：</span>
          <button
            v-for="opt in sortOptions"
            :key="opt.key"
            :class="['sort-opt', { 'sort-opt--active': sortKey === opt.key }]"
            @click="toggleSort(opt.key)"
          >
            {{ opt.label }}
            <svg class="sort-arrow" viewBox="0 0 12 12" fill="none">
              <path d="M2 4.5h8M6 1.5l3 3-3 3" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10 7.5H2M6 10.5L3 7.5l3-3" stroke="#333" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <span class="result-count">共 {{ filteredCards.length }} 条结果</span>
        </div>

        <div v-if="filteredCards.length > 0" class="card-list">
          <div v-for="card in sortedCards" :key="card.id" class="data-card">
            <img :src="card.thumbnail" :alt="card.title" class="card-thumb" />
            <div class="card-info">
              <h3 class="card-title">{{ card.title }}</h3>
              <p class="card-desc">{{ card.description }}</p>
              <p class="card-date">发布日期：{{ card.publishDate }}</p>
              <a href="#" class="card-detail" @click.prevent>
                <svg viewBox="0 0 14 14" fill="none"><path d="M3 9l4-4 4 4" stroke="#1f8f45" stroke-width="1.5" stroke-linecap="round"/></svg>
                详情>>
              </a>
            </div>
          </div>
        </div>

        <div v-else class="empty-state">
          <svg class="empty-icon" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="28" r="16" stroke="#ccc" stroke-width="2"/>
            <path d="M24 40c0-4.4 3.6-8 8-8s8 3.6 8 8" stroke="#ccc" stroke-width="2"/>
            <circle cx="26" cy="25" r="1.5" fill="#ccc"/>
            <circle cx="38" cy="25" r="1.5" fill="#ccc"/>
          </svg>
          <p class="empty-text">未找到匹配的数据记录</p>
          <p class="empty-hint">请尝试调整检索条件或选择其他分类</p>
          <button class="reset-btn" @click="resetFilters">重置筛选条件</button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'

const searchKeyword = ref('')
const appliedSearch = ref('')
const activeLetter = ref('F')
const activeCategory = ref('fire')
const activeSideItem = ref('')
const sortKey = ref<'date' | 'size' | 'views'>('date')
const sortOrder = ref<'asc' | 'desc'>('desc')

const letters = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))

const categories = [
  { key: 'fire', label: '火点数据' },
  { key: 'resource', label: '应急资源' },
  { key: 'remote', label: '遥感影像' },
  { key: 'warning', label: '火险等级' }
]

const sidePanels = reactive([
  {
    title: '火点监测',
    expanded: true,
    items: [
      { label: '实时火点数据', count: 5658 },
      { label: '历史火点数据', count: 1116 },
      { label: '火灾蔓延轨迹..', count: 1018 }
    ]
  },
  {
    title: '气象辅助数据',
    expanded: true,
    items: [
      { label: '实时气象数据', count: 8111 },
      { label: '历史气象数据', count: 7997 },
      { label: '气象预报数据', count: 3641 }
    ]
  },
  {
    title: '统计分析数据',
    expanded: true,
    items: [
      { label: '区域火点统计', count: 12935 },
      { label: '火灾趋势分析', count: 2705 },
      { label: '火险等级统计', count: 1849 },
      { label: '年度综合报告', count: 18 }
    ]
  }
])

const sortOptions = [
  { key: 'date' as const, label: '发布日期' },
  { key: 'size' as const, label: '数据量' },
  { key: 'views' as const, label: '点击量' }
]

interface DataCard {
  id: number
  title: string
  description: string
  publishDate: string
  thumbnail: string
  size: number
  views: number
}

const dataCards = ref<DataCard[]>([
  {
    id: 1,
    title: 'FY4B 卫星云图',
    description: '描述：本图为中国风云四号 B 星（FY-4B）AGRI 仪器于2026 年 5 月 19 日 20:45（北京时间）拍摄的东亚及周边地区真彩色卫星云图。拍摄时正值春末夏初时段，晨昏线清晰，夜间城市群灯光可辨。未来24-48小时，沙尘将陆续东扩影响华北、黄淮地区；中东部锋面降水将持续 1-2 天，部分地区有大雨到暴雨；南海夏季风暴发后，华南、西南将进入前汛期降水集中期，强对流天气将更为频繁。',
    publishDate: '2026-5-19',
    thumbnail: 'https://picsum.photos/seed/fy4b-cloud/120/120',
    size: 245,
    views: 12450
  },
  {
    id: 2,
    title: '降水量预报图',
    description: '描述：降水主要集中在南方，形成两大强降水中心：主中心在江南南部至华南北部，局地出现 100-250 毫米大暴雨；次中心在云南南部至广西西部，有连片暴雨。江南、华南大部及贵州、云南南部都有中到大雨，北方仅局地有分散小雨。',
    publishDate: '2026-5-19',
    thumbnail: 'https://picsum.photos/seed/rain-forecast/120/120',
    size: 128,
    views: 8920
  },
  {
    id: 3,
    title: '降水量预报图',
    description: '描述：降水主要集中在南方，形成两大强降水中心：主中心在江南南部至华北部，局地出现 100-250 毫米大暴雨；次中心在云南南部至广西西部，有连片暴雨。江南、华南大部及贵州、云南南部都有中到大雨，北方仅局地有分散小雨。',
    publishDate: '2026-5-19',
    thumbnail: 'https://picsum.photos/seed/rain-forecast2/120/120',
    size: 115,
    views: 7560
  },
  {
    id: 4,
    title: '全国火险等级分布图',
    description: '描述：今日全国高火险区主要分布在西南地区东部及华北部分区域。四川南部、云南北部火险等级达极高（五级），需重点防范森林草原火灾。内蒙古中部、河北西部为较高风险区域（四级），建议加强巡护监测。东北及华东大部分地区火险等级较低（一至二级）。',
    publishDate: '2026-5-18',
    thumbnail: 'https://picsum.photos/seed/fire-risk-map/120/120',
    size: 89,
    views: 6340
  },
  {
    id: 5,
    title: '凉山州应急资源分布图',
    description: '描述：展示四川省凉山彝族自治州境内消防站、水源点、直升机起降点等应急资源的空间分布情况。全州共标注消防站点 23 处、应急水源 67 个、直升机临时起降点 8 处。资源密度以州府西昌市为中心向外递减，偏远山区覆盖不足，建议增设临时补给点。',
    publishDate: '2026-5-17',
    thumbnail: 'https://picsum.photos/seed/emergency-resource/120/120',
    size: 156,
    views: 5120
  },
  {
    id: 6,
    title: 'Sentinel-2 火烧迹地检测',
    description: '描述：基于Sentinel-2 L2A级多光谱影像，采用归一化燃烧指数(NBR)差分法对凉山州2026年春季火烧迹地进行检测识别。检测到过火面积累计约 28.6 平方公里，主要集中分布于木里县与盐源县交界地带，植被恢复程度评估正在进行中。',
    publishDate: '2026-5-16',
    thumbnail: 'https://picsum.photos/seed/sentinel2-fire/120/120',
    size: 203,
    views: 4580
  }
])

function togglePanel(idx: number): void {
  sidePanels[idx].expanded = !sidePanels[idx].expanded
}

function handleSearch(): void {
  appliedSearch.value = searchKeyword.value.trim()
}

function handleSideItemClick(label: string): void {
  if (activeSideItem.value === label) {
    activeSideItem.value = ''
  } else {
    activeSideItem.value = label
  }
}

function resetFilters(): void {
  searchKeyword.value = ''
  appliedSearch.value = ''
  activeSideItem.value = ''
  activeCategory.value = 'fire'
  activeLetter.value = 'F'
}

function toggleSort(key: 'date' | 'size' | 'views'): void {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortOrder.value = 'desc'
  }
}

const filteredCards = computed<DataCard[]>(() => {
  let result = dataCards.value

  if (appliedSearch.value) {
    const kw = appliedSearch.value.toLowerCase()
    result = result.filter(
      card =>
        card.title.toLowerCase().includes(kw) ||
        card.description.toLowerCase().includes(kw)
    )
  }

  return result
})

const sortedCards = computed<DataCard[]>(() => {
  return [...filteredCards.value].sort((a, b) => {
    const va = a[sortKey.value]
    const vb = b[sortKey.value]
    return sortOrder.value === 'asc' ? (va > vb ? 1 : -1) : (va > vb ? -1 : 1)
  })
})
</script>

<style scoped>
.data-nav-page {
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.search-bar {
  height: 44px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 10px;
  border-bottom: 1px solid #eee;
  flex-shrink: 0;
}

.search-icon {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  max-width: 400px;
  height: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0 12px 0 10px;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  background: #fafafa;
  transition: all 0.15s;
}

.search-input:focus {
  border-color: #17a2b8;
  background: #fff;
  box-shadow: 0 0 0 2px rgba(23,162,184,0.1);
}

.search-input::placeholder {
  color: #aaa;
}

.query-btn {
  height: 30px;
  padding: 0 16px;
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.query-btn:hover {
  background: #138496;
}

.query-btn:active {
  background: #117a8b;
}

.letter-nav-bar {
  height: 40px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid #eee;
}

.category-nav-bar {
  height: 45px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 16px;
  gap: 12px;
  flex-shrink: 0;
  border-bottom: 1px solid #eee;
}

.nav-label {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 500;
  white-space: nowrap;
  margin-right: 4px;
}

.letter-btn {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  background: #e8e8e8;
  border: none;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  flex-shrink: 0;
}

.letter-btn:hover {
  background: #c8c8c8;
}

.letter-btn--active {
  background: #17a2b8;
  color: #fff;
}

.cat-btn {
  padding: 8px 16px;
  border-radius: 6px;
  background: #fff;
  border: 1px solid #e8e8e8;
  font-size: 14px;
  color: #1a1a1a;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}

.cat-btn:hover {
  background: #f0f0f0;
}

.cat-btn--active {
  background: #888;
  color: #fff;
  border-color: #888;
}

.main-area {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar {
  width: 220px;
  background: #fff;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #eee;
  overflow-y: auto;
}

.panel {
  border-bottom: 1px solid #eee;
}

.panel:last-child {
  border-bottom: none;
}

.panel-header {
  height: 40px;
  background: #17a2b8;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 12px 0 16px;
  cursor: pointer;
  user-select: none;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
}

.arrow {
  width: 16px;
  height: 16px;
  transition: transform 0.25s ease;
  flex-shrink: 0;
}

.arrow--collapsed {
  transform: rotate(-90deg);
}

.panel-body {
  overflow: hidden;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-enter-to,
.slide-leave-from {
  opacity: 1;
  max-height: 300px;
}

.panel-item {
  height: 36px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-size: 13px;
  color: #333;
  cursor: pointer;
  transition: background 0.15s;
}

.panel-item:hover {
  background: #f5f5f5;
}

.panel-item--active {
  color: #17a2b8;
  font-weight: 500;
  background: #f0fbfd;
}

.count {
  color: #999;
  margin-left: 4px;
  font-size: 13px;
}

.content-area {
  flex: 1;
  min-width: 0;
  padding: 0;
  background: #f5f5f5;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.sort-bar {
  height: 40px;
  background: #ebebeb;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;
  flex-shrink: 0;
}

.sort-label {
  font-size: 14px;
  color: #1a1a1a;
}

.result-count {
  font-size: 12px;
  color: #999;
  margin-left: auto;
}

.sort-opt {
  background: none;
  border: none;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px 0;
  transition: all 0.15s;
}

.sort-opt:hover {
  color: #000;
}

.sort-opt--active {
  font-weight: 700;
}

.sort-arrow {
  width: 12px;
  height: 12px;
  flex-shrink: 0;
}

.card-list {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.data-card {
  display: flex;
  background: #fff;
  padding: 16px;
  border-bottom: 1px solid #eee;
  gap: 20px;
  min-height: 160px;
  box-sizing: border-box;
}

.data-card:last-child {
  border-bottom: none;
}

.card-thumb {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border: 1px solid #eee;
  flex-shrink: 0;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.card-thumb:hover {
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  position: relative;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.card-desc {
  font-size: 14px;
  color: #333;
  line-height: 1.5;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-date {
  font-size: 13px;
  color: #888;
  margin: 0;
}

.card-detail {
  position: absolute;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #1f8f45;
  font-size: 14px;
  text-decoration: none;
  cursor: pointer;
}

.card-detail svg {
  width: 14px;
  height: 14px;
}

.card-detail:hover {
  color: #167a38;
  text-decoration: underline;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 12px;
}

.empty-icon {
  width: 64px;
  height: 64px;
  opacity: 0.5;
}

.empty-text {
  font-size: 15px;
  color: #666;
  margin: 0;
}

.empty-hint {
  font-size: 13px;
  color: #999;
  margin: 0;
}

.reset-btn {
  margin-top: 8px;
  padding: 8px 24px;
  background: #17a2b8;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.15s;
}

.reset-btn:hover {
  background: #138496;
}
</style>
