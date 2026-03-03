/**
 * queryClient.js — TanStack Query client configuration
 * Centralized defaults: staleTime, gcTime, refetch, retries, global error handling
 */
import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 30_000,          // 30s before refetch
            gcTime: 5 * 60_000,         // 5 min garbage collection
            refetchOnWindowFocus: true,
            retry: 2,
            retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 10000),
        },
        mutations: {
            retry: 1,
            onError: (error) => {
                const message = error?.response?.data?.message || error?.message || 'Something went wrong';
                toast.error(message);
            },
        },
    },
});

export default queryClient;
