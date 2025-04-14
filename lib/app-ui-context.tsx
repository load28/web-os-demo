import { createContextQuery } from "@context-query/react";
import dynamic from "next/dynamic";
import { AppManifest } from "./types";

// Use dynamic imports for the apps to improve initial load performance
const NoteApp = dynamic(() => import("@/components/apps/note-app"), {
  loading: () => <div className="p-4">Loading Notes app...</div>,
});

const TodoApp = dynamic(() => import("@/components/apps/todo-app"), {
  loading: () => <div className="p-4">Loading Todo app...</div>,
});

type AppUiState = {
  openApps: string[];
  activeApp: string | null;
  minimizedApps: string[];
  availableApps: AppManifest[];
  windowPositions: Record<string, { x: number; y: number }>;
  windowSizes: Record<string, { width: number; height: number }>;
  launchApp: (appId: string) => void;
  activateApp: (appId: string) => void;
};

export const {
  Provider: AppUiProvider,
  useContextQuery: useAppUiContext,
  setState: setAppUiState,
  updateState: updateAppUiState,
} = createContextQuery<AppUiState>({
  openApps: [],
  activeApp: null,
  minimizedApps: [],
  availableApps: [
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
  ],
  windowPositions: {},
  windowSizes: {},
  launchApp: (appId: string) => {
    // 이미 열려있는 앱인지 확인
    updateAppUiState((state) => {
      // 이미 열려있다면 배열을 그대로 반환
      if (state.openApps.includes(appId)) {
        return state;
      }
      // 아니라면 새 앱 추가
      return {
        ...state,
        openApps: [...state.openApps, appId],
      };
    });

    // 창 위치 설정
    updateAppUiState((state) => {
      // 이미 위치가 설정되어 있다면 그대로 사용
      if (state.windowPositions[appId]) {
        return state;
      }
      // 새 위치 설정
      return {
        ...state,
        windowPositions: {
          ...state.windowPositions,
          [appId]: {
            x: 50 + Object.keys(state.windowPositions).length * 30,
            y: 50 + Object.keys(state.windowPositions).length * 30,
          },
        },
      };
    });

    // 창 크기 설정
    updateAppUiState((state) => {
      // 이미 크기가 설정되어 있다면 그대로 사용
      if (state.windowSizes[appId]) {
        return state;
      }
      // 새 크기 설정
      return {
        ...state,
        windowSizes: {
          ...state.windowSizes,
          [appId]: {
            width: 500,
            height: 400,
          },
        },
      };
    });

    // 최소화 상태라면 복원
    updateAppUiState((state) => {
      return {
        ...state,
        minimizedApps: state.minimizedApps.filter((id) => id !== appId),
      };
    });

    // 활성 앱으로 설정
    updateAppUiState((state) => {
      return {
        ...state,
        activeApp: appId,
      };
    });
  },
  activateApp: (appId: string) => {
    updateAppUiState((state) => ({
      ...state,
      activeApp: appId,
    }));
  },
});
