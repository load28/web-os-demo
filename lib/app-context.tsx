"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface AppData {
  [key: string]: any
}

interface AppContextType {
  appData: Record<string, AppData>
  updateAppData: (appId: string, data: AppData) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [appData, setAppData] = useState<Record<string, AppData>>({})

  const updateAppData = (appId: string, data: AppData) => {
    setAppData((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        ...data,
      },
    }))
  }

  return <AppContext.Provider value={{ appData, updateAppData }}>{children}</AppContext.Provider>
}

export function useAppData() {
  const context = useContext(AppContext)
  if (context === undefined) {
    throw new Error("useAppData must be used within an AppProvider")
  }
  return context
}

