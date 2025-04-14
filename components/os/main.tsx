import { AppWindow } from "@/components/os/app-window";
import Desktop from "@/components/os/desktop";
import Taskbar from "@/components/os/taskbar";
import { updateAppUiState, useAppUiContext } from "@/lib/app-ui-context";
import { useEffect, useState } from "react";

export function Main() {
  const [
    {
      openApps,
      availableApps,
      activeApp,
      minimizedApps,
      windowPositions,
      windowSizes,
      launchApp,
      activateApp,
    },
  ] = useAppUiContext([
    "openApps",
    "availableApps",
    "activeApp",
    "minimizedApps",
    "windowPositions",
    "windowSizes",
    "launchApp",
    "activateApp",
  ]);

  const [isInitialized, setIsInitialized] = useState(false);

  const closeApp = (appId: string) => {
    updateAppUiState((state) => {
      return {
        ...state,
        openApps: state.openApps.filter((id) => id !== appId),
      };
    });

    if (activeApp === appId) {
      // 닫은 앱이 활성 앱이었다면 다른 앱을 활성화
      updateAppUiState((state) => {
        const remainingApps = state.openApps.filter((id) => id !== appId);
        return {
          ...state,
          openApps: remainingApps,
          activeApp: remainingApps.length > 0 ? remainingApps[0] : null,
        };
      });
    }
  };

  const minimizeApp = (appId: string) => {
    updateAppUiState((state) => {
      if (state.minimizedApps.includes(appId)) return state;
      return {
        ...state,
        minimizedApps: [...state.minimizedApps, appId],
      };
    });

    if (activeApp === appId) {
      // 최소화한 앱이 활성 앱이었다면 다른 앱을 활성화
      updateAppUiState((state) => {
        const availableApps = state.openApps.filter(
          (id) => id !== appId && !state.minimizedApps.includes(id)
        );

        return {
          ...state,
          openApps: availableApps,
          activeApp: availableApps.length > 0 ? availableApps[0] : null,
        };
      });
    }
  };

  const updateWindowPosition = (appId: string, x: number, y: number) => {
    updateAppUiState((state) => ({
      ...state,
      windowPositions: {
        ...state.windowPositions,
        [appId]: { x, y },
      },
    }));
  };

  const updateWindowSize = (appId: string, width: number, height: number) => {
    updateAppUiState((state) => ({
      ...state,
      windowSizes: {
        ...state.windowSizes,
        [appId]: { width, height },
      },
    }));
  };

  // 초기화 로직을 완전히 분리
  useEffect(() => {
    // 이미 초기화되었다면 실행하지 않음
    if (isInitialized) return;

    // 초기화 완료 표시
    setIsInitialized(true);

    // 첫 번째 앱 실행
    const timer1 = setTimeout(() => {
      launchApp("note-app");
    }, 100);

    // 두 번째 앱 실행
    const timer2 = setTimeout(() => {
      launchApp("todo-app");
    }, 600);

    // 타이머 정리
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isInitialized]); // isInitialized만 의존성으로 설정

  return (
    <main className="flex flex-col h-screen bg-blue-50 overflow-hidden">
      <div className="flex-1 relative">
        <Desktop />

        {openApps.map((appId) => {
          const app = availableApps.find((a) => a.id === appId);
          if (!app) return null;

          const isMinimized = minimizedApps.includes(appId);
          const position = windowPositions[appId] || { x: 50, y: 50 };
          const size = windowSizes[appId] || { width: 500, height: 400 };

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
              onFocus={() => activateApp(appId)}
              onMove={(x, y) => updateWindowPosition(appId, x, y)}
              onResize={(width, height) =>
                updateWindowSize(appId, width, height)
              }
            >
              <app.component />
            </AppWindow>
          );
        })}
      </div>

      <Taskbar />
    </main>
  );
}
