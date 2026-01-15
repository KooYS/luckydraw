"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

interface QueryProviderProps {
  children: React.ReactNode;
}

export default function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 기본 stale time: 5초
            staleTime: 5 * 1000,
            // 기본 refetch interval: 10초 (관리자 페이지에서 실시간성 확보)
            refetchInterval: 10 * 1000,
            // 윈도우 포커스 시 refetch
            refetchOnWindowFocus: true,
            // 재연결 시 refetch
            refetchOnReconnect: true,
            // 실패 시 3번 재시도
            retry: 3,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
