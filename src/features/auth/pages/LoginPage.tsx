"use client";
import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import {
  LockKeyholeIcon,
  LogInIcon,
  MailIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { getApiErrorMessage } from "@/shared/helpers/backend";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import {
  emailRegex,
  loginHighlights,
  rememberedLoginEmailStorageKey,
} from "../constants/login_constants";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const { showToast } = useToast();
  const [rememberedEmail] = useState(getRememberedLoginEmail);
  const [rememberAccess, setRememberAccess] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/home");
    }
  }, [isAuthenticated, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email =
      String(formData.get("email") ?? "") ||
      getFormInputValue(event.currentTarget, "email") ||
      rememberedEmail;
    const password = String(formData.get("password") ?? "");

    if (rememberAccess && email) {
      localStorage.setItem(rememberedLoginEmailStorageKey, email);
    } else {
      localStorage.removeItem(rememberedLoginEmailStorageKey);
    }

    try {
      await login({ email, password, rememberAccess });
      router.push("/home");
    } catch (error) {
      showToast({
        title: "Login nao realizado",
        description: error instanceof ApiClientError
          ? getApiErrorMessage(error.response)
          : "Nao foi possivel entrar agora.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-rpg-night text-white">
      {/* Fundo decorativo: cria profundidade sem depender de imagens externas. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--rpg-primary)_0,transparent_34%),radial-gradient(circle_at_bottom_right,var(--rpg-accent)_0,transparent_30%),linear-gradient(135deg,var(--rpg-night)_0%,var(--rpg-night-soft)_48%,var(--rpg-night-deep)_100%)] opacity-90" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-size-[48px_48px]" />

      {/* Container principal: centraliza o conteudo e vira uma coluna unica no mobile. */}
      <section className="relative z-10 grid min-h-screen place-items-center px-6 py-10">
        {/* Motion neste wrapper anima a tela inteira sem afetar a validacao dos campos. */}
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]"
          initial={{ opacity: 0, scale: 0.98, y: 18 }}
          transition={{ duration: 0.42, ease: "easeOut" }}
        >
          {/* Area de apresentacao: da personalidade ao login e reforca o tema RPG. */}
          <motion.aside
            animate={{ opacity: 1, x: 0 }}
            className="relative hidden min-h-160 flex-col justify-between overflow-hidden p-10 lg:flex"
            initial={{ opacity: 0, x: -24 }}
            transition={{ delay: 0.08, duration: 0.38, ease: "easeOut" }}
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(251,191,36,0.28),transparent_24%),radial-gradient(circle_at_20%_80%,rgba(45,212,191,0.2),transparent_26%)]" />
            <div className="relative">
              {/* Badge de marca pequeno; os icones grandes decorativos foram removidos para evitar poluicao visual. */}
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/20 px-4 py-2 text-sm text-white/80"
                initial={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.18 }}
              >
                <SparklesIcon className="h-4 w-4 text-rpg-gold" />
                Portal RPG
              </motion.div>

              <motion.h1
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md text-5xl font-black leading-tight tracking-normal"
                initial={{ opacity: 0, y: 14 }}
                transition={{ delay: 0.24 }}
              >
                Entre na sua proxima aventura.
              </motion.h1>
              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 max-w-md text-justify text-base leading-7 text-white/72"
                initial={{ opacity: 0, y: 14 }}
                transition={{ delay: 0.3 }}
              >
                Acesse campanhas, personagens e mesas em um so lugar para manter
                o jogo fluindo.
              </motion.p>
            </div>

            <div className="relative grid gap-4">
              {loginHighlights.map((highlight, index) => (
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/82"
                  initial={{ opacity: 0, y: 12 }}
                  key={highlight}
                  transition={{ delay: 0.36 + index * 0.08 }}
                >
                  <ShieldCheckIcon className="h-5 w-5 text-rpg-success" />
                  {highlight}
                </motion.div>
              ))}
            </div>
          </motion.aside>

          {/* Painel do formulario: concentra a acao principal da pagina. */}
          <motion.div
            animate={{ opacity: 1, x: 0 }}
            className="bg-rpg-surface px-6 py-8 text-rpg-text sm:px-10 sm:py-12"
            initial={{ opacity: 0, x: 24 }}
            transition={{ delay: 0.12, duration: 0.38, ease: "easeOut" }}
          >
            <div className="mx-auto flex w-full max-w-md justify-center h-full flex-col">
              <div className="mb-8">
                <h2 className="text-3xl font-black tracking-normal">
                  Bem-vindo de volta
                </h2>
                <p className="mt-2 text-justify text-sm leading-6 text-rpg-muted">
                  Use seu email e senha para continuar sua jornada.
                </p>
              </div>

              <Form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                {/* Campo de email: o validate retorna uma mensagem quando o formato esta incorreto. */}
                <TextField
                  className="flex flex-col gap-2"
                  defaultValue={rememberedEmail}
                  isRequired
                  name="email"
                  type="email"
                  validate={(value) => {
                    if (!emailRegex.test(value)) {
                      return "Por favor, coloque um endereco de email valido.";
                    }
                    return null;
                  }}
                >
                  <Label className="text-sm font-semibold text-rpg-text">
                    Email
                  </Label>
                  {/* InputGroup junta icone + input em um unico campo acessivel da HeroUI. */}
                  <InputGroup
                    className="rounded-2xl border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Prefix className="text-rpg-primary">
                      <MailIcon className="h-5 w-5" />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      placeholder="voce@exemplo.com"
                    />
                  </InputGroup>
                  <FieldError className="text-sm font-medium text-rpg-danger" />
                </TextField>

                {/* Campo de senha: mantem a regra minima de 8 caracteres antes do envio. */}
                <TextField
                  className="flex flex-col gap-2"
                  isRequired
                  minLength={8}
                  name="password"
                  type="password"
                  validate={(value) => {
                    if (value.length < 8) {
                      return "A senha deve conter no minimo 8 digitos.";
                    }
                    return null;
                  }}
                >
                  <Label className="text-sm font-semibold text-rpg-text">
                    Senha
                  </Label>
                  {/* No campo de senha, o InputGroup mantem o estilo e recebe a validacao do TextField pai. */}
                  <InputGroup
                    className="rounded-2xl border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Prefix className="text-rpg-primary">
                      <LockKeyholeIcon className="h-5 w-5" />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      placeholder="Digite sua senha"
                    />
                  </InputGroup>
                  <FieldError className="text-sm font-medium text-rpg-danger" />
                </TextField>

                {/* Acoes auxiliares: deixam o fluxo mais completo visualmente. */}
                <div className="flex items-center justify-between text-sm">
                  <label className="flex cursor-pointer items-center gap-2 text-rpg-muted">
                    <input
                      className="h-4 w-4 rounded border-rpg-border accent-rpg-primary"
                      checked={rememberAccess}
                      name="rememberAccess"
                      onChange={(event) =>
                        setRememberAccess(event.target.checked)
                      }
                      type="checkbox"
                    />
                    Lembrar acesso
                  </label>
                  <a
                    className="font-semibold text-rpg-primary transition hover:text-rpg-primary-hover"
                    href="#"
                  >
                    Esqueci a senha
                  </a>
                </div>

                {/* Botao principal: usa HeroUI + icone do lucide para reforcar a acao. */}
                <Button
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-rpg-primary px-5 py-3 font-bold text-white shadow-lg shadow-rpg-primary/25 transition hover:bg-rpg-primary-hover"
                  isDisabled={isSubmitting}
                  type="submit"
                >
                  <LogInIcon className="h-5 w-5" />
                  {isSubmitting ? "Entrando..." : "Entrar"}
                </Button>
              </Form>

              <p className="mt-8 text-center text-sm text-rpg-muted">
                Ainda nao tem conta?{" "}
                <Link
                  className="font-bold text-rpg-primary transition hover:text-rpg-primary-hover"
                  href="/register"
                >
                  Criar cadastro
                </Link>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>
    </main>
  );
}

function getRememberedLoginEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return localStorage.getItem(rememberedLoginEmailStorageKey) ?? "";
}

function getFormInputValue(form: HTMLFormElement, name: string) {
  const input = form.elements.namedItem(name);

  if (input instanceof HTMLInputElement) {
    return input.value.trim();
  }

  return "";
}
