/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
// 告诉TypeScript识别所有css文件
declare module '*.css' {
  const styles: Record<string, string>
  export default styles
}