"use client"

import { useState, useEffect } from "react"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import Desktop from "@/components/os/desktop"
import Taskbar from "@/components/os/taskbar"
import { AppProvider } from "@/lib/app-context"
import { OSProvider } from "@/lib/os-context"
import { AppWindow } from "@/components/os/app-window"
import type { AppManifest } from "@/lib/types"
import dynamic from "next/dynamic"

// Use dynamic imports for the apps to improve initial load performance
const NoteApp = dynamic(() => import("@/components/apps/note-app"), {
  loading: () => <div className="p-4">Loading Notes app...</div>,
})

const TodoApp = dynamic(() => import("@/components/apps/todo-app"), {
  loading: () => <div className="p-4">Loading Todo app...</div>,
})

// App manifests for our demo apps
const availableApps: AppManifest[] = [
  {
    id: "note-app",
    name: "Notes",
    icon: "Sticky",
    component: NoteApp,
  },
  {
    id: "todo-app",
    name: "Todo List",
    icon: "CheckSquare",
    component: TodoApp,
  },
]

// 초기 상태를 함수 외부에서 정의
const initialOpenApps: string[] = []
const initialWindowPositions: Record<string, { x: number; y: number }> = {}
const initialWindowSizes: Record<string, { width: number; height: number }> = {}

export default function Home() {
  const [openApps, setOpenApps] = useState<string[]>(initialOpenApps)
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [windowPositions, setWindowPositions] =
    useState<Record<string, { x: number; y: number }>>(initialWindowPositions)
  const [windowSizes, setWindowSizes] = useState<Record<string, { width: number; height: number }>>(initialWindowSizes)
  const [minimizedApps, setMinimizedApps] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // 앱 실행 함수를 완전히 재작성
  const launchApp = (appId: string) => {
    // 이미 열려있는 앱인지 확인
    setOpenApps((prevOpenApps) => {
      // 이미 열려있다면 배열을 그대로 반환
      if (prevOpenApps.includes(appId)) {
        return prevOpenApps
      }
      // 아니라면 새 앱 추가
      return [...prevOpenApps, appId]
    })

    // 창 위치 설정
    setWindowPositions((prevPositions) => {
      // 이미 위치가 설정되어 있다면 그대로 사용
      if (prevPositions[appId]) {
        return prevPositions
      }
      // 새 위치 설정
      return {
        ...prevPositions,
        [appId]: {
          x: 50 + Object.keys(prevPositions).length * 30,
          y: 50 + Object.keys(prevPositions).length * 30,
        },
      }
    })

    // 창 크기 설정
    setWindowSizes((prevSizes) => {
      // 이미 크기가 설정되어 있다면 그대로 사용
      if (prevSizes[appId]) {
        return prevSizes
      }
      // 새 크기 설정
      return {
        ...prevSizes,
        [appId]: {
          width: 500,
          height: 400,
        },
      }
    })

    // 최소화 상태라면 복원
    setMinimizedApps((prevMinimized) => prevMinimized.filter((id) => id !== appId))

    // 활성 앱으로 설정
    setActiveApp(appId)
  }

  const closeApp = (appId: string) => {
    setOpenApps((prev) => prev.filter((id) => id !== appId))

    if (activeApp === appId) {
      // 닫은 앱이 활성 앱이었다면 다른 앱을 활성화
      setActiveApp((prev) => {
        const remainingApps = openApps.filter((id) => id !== appId)
        return remainingApps.length > 0 ? remainingApps[0] : null
      })
    }
  }

  const minimizeApp = (appId: string) => {
    setMinimizedApps((prev) => {
      if (prev.includes(appId)) return prev
      return [...prev, appId]
    })

    if (activeApp === appId) {
      // 최소화한 앱이 활성 앱이었다면 다른 앱을 활성화
      setActiveApp((prev) => {
        const availableApps = openApps.filter((id) => id !== appId && !minimizedApps.includes(id))
        return availableApps.length > 0 ? availableApps[0] : null
      })
    }
  }

  const updateWindowPosition = (appId: string, x: number, y: number) => {
    setWindowPositions((prev) => ({
      ...prev,
      [appId]: { x, y },
    }))
  }

  const updateWindowSize = (appId: string, width: number, height: number) => {
    setWindowSizes((prev) => ({
      ...prev,
      [appId]: { width, height },
    }))
  }

  // 초기화 로직을 완전히 분리
  useEffect(() => {
    // 이미 초기화되었다면 실행하지 않음
    if (isInitialized) return

    // 초기화 완료 표시
    setIsInitialized(true)

    // 첫 번째 앱 실행
    const timer1 = setTimeout(() => {
      launchApp("note-app")
    }, 100)

    // 두 번째 앱 실행
    const timer2 = setTimeout(() => {
      launchApp("todo-app")
    }, 600)

    // 타이머 정리
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [isInitialized]) // isInitialized만 의존성으로 설정

  return (
    <DndProvider backend={HTML5Backend}>
      <OSProvider>
        <AppProvider>
          <main className="flex flex-col h-screen bg-blue-50 overflow-hidden">
            <div className="flex-1 relative">
              <Desktop onLaunchApp={launchApp} availableApps={availableApps} />

              {openApps.map((appId) => {
                const app = availableApps.find((a) => a.id === appId)
                if (!app) return null

                const isMinimized = minimizedApps.includes(appId)
                const position = windowPositions[appId] || { x: 50, y: 50 }
                const size = windowSizes[appId] || { width: 500, height: 400 }

                return (
                  <AppWindow
                    key={`window-${appId}`} // 키 값을 더 고유하게 변경
                    appId={appId}
                    title={app.name}
                    icon={app.icon}
                    isActive={activeApp === appId}
                    isMinimized={isMinimized}
                    position={position}
                    size={size}
                    onClose={() => closeApp(appId)}
                    onMinimize={() => minimizeApp(appId)}
                    onFocus={() => setActiveApp(appId)}
                    onMove={(x, y) => updateWindowPosition(appId, x, y)}
                    onResize={(width, height) => updateWindowSize(appId, width, height)}
                  >
                    <app.component />
                  </AppWindow>
                )
              })}
            </div>

            <Taskbar
              openApps={openApps}
              activeApp={activeApp}
              minimizedApps={minimizedApps}
              availableApps={availableApps}
              onLaunchApp={launchApp}
              onActivateApp={setActiveApp}
            />
          </main>
        </AppProvider>
      </OSProvider>
    </DndProvider>
  )
}

