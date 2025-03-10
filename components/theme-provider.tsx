"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ReactNode } from "react"

// 직접 인터페이스를 정의하는 대신 NextThemesProvider의 props 타입을 사용
type NextThemesProviderProps = React.ComponentProps<typeof NextThemesProvider>

// 간단한 래퍼 인터페이스 정의
interface ThemeProviderProps extends NextThemesProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}

