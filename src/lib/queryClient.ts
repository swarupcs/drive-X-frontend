import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        // Don't retry on 401, 403, 404
        if (error instanceof Error) {
          const msg = error.message.toLowerCase();
          if (msg.includes('unauthorized') || msg.includes('forbidden') || msg.includes('not found')) {
            return false;
          }
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
