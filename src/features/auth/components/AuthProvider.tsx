"use client";

import { Button } from "@heroui/react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useToast } from "@/shared/hooks/useToast";
import { AuthContext } from "../context/AuthContext";
import {
  getCurrentUser,
  loginUser,
  logoutUser,
  refreshAuthSession,
} from "../services/authService";
import { AuthSession, AuthUser, LoginPayload } from "../types/auth";

const ACCESS_TOKEN_STORAGE_KEY = "portal-rpg:access-token";
const REFRESH_TOKEN_STORAGE_KEY = "portal-rpg:refresh-token";
const USER_STORAGE_KEY = "portal-rpg:user";
const REMEMBER_ACCESS_STORAGE_KEY = "portal-rpg:remember-access";
const IDLE_WARNING_MS = 9 * 60 * 1000;
const IDLE_LIMIT_MS = 10 * 60 * 1000;

export function AuthProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const { showToast } = useToast();
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const logoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasHydratedSessionRef = useRef(false);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isIdleWarningOpen, setIsIdleWarningOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const clearIdleTimers = useCallback(() => {
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }

    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
  }, []);

  const getSessionStorage = useCallback(() => {
    const rememberAccess =
      localStorage.getItem(REMEMBER_ACCESS_STORAGE_KEY) === "true";

    return rememberAccess ? localStorage : sessionStorage;
  }, []);

  const clearStoredSession = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(REMEMBER_ACCESS_STORAGE_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(USER_STORAGE_KEY);
  }, []);

  const saveSession = useCallback(
    (session: AuthSession, rememberAccess = true) => {
      const storage = rememberAccess ? localStorage : sessionStorage;

      localStorage.setItem(
        REMEMBER_ACCESS_STORAGE_KEY,
        String(rememberAccess),
      );
      localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      sessionStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(USER_STORAGE_KEY);

      storage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
      storage.setItem(REFRESH_TOKEN_STORAGE_KEY, session.refreshToken);
      storage.setItem(USER_STORAGE_KEY, JSON.stringify(session.user));

      setAccessToken(session.accessToken);
      setRefreshToken(session.refreshToken);
      setUser(session.user);
    },
    [],
  );

  const updateSessionUser = useCallback(
    (nextUser: AuthUser) => {
      const storage = getSessionStorage();

      storage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
      setUser(nextUser);
    },
    [getSessionStorage],
  );

  const handleLogout = useCallback(
    async (options?: { notify?: boolean }) => {
      clearIdleTimers();

      const token =
        localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY) ??
        sessionStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);

      if (token) {
        await logoutUser(token);
      }

      clearStoredSession();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setIsIdleWarningOpen(false);

      if (options?.notify) {
        showToast({
          title: "Sessao encerrada",
          description: "Voce ficou ausente por 10 minutos.",
          type: "warning",
        });
      }

      router.push("/");
    },
    [clearIdleTimers, clearStoredSession, router, showToast],
  );

  const resetIdleTimers = useCallback(() => {
    clearIdleTimers();
    setIsIdleWarningOpen(false);

    warningTimerRef.current = setTimeout(() => {
      setIsIdleWarningOpen(true);
    }, IDLE_WARNING_MS);

    logoutTimerRef.current = setTimeout(() => {
      void handleLogout({
        notify: true,
      });
    }, IDLE_LIMIT_MS);
  }, [clearIdleTimers, handleLogout]);

  const refreshSession = useCallback(async () => {
    const token =
      refreshToken ?? getSessionStorage().getItem(REFRESH_TOKEN_STORAGE_KEY);

    if (!token) {
      await handleLogout();
      return false;
    }

    try {
      const session = await refreshAuthSession(token);
      saveSession(
        session,
        localStorage.getItem(REMEMBER_ACCESS_STORAGE_KEY) === "true",
      );
      resetIdleTimers();
      return true;
    } catch {
      await handleLogout({
        notify: true,
      });
      return false;
    }
  }, [
    getSessionStorage,
    handleLogout,
    refreshToken,
    resetIdleTimers,
    saveSession,
  ]);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const session = await loginUser({
        email: payload.email,
        password: payload.password,
      });
      saveSession(session, payload.rememberAccess ?? true);
      resetIdleTimers();
      return session;
    },
    [resetIdleTimers, saveSession],
  );

  const stayActive = useCallback(async () => {
    const renewed = await refreshSession();

    if (renewed) {
      showToast({
        title: "Sessao renovada",
        description: "Pode continuar sua aventura.",
        type: "success",
      });
    }
  }, [refreshSession, showToast]);

  useEffect(() => {
    if (hasHydratedSessionRef.current) {
      return;
    }

    hasHydratedSessionRef.current = true;

    async function hydrateSession() {
      const storage = getSessionStorage();
      const storedAccessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
      const storedRefreshToken = storage.getItem(REFRESH_TOKEN_STORAGE_KEY);
      const storedUser = storage.getItem(USER_STORAGE_KEY);

      if (!storedAccessToken || !storedRefreshToken || !storedUser) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser(storedAccessToken);
        setAccessToken(storedAccessToken);
        setRefreshToken(storedRefreshToken);
        setUser(currentUser);
        storage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
        resetIdleTimers();
      } catch {
        setRefreshToken(storedRefreshToken);
        await refreshSession();
      } finally {
        setIsLoading(false);
      }
    }

    void hydrateSession();

    return () => {
      clearIdleTimers();
    };
  }, [clearIdleTimers, getSessionStorage, refreshSession, resetIdleTimers]);

  useEffect(() => {
    if (!accessToken || isIdleWarningOpen) {
      return;
    }

    const events: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];

    // Enquanto nao ha aviso aberto, qualquer atividade reinicia a janela AFK.
    const handleActivity = () => {
      resetIdleTimers();
    };

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [accessToken, isIdleWarningOpen, resetIdleTimers]);

  const contextValue = useMemo(
    () => ({
      accessToken,
      isAuthenticated: Boolean(accessToken && user),
      isIdleWarningOpen,
      isLoading,
      login,
      logout: () => handleLogout(),
      refreshSession,
      stayActive,
      updateSessionUser,
      user,
    }),
    [
      accessToken,
      handleLogout,
      isIdleWarningOpen,
      isLoading,
      login,
      refreshSession,
      stayActive,
      updateSessionUser,
      user,
    ],
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}

      <AnimatePresence>
        {isIdleWarningOpen ? (
          <motion.div
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/45 px-4 backdrop-blur-sm"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-lg border border-rpg-border bg-rpg-surface p-5 text-rpg-text shadow-2xl"
              exit={{ opacity: 0, scale: 0.97, y: 12 }}
              initial={{ opacity: 0, scale: 0.97, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              <h2 className="text-lg font-black tracking-normal">
                Ainda esta por ai?
              </h2>
              <p className="mt-2 text-justify text-sm leading-6 text-rpg-muted">
                Sua sessao sera encerrada em instantes por inatividade. Clique
                para renovar seus tokens e continuar logado.
              </p>
              <div className="mt-5 flex justify-end gap-3">
                <Button
                  className="rounded-lg border border-rpg-border px-4 py-2 font-bold text-rpg-muted transition hover:bg-rpg-surface-muted"
                  onPress={() => void handleLogout()}
                  variant="secondary"
                >
                  Sair
                </Button>
                <Button
                  className="rounded-lg bg-rpg-primary px-4 py-2 font-bold text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover"
                  onPress={() => void stayActive()}
                >
                  Estou aqui
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}
