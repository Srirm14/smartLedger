import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import "./index.scss";
import { Toaster } from "react-hot-toast";
import ScrollableApp from "./ScrollableApp ";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./utils/queryClient";
import { VercelAnalytics } from "./components/VercelAnalytics.jsx";

const root = createRoot(document.getElementById("root"));

async function prepare() {
  if (import.meta.env.VITE_APP_MOCK === "true") {
    const { worker } = await import("./mocks/browser.js");
    await worker.start({
      onUnhandledRequest: "bypass",
    });
  }
}

void prepare().then(() => {
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <VercelAnalytics />
          <Toaster />
          <ScrollableApp>
            <App />
          </ScrollableApp>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
});
