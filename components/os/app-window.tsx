"use client"

import type React from "react"
import type { ComponentType } from "react"

import { useState, useRef, type ReactNode, useEffect, useCallback } from "react"
import * as LucideIcons from "lucide-react"
import { X, Minus } from "lucide-react"

interface AppWindowProps {
  appId: string
  title: string
  icon: string
  children: ReactNode
  isActive: boolean
  isMinimized: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  onClose: () => void
  onMinimize: () => void
  onFocus: () => void
  onMove: (x: number, y: number) => void
  onResize: (width: number, height: number) => void
}

export function AppWindow({
  appId,
  title,
  icon,
  children,
  isActive,
  isMinimized,
  position,
  size,
  onClose,
  onMinimize,
  onFocus,
  onMove,
  onResize,
}: AppWindowProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const windowRef = useRef<HTMLDivElement>(null)

  // Dynamically get the icon component with explicit typing
  const IconComponent = (LucideIcons[icon as keyof typeof LucideIcons] || LucideIcons.Box) as ComponentType<any>

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive) {
      onFocus()
    }

    if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains("window-titlebar")) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      })
    }
  }

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsResizing(true)
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    })
  }

  const memoizedMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isDragging) {
        const newX = Math.max(0, e.clientX - dragStart.x)
        const newY = Math.max(0, e.clientY - dragStart.y)
        onMove(newX, newY)
      } else if (isResizing) {
        const newWidth = Math.max(300, resizeStart.width + (e.clientX - resizeStart.x))
        const newHeight = Math.max(200, resizeStart.height + (e.clientY - resizeStart.y))
        onResize(newWidth, newHeight)
      }
    },
    [isDragging, isResizing, dragStart, resizeStart, onMove, onResize],
  )

  const memoizedMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
  }, [])

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging || isResizing) {
      window.addEventListener("mousemove", memoizedMouseMove)
      window.addEventListener("mouseup", memoizedMouseUp)
    }

    return () => {
      window.removeEventListener("mousemove", memoizedMouseMove)
      window.removeEventListener("mouseup", memoizedMouseUp)
    }
  }, [isDragging, isResizing, memoizedMouseMove, memoizedMouseUp])

  if (isMinimized) {
    return null
  }

  return (
    <div
      ref={windowRef}
      className={`absolute rounded-lg shadow-lg overflow-hidden flex flex-col ${
        isActive ? "z-10 ring-2 ring-blue-500" : "z-0"
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onClick={onFocus}
    >
      {/* Window titlebar */}
      <div
        className="window-titlebar flex items-center justify-between px-3 py-2 bg-white border-b cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <IconComponent className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={onMinimize}>
            <Minus className="w-3 h-3 text-gray-600" />
          </button>
          <button className="p-1 rounded-full hover:bg-gray-100" onClick={onClose}>
            <X className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Window content */}
      <div className="flex-1 bg-white overflow-auto text-gray-800 app-window-content">{children}</div>

      {/* Resize handle */}
      <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize" onMouseDown={handleResizeMouseDown}>
        <div className="w-0 h-0 border-t-8 border-l-8 border-transparent border-t-gray-300 transform rotate-45 translate-x-1 translate-y-1" />
      </div>
    </div>
  )
}

