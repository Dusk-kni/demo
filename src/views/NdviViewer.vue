<template>
  <div class="upload-page">
    <div class="settings-panel">
      <div class="panel-title">设置</div>

      <div class="form-group">
        <label class="form-label">名称</label>
        <input v-model="formData.name" type="text" class="form-input" :placeholder="uploadedFileName || '未命名'" />
      </div>

      <div class="form-group">
        <label class="form-label">描述</label>
        <textarea v-model="formData.description" class="form-textarea" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label class="form-label">标签</label>
        <input
          v-if="!showTagInput"
          type="text"
          class="form-input tag-input"
          placeholder="添加新标签"
          @focus="showTagInput = true"
          readonly
        />
        <div v-else class="tag-input-row">
          <input
            ref="tagInputRef"
            v-model="newTag"
            type="text"
            class="form-input tag-edit-input"
            placeholder="输入标签名称"
            @blur="handleTagBlur"
            @keyup.enter="addTag"
          />
        </div>
        <div v-if="tags.length > 0" class="tag-list">
          <span v-for="(tag, index) in tags" :key="index" class="tag-item">
            {{ tag }}
            <span class="tag-remove" @click="removeTag(index)">&times;</span>
          </span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="section-title">分享页面设置</div>

      <div class="checkbox-row">
        <label class="checkbox-label">
          <input v-model="shareSettings.showLayerList" type="checkbox" class="form-checkbox" />
          <span>显示图层列表</span>
        </label>
      </div>
      <div class="checkbox-row">
        <label class="checkbox-label">
          <input v-model="shareSettings.showLocateBtn" type="checkbox" class="form-checkbox" />
          <span>显示定位按钮</span>
        </label>
      </div>
      <div class="checkbox-row">
        <label class="checkbox-label">
          <input v-model="shareSettings.showScaleBar" type="checkbox" class="form-checkbox" />
          <span>显示比例尺</span>
        </label>
      </div>
      <div class="checkbox-row">
        <label class="checkbox-label">
          <input v-model="shareSettings.hideLogo" type="checkbox" class="form-checkbox" />
          <span>隐藏LOGO</span>
        </label>
      </div>

      <div class="form-group share-method">
        <label class="form-label">分享方式</label>
        <select v-model="shareSettings.shareMode" class="form-select">
          <option value="private">不公开</option>
          <option value="link">通过链接分享</option>
          <option value="public">完全公开</option>
        </select>
      </div>

      <div v-if="hasImage" class="image-info-section">
        <div class="divider"></div>
        <div class="section-title">影像信息</div>
        <div class="info-row"><span class="info-label">文件名</span><span class="info-value text-ellipsis">{{ uploadedFileName }}</span></div>
        <div class="info-row"><span class="info-label">文件大小</span><span class="info-value">{{ formatFileSize(imageSize) }}</span></div>
        <div class="info-row"><span class="info-label">影像尺寸</span><span class="info-value">{{ imageWidth }} × {{ imageHeight }} px</span></div>
        <div class="info-row"><span class="info-label">文件类型</span><span class="info-value">{{ imageType }}</span></div>
        <button class="btn btn--primary btn--submit" @click="submitImage">提交</button>
      </div>
    </div>

    <div class="preview-area">
      <div class="preview-header">
        <button class="btn btn--primary btn--upload" @click="triggerFileInput">上传影像</button>
        <input
          ref="fileInputRef"
          type="file"
          class="hidden-file-input"
          accept=".tif,.tiff,.geotiff,.img,.jpg,.jpeg,.png,.bmp,.hdf,.nc"
          @change="handleFileSelect"
        />
      </div>

      <div
        class="preview-container"
        :class="{ 'has-image': hasImage, 'is-dragover': isDragOver }"
        @dragenter.prevent="onDragEnter"
        @dragover.prevent="onDragOver"
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
        @mousemove="onPreviewMouseMove"
      >
        <div v-if="!hasImage" class="upload-placeholder">
          <svg class="upload-icon" viewBox="0 0 64 48" width="80" height="60">
            <g fill="none" stroke="#c0c4cc" stroke-width="1.5">
              <rect x="2" y="4" width="60" height="40" rx="3"/>
              <line x1="16" y1="18" x2="28" y2="6"/>
              <line x1="22" y1="12" x2="34" y2="24"/>
              <circle cx="44" cy="20" r="5"/>
              <line x1="8" y1="38" x2="56" y2="38"/>
              <polyline points="24,30 32,22 42,32 50,24"/>
            </g>
          </svg>
          <p class="placeholder-text">拖拽遥感影像到此处，或点击上传按钮选择文件</p>
          <p class="placeholder-hint">支持 TIFF、GeoTIFF、IMG、JPG、PNG 等格式</p>
        </div>

        <img
          v-if="hasImage && imageUrl"
          ref="previewImgRef"
          :src="imageUrl"
          alt="遥感影像预览"
          class="preview-image"
          @load="onImageLoad"
        />

        <div v-if="hasImage" class="overlay-coords">{{ currentCoords }}</div>
      </div>

      <div class="preview-footer">
        <button class="btn btn--danger btn--remove" :disabled="!hasImage" @click="removeImage">移除影像</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Message } from '../utils/message'

const formData = reactive({
  name: '',
  description: ''
})

const tags = ref<string[]>([])
const showTagInput = ref(false)
const newTag = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)

const shareSettings = reactive({
  showLayerList: false,
  showLocateBtn: false,
  showScaleBar: false,
  hideLogo: false,
  shareMode: 'private'
})

const fileInputRef = ref<HTMLInputElement | null>(null)
const previewImgRef = ref<HTMLImageElement | null>(null)

const hasImage = ref<boolean>(false)
const imageUrl = ref<string>('')
const uploadedFileName = ref<string>('')
const imageSize = ref<number>(0)
const imageWidth = ref<number>(0)
const imageHeight = ref<number>(0)
const imageType = ref<string>('')

const currentCoords = ref<string>('105.741,35.066')
const isDragOver = ref<boolean>(false)

function triggerFileInput(): void {
  fileInputRef.value?.click()
}

function handleFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement
  if (!input.files || input.files.length === 0) return

  const file = input.files[0]
  processFile(file)
}

function processFile(file: File): void {
  const validTypes = ['image/tiff', 'image/geotiff', 'image/jpeg', 'image/png', 'image/bmp']
  const validExts = ['.tif', '.tiff', '.geotiff', '.img', '.jpg', '.jpeg', '.png', '.bmp', '.hdf', '.nc']

  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  if (!validExts.includes(ext) && !validTypes.includes(file.type)) {
    Message.error('不支持的文件格式，请上传遥感影像文件（TIFF/JPG/PNG等）')
    return
  }

  if (file.size > 500 * 1024 * 1024) {
    Message.error('文件大小超过限制（最大 500MB）')
    return
  }

  uploadedFileName.value = file.name
  imageSize.value = file.size
  imageType.value = ext.toUpperCase().replace('.', '')

  const reader = new FileReader()
  reader.onload = (e: ProgressEvent<FileReader>) => {
    imageUrl.value = e.target?.result as string
    hasImage.value = true

    if (!formData.name.trim()) {
      formData.name = file.name.replace(/\.[^.]+$/, '')
    }

    Message.success(`影像「${file.name}」已加载`)
  }
  reader.onerror = () => {
    Message.error('文件读取失败，请重试')
  }
  reader.readAsDataURL(file)
}

function onDragEnter(): void {
  isDragOver.value = true
}

function onDragOver(): void {
  isDragOver.value = true
}

function onDragLeave(e: DragEvent): void {
  const target = e.currentTarget as HTMLElement
  if (!target.contains(e.relatedTarget as Node)) {
    isDragOver.value = false
  }
}

function onDrop(e: DragEvent): void {
  isDragOver.value = false
  const files = e.dataTransfer?.files
  if (!files || files.length === 0) return

  const file = files[0]
  processFile(file)
}

function onImageLoad(event: Event): void {
  const img = event.target as HTMLImageElement
  imageWidth.value = img.naturalWidth
  imageHeight.value = img.naturalHeight
}

function onPreviewMouseMove(e: MouseEvent): void {
  if (!hasImage.value || !previewImgRef.value) return

  const rect = previewImgRef.value.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width).toFixed(3)
  const y = ((e.clientY - rect.top) / rect.height).toFixed(3)

  const lng = (73.55 + parseFloat(x) * (135.05 - 73.55)).toFixed(3)
  const lat = (53.56 - parseFloat(y) * (53.56 - 17.97)).toFixed(3)
  currentCoords.value = `${lng},${lat}`
}

function removeImage(): void {
  hasImage.value = false
  imageUrl.value = ''
  uploadedFileName.value = ''
  imageSize.value = 0
  imageWidth.value = 0
  imageHeight.value = 0
  imageType.value = ''
  currentCoords.value = '105.741,35.066'

  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }

  Message.info('影像已移除')
}

function submitImage(): void {
  if (!hasImage.value) return
  Message.success('影像提交成功')
}

function addTag(): void {
  const trimmed = newTag.value.trim()
  if (trimmed && !tags.value.includes(trimmed)) {
    tags.value.push(trimmed)
  }
  newTag.value = ''
  showTagInput.value = false
}

function removeTag(index: number): void {
  tags.value.splice(index, 1)
}

function handleTagBlur(): void {
  if (newTag.value.trim()) {
    addTag()
  } else {
    showTagInput.value = false
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}
</script>

<style scoped>
.upload-page {
  width: 100%;
  height: 100%;
  display: flex;
  background: #ffffff;
  overflow: hidden;
}

.settings-panel {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid #dcdfe6;
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow-y: auto;
  background: #fafafa;
}

.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 16px;
  letter-spacing: 0.5px;
}

.form-group {
  margin-bottom: 14px;
}

.form-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: #606266;
  margin-bottom: 6px;
}

.form-input {
  width: 100%;
  height: 32px;
  padding: 0 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #409eff;
}

.form-input::placeholder {
  color: #c0c4cc;
}

.hidden-file-input {
  display: none;
}

.form-textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
  outline: none;
  resize: vertical;
  box-sizing: border-box;
  min-height: 72px;
  font-family: inherit;
  line-height: 1.5;
}

.form-textarea:focus {
  border-color: #409eff;
}

.tag-input {
  cursor: pointer;
}

.tag-input-row {
  display: flex;
  gap: 4px;
}

.tag-edit-input {
  flex: 1;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 8px;
}

.tag-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  background: #ecf5ff;
  color: #409eff;
  border-radius: 4px;
  font-size: 12px;
}

.tag-remove {
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  opacity: 0.6;
}

.tag-remove:hover {
  opacity: 1;
}

.divider {
  height: 1px;
  background: #ebeef5;
  margin: 14px 0;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 10px;
}

.checkbox-row {
  margin-bottom: 8px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #606266;
  cursor: pointer;
}

.form-checkbox {
  width: 14px;
  height: 14px;
  accent-color: #409eff;
  cursor: pointer;
}

.share-method {
  margin-top: 12px;
}

.image-info-section {
  margin-top: 4px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
  font-size: 12px;
}

.info-label {
  color: #909399;
  flex-shrink: 0;
}

.info-value {
  color: #303133;
  font-weight: 500;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 110px;
}

.btn--submit {
  width: 100%;
  margin-top: 10px;
  padding: 7px 0;
  font-size: 12px;
  background: #17a2b8;
  color: #fff;
  border-radius: 4px;
}

.btn--submit:hover {
  background: #138496;
}

.form-select {
  width: 100%;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 13px;
  color: #303133;
  outline: none;
  background: #fff;
  cursor: pointer;
  box-sizing: border-box;
}

.form-select:focus {
  border-color: #409eff;
}

.preview-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  min-width: 0;
}

.preview-header {
  padding: 16px 20px 0;
  display: flex;
  justify-content: flex-start;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 28px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  letter-spacing: 0.5px;
}

.btn--primary {
  background: #17a2b8;
  color: #fff;
}

.btn--primary:hover {
  background: #138496;
}

.btn--primary:disabled {
  background: #b0d4e1;
  cursor: not-allowed;
}

.btn--upload {
  padding: 10px 32px;
}

.preview-container {
  flex: 1;
  position: relative;
  margin: 12px 20px 0;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  overflow: hidden;
  min-height: 0;
  background: #f5f7fa;
  transition: border-color 0.25s, background 0.25s;
}

.preview-container.is-dragover {
  border-color: #17a2b8;
  border-style: dashed;
  background: rgba(23, 162, 184, 0.04);
}

.upload-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.upload-icon {
  opacity: 0.45;
}

.placeholder-text {
  font-size: 15px;
  color: #909399;
  max-width: 320px;
  text-align: center;
  line-height: 1.6;
}

.placeholder-hint {
  font-size: 12px;
  color: #c0c4cc;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.overlay-coords {
  position: absolute;
  top: 8px;
  left: 10px;
  z-index: 500;
  background: rgba(255, 255, 255, 0.88);
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 12px;
  color: #333;
  font-family: monospace;
  letter-spacing: 0.3px;
  user-select: none;
}

.preview-footer {
  padding: 12px 20px;
  display: flex;
  justify-content: flex-end;
}

.btn--remove {
  padding: 10px 32px;
  background: #f56c6c;
  color: #fff;
}

.btn--remove:hover {
  background: #e64242;
}

.btn--remove:disabled {
  background: #fab6b6;
  cursor: not-allowed;
}
</style>
