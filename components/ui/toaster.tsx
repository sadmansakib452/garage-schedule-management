"use client";

import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      <ToastViewport
        className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
        suppressHydrationWarning
      />
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} suppressHydrationWarning>
            <div className="grid gap-1" suppressHydrationWarning>
              {title && (
                <ToastTitle suppressHydrationWarning>{title}</ToastTitle>
              )}
              {description && (
                <ToastDescription suppressHydrationWarning>
                  {description}
                </ToastDescription>
              )}
            </div>
            {action}
            <ToastClose suppressHydrationWarning />
          </Toast>
        );
      })}
    </ToastProvider>
  );
}
