import type { ComponentType } from "react"

export interface AppManifest {
  id: string
  name: string
  icon: string
  component: ComponentType<any> // 타입을 ComponentType<any>로 변경
}

export interface WindowPosition {
  x: number
  y: number
}

export interface WindowSize {
  width: number
  height: number
}

