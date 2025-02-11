"use client"

import dynamic from "next/dynamic";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"
import { useEffect, useState } from "react"

const DynamicToast = dynamic(() => import('@/components/ui/toast'), {
  ssr: false,
});

const DynamicToastProvider = dynamic(() => import('@/components/ui/toast'), {
  ssr: false,
});

const DynamicToastViewport = dynamic(() => import('@/components/ui/toast'), {
  ssr: false,
});

const DynamicToastTitle = dynamic(() => import('@/components/ui/toast'), {
  ssr: false,
});

const DynamicToastDescription = dynamic(() => import('@/components/ui/toast'), {
  ssr: false,
});

const DynamicToastClose = dynamic(() => import('@/components/ui/toast'), {
  ssr: false,
});

export function Toaster() {
  const { toasts } = useToast()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <DynamicToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <DynamicToast 
            key={id} 
            {...props} 
            suppressHydrationWarning
          >
            <div className="grid gap-1">
              {title && <DynamicToastTitle suppressHydrationWarning>{title}</DynamicToastTitle>}
              {description && (
                <DynamicToastDescription suppressHydrationWarning>
                  {description}
                </DynamicToastDescription>
              )}
            </div>
            {action}
            <DynamicToastClose />
          </DynamicToast>
        )
      })}
      <DynamicToastViewport suppressHydrationWarning />
    </DynamicToastProvider>
  )
}
