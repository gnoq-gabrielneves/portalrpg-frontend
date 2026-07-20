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
  ArrowLeftIcon,
  BadgeCheckIcon,
  Dice5Icon,
  LockKeyholeIcon,
  MailIcon,
  ScrollTextIcon,
  SparklesIcon,
  UserRoundIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { emailRegex } from "../constants/login_constants";
import { registerHighlights } from "../constants/register_constants";
import { useRegisterUser } from "../hooks/useRegisterUser";

export function RegisterPage() {
  const router = useRouter();
  const registerUser = useRegisterUser({
    onSuccess: () => {
      router.push("/");
    },
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // FormData mantem o formulario desacoplado de estados locais simples.
    const formData = new FormData(event.currentTarget);
    const displayName = String(formData.get("displayName") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    registerUser.mutate({
      displayName,
      email,
      password,
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-rpg-night text-white">
      {/* Camadas de fundo compartilhadas com o login para manter as paginas publicas consistentes. */}
      <div className="absolute inset-0 bg-[linear-gradient(135deg,var(--rpg-night)_0%,var(--rpg-night-soft)_46%,var(--rpg-night-deep)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-size-[48px_48px]" />

      <section className="relative z-10 grid min-h-screen place-items-center px-6 py-10">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-lg border border-white/15 bg-white/10 shadow-2xl shadow-black/30 backdrop-blur-xl lg:grid-cols-[0.9fr_1.1fr]">
          {/* Bloco editorial aparece so no desktop; no mobile o foco fica direto no formulario. */}
          <motion.aside
            animate="visible"
            className="relative hidden min-h-160 flex-col justify-between overflow-hidden border-r border-white/10 p-10 lg:flex"
            initial="hidden"
            variants={{
              hidden: { opacity: 0, x: -24 },
              visible: { opacity: 1, x: 0 },
            }}
          >
            <div>
              <div className="flex gap-4">
                <Link
                  className="mb-10 inline-flex items-center gap-2 rounded-lg border border-white/15 bg-black/20 px-4 py-2 text-sm font-semibold text-white/82 transition hover:bg-white/10"
                  href="/"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Voltar ao login
                </Link>
              </div>

              <h1 className="max-w-md text-5xl font-black leading-tight tracking-normal">
                Crie seu acesso ao Portal RPG.
              </h1>
              <p className="mt-5 max-w-md text-justify text-base leading-7 text-white/72">
                Monte sua identidade de jogador para entrar nas campanhas,
                salvar fichas e organizar suas proximas sessoes.
              </p>
            </div>

            <div className="relative grid gap-3">
              {registerHighlights.map((highlight, index) => (
                <motion.div
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/84"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 * index }}
                  key={highlight}
                >
                  <BadgeCheckIcon className="h-5 w-5 text-rpg-success" />
                  {highlight}
                </motion.div>
              ))}
            </div>

            <Dice5Icon className="absolute bottom-10 right-10 h-28 w-28 rotate-12 text-white/10" />
            <ScrollTextIcon className="absolute right-28 top-36 h-20 w-20 -rotate-12 text-rpg-gold/20" />
          </motion.aside>

          {/* Painel principal: concentra os campos que alimentam POST /users no backend. */}
          <motion.div
            animate="visible"
            className="bg-rpg-surface px-6 py-8 text-rpg-text sm:px-10 sm:py-12"
            initial="hidden"
            variants={{
              hidden: { opacity: 0, y: 18 },
              visible: { opacity: 1, y: 0 },
            }}
          >
            <div className="mx-auto flex w-full max-w-md flex-col">
              <div className="mb-8">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-rpg-primary text-white shadow-lg shadow-rpg-primary/30">
                  <UserRoundIcon className="h-6 w-6" />
                </div>
                <h2 className="text-3xl font-black tracking-normal">
                  Criar cadastro
                </h2>
                <p className="mt-2 text-justify text-sm leading-6 text-rpg-muted">
                  Informe seus dados iniciais para abrir seu perfil no portal.
                </p>
              </div>

              <Form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                {/* displayName vira o perfil inicial em user_profiles. */}
                <TextField
                  className="flex flex-col gap-2"
                  isRequired
                  name="displayName"
                  validate={(value) => {
                    if (value.trim().length < 2) {
                      return "Use um nome com pelo menos 2 caracteres.";
                    }
                    return null;
                  }}
                >
                  <Label className="text-sm font-semibold text-rpg-text">
                    Nome de jogador
                  </Label>
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Prefix className="text-rpg-primary">
                      <UserRoundIcon className="h-5 w-5" />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      placeholder="Como voce quer aparecer?"
                    />
                  </InputGroup>
                  <FieldError className="text-sm font-medium text-rpg-danger" />
                </TextField>

                {/* email e senha criam o documento em users; o backend salva apenas o hash da senha. */}
                <TextField
                  className="flex flex-col gap-2"
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
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-rpg-primary-soft"
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
                  <InputGroup
                    className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:bg-white focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                    fullWidth
                    variant="secondary"
                  >
                    <InputGroup.Prefix className="text-rpg-primary">
                      <LockKeyholeIcon className="h-5 w-5" />
                    </InputGroup.Prefix>
                    <InputGroup.Input
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                      placeholder="No minimo 8 caracteres"
                    />
                  </InputGroup>
                  <FieldError className="text-sm font-medium text-rpg-danger" />
                </TextField>

                <Button
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-3 font-bold text-white shadow-lg shadow-rpg-primary/25 transition hover:bg-rpg-primary-hover"
                  isDisabled={registerUser.isPending}
                  type="submit"
                >
                  <SparklesIcon className="h-5 w-5" />
                  {registerUser.isPending
                    ? "Criando cadastro..."
                    : "Criar conta"}
                </Button>
              </Form>

              <p className="mt-8 text-center text-sm text-rpg-muted">
                Ja tem conta?{" "}
                <Link
                  className="font-bold text-rpg-primary transition hover:text-rpg-primary-hover"
                  href="/"
                >
                  Entrar agora
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
