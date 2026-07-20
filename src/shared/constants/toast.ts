import { createContext } from "react";
import { ToastContextType, ToastType } from "../types/toast";

export const toastStyles: Record<ToastType["type"], string> = {
  success: "border-emerald-500 bg-emerald-950 text-emerald-50",
  error: "border-red-500 bg-red-950 text-red-50",
  info: "border-sky-500 bg-sky-950 text-sky-50",
  warning: "border-amber-500 bg-amber-950 text-amber-50",
};

export const ToastContext = createContext<ToastContextType | null>(null);
