"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "motion/react";
import { useState, type ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: Infinity,
            refetchOnWindowFocus: false,
            // One quick automatic retry covers a network blip; after that the
            // panel shows its error and the user retries by hand.
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {/* With reduced motion on, Motion drops transform animations app-wide
          and keeps only fades. Components that skip an animation entirely
          (the sweep, the stat fill) still check useReducedMotion. */}
      <MotionConfig reducedMotion="user">
        <TooltipProvider delayDuration={300}>{children}</TooltipProvider>
      </MotionConfig>
    </QueryClientProvider>
  );
}
