export type ToastType = {
  id: string;
  title: string;
  description?: string;
  type: "success" | "error" | "info" | "warning";
};

export type ToastContextType = {
  showToast: (toast: Omit<ToastType, "id">) => void;
  removeToast: (id: string) => void;
};
