"use client";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";
import { ToastContext, toastStyles } from "../constants/toast";
import { ToastType } from "../types/toast";

export function ToastProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Lista de toasts que estao aparecendo na tela.
  const [toasts, setToasts] = useState<ToastType[]>([]);

  // Remove um toast pelo id. Usamos filter para manter todos menos o escolhido.
  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  // Cria um toast novo e agenda a remocao automatica depois de 4 segundos.
  const showToast = useCallback(
    (toast: Omit<ToastType, "id">) => {
      const id = crypto.randomUUID();

      setToasts((current) => [
        ...current,
        {
          id,
          ...toast,
        },
      ]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast],
  );

  // Valor que qualquer componente filho podera acessar com useToast().
  const contextValue = useMemo(
    () => ({
      showToast,
      removeToast,
    }),
    [removeToast, showToast],
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Container fixo onde os toasts aparecem. */}
      <div className="fixed bottom-4 right-4 z-50 flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-3">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              animate={{ opacity: 1, scale: 1, x: 0 }}
              className={`rounded-lg border px-4 py-3 shadow-lg ${toastStyles[toast.type]}`}
              exit={{ opacity: 0, scale: 0.96, x: 24 }}
              initial={{ opacity: 0, scale: 0.96, x: 32 }}
              key={toast.id}
              layout
              role="status"
              transition={{ duration: 0.22, ease: "easeOut" }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="text-sm">{toast.title}</strong>

                  {toast.description ? (
                    <p className="mt-1 text-sm opacity-85">
                      {toast.description}
                    </p>
                  ) : null}
                </div>

                <button
                  aria-label="Fechar toast"
                  className="grid size-7 shrink-0 place-items-center rounded-md text-sm hover:bg-white/10"
                  onClick={() => removeToast(toast.id)}
                  type="button"
                >
                  x
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
