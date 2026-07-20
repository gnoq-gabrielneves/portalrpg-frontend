"use client";
import { Button } from "@heroui/react";
import { ArrowLeftIcon, HomeIcon, SearchXIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-rpg-surface-muted px-6 py-10 text-rpg-text">
      {/* Fundo claro padrao do app, usando a mesma identidade visual do tema. */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,var(--rpg-primary-soft)_0,transparent_32%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.16)_0,transparent_28%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.04)_1px,transparent_1px)] bg-size-[48px_48px]" />

      {/* Conteudo central da pagina 404. */}
      <section className="relative z-10 m-auto grid w-full max-w-5xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative hidden min-h-96 place-items-center overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface shadow-2xl shadow-rpg-primary/10 lg:grid">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,58,237,0.2),transparent_30%),radial-gradient(circle_at_75%_75%,rgba(249,115,22,0.18),transparent_32%)]" />
          <span className="relative text-[10rem] font-black leading-none text-rpg-primary drop-shadow-sm">
            404
          </span>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-rpg-border bg-rpg-surface px-4 py-2 text-sm font-semibold text-rpg-muted shadow-sm">
            <SearchXIcon className="h-4 w-4 text-rpg-primary" />
            Pagina nao encontrada
          </div>

          <h1 className="text-5xl font-black tracking-normal text-rpg-text sm:text-6xl">
            A rota sumiu do mapa.
          </h1>
          <p className="mt-5 text-justify text-base leading-7 text-rpg-muted">
            Esse caminho nao existe ou foi movido. Voce pode voltar para onde
            estava ou ir para a area inicial do portal.
          </p>

          {/* Acoes principais: voltar usa o historico do navegador; home leva direto para /home. */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="flex items-center justify-center gap-2 rounded-2xl border border-rpg-border bg-rpg-surface px-5 py-3 font-bold text-rpg-text shadow-sm transition hover:border-rpg-primary hover:text-rpg-primary"
              onPress={() => router.back()}
              type="button"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Voltar
            </Button>

            <Link
              className="flex items-center justify-center gap-2 rounded-2xl bg-rpg-primary px-5 py-3 font-bold text-white shadow-lg shadow-rpg-primary/25 transition hover:bg-rpg-primary-hover"
              href="/home"
            >
              <HomeIcon className="h-5 w-5" />
              Ir para Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
