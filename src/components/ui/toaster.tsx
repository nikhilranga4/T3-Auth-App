"use client"

import { useToast } from "~/components/ui/use-toast"
import { AnimatePresence } from "framer-motion"
import { CustomToast } from "./custom-toast"
import { ToastProvider, ToastViewport } from "./toast"

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <ToastProvider>
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[400px]">
        <AnimatePresence mode="sync" initial={false}>
          {toasts.map((toast) => {
            let type: "success" | "error" | "warning" | "info" = "info"
            if (toast.variant === "destructive") type = "error"
            else if (toast.variant === "default" && !toast.title?.toLowerCase().includes("error")) type = "success"

            // Auto dismiss after 3 seconds
            setTimeout(() => dismiss(toast.id), 3000)

            return (
              <CustomToast
                key={toast.id}
                type={type}
                title={toast.title || ""}
                description={toast.description?.toString() || ""}
                onClose={() => dismiss(toast.id)}
              />
            )
          })}
        </AnimatePresence>
      </div>
      <ToastViewport />
    </ToastProvider>
  )
} 