import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { SettingsProvider } from "@/settings/context/SettingsProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "./lib/react-query";
import { setupFetchInterceptor } from "./utils/fetchInterceptor";

// Setup global fetch interceptor to handle 401 errors
setupFetchInterceptor();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <SettingsProvider>
        <TooltipProvider delayDuration={200}>
          <LoadingProvider>
            <App />
          </LoadingProvider>
        </TooltipProvider>
      </SettingsProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
