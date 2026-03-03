import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { DataPrefetcher } from "./components/common/DataPrefetcher";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { GlobalErrorHandler } from "./components/common/GlobalErrorHandler";
import { ModuleDataPrefetcher } from "./components/common/ModuleDataPrefetcher";
import { ChatProvider } from "./contexts/ChatContext";
import { HierarchicalContextProvider } from "./contexts/HierarchicalContext";
import { PermissionsProvider } from "./contexts/PermissionsContext";
import { SuperAdminProvider } from "./contexts/SuperAdminContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { SWRProvider } from "./providers/SWRProvider";
import AppRoutes from "./routes/routes";

function App() {
  return (
    <ThemeProvider>
      <SWRProvider>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <SuperAdminProvider>
            <PermissionsProvider>
              <HierarchicalContextProvider>
                <ChatProvider>
                  <DataPrefetcher />
                  <ModuleDataPrefetcher />
                  <GlobalErrorHandler />
                  <ErrorBoundary>
                    <AppRoutes />
                  </ErrorBoundary>
                  {/* Toast Notifications */}
                  <Toaster
                    position="top-right"
                    richColors
                    closeButton
                    expand={true}
                    duration={4000}
                  />
                </ChatProvider>
              </HierarchicalContextProvider>
            </PermissionsProvider>
          </SuperAdminProvider>
        </BrowserRouter>
      </SWRProvider>
    </ThemeProvider>
  );
}

export default App;
