import "server-only";

import { headers } from "next/headers";
import { cache } from "react";
import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import SuperJSON from "superjson";

import { type AppRouter } from "~/server/api/root";

function getUrl() {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/trpc`;
  return 'http://localhost:3000/api/trpc';
}

export const api = createTRPCProxyClient<AppRouter>({
  transformer: SuperJSON,
  links: [
    httpBatchLink({
      url: getUrl(),
      headers() {
        const heads = new Headers(headers());
        heads.set("x-trpc-source", "rsc");
        return {
          ...Object.fromEntries(heads.entries()),
        };
      },
    }),
  ],
});
