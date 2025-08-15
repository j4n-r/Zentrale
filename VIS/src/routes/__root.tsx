// src/routes/__root.tsx
import {
  HeadContent,
  Scripts,
  Outlet,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanstackDevtools } from "@tanstack/react-devtools";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboardSidebar";

interface MyRouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "TanStack Start Starter" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <SidebarProvider>
        <DashboardSidebar />
        <main className="flex-1 p-4 md:p-6 lg:p-8 min-h-screen bg-gray-50">
          <SidebarTrigger className="mb-4 md:hidden" />
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </SidebarProvider>

      <TanstackDevtools
        config={{ position: "bottom-left" }}
        plugins={[
          { name: "Tanstack Router", render: <TanStackRouterDevtoolsPanel /> },
          TanStackQueryDevtools,
        ]}
      />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}
