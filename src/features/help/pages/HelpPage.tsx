"use client";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { useSupportedSystems } from "@/shared/hooks/useSupportedSystems";
import { Card } from "@heroui/react";
import { BookOpenTextIcon } from "lucide-react";
import { motion } from "motion/react";
import { SupportedSystemItem } from "../components/SupportedSystemItem";
import { SupportedSystemsSkeleton } from "../components/SupportedSystemsSkeleton";

export function HelpPage() {
  const { data: supportedSystems, error, isLoading } = useSupportedSystems();

  return (
    <motion.div
      animate="visible"
      className="grid w-full gap-6 2xl:gap-8"
      initial="hidden"
      // staggerChildren faz cada bloco entrar em sequencia, deixando a tela menos brusca.
      transition={{ staggerChildren: 0.08 }}
    >
      {/* Cabecalho da pagina: identifica a area atual sem adicionar texto final de conteudo. */}
      <motion.header
        className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm 2xl:p-8"
        variants={fadeInUp}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
            <BookOpenTextIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
              Ajuda
            </p>
            <h1 className="text-3xl font-black tracking-normal text-rpg-text">
              Central de ajuda
            </h1>
          </div>
        </div>
      </motion.header>

      {/* Grid principal: conteudo editavel a esquerda e sistemas suportados a direita. */}
      <div className="grid gap-6 2xl:gap-8 xl:grid-cols-[minmax(0,1fr)_30rem]">
        <motion.section className="grid gap-6" variants={fadeInUp}>
          {/* Card reservado para a explicacao sobre RPG. */}
          <Card className="min-h-64 border border-rpg-border bg-rpg-surface shadow-sm">
            <Card.Header className="border-b border-rpg-border px-6 py-5">
              <Card.Title className="text-xl font-black text-rpg-text">
                O que é RPG?
              </Card.Title>
            </Card.Header>
            <Card.Content className="grid gap-4 p-6 2xl:p-8">
              <p>
                RPG é a sigla em inglês para{" "}
                <span className="italic text-amber-400">roleplaying game</span>,
                ou jogo de interpretação. Surgiu nos Estados Unidos, nos anos
                1970, e desde então se espalhou pelo mundo. Hoje, o RPG está em
                todos os lugares, em todas as mídias — videogames, séries de TV
                e streams
              </p>
            </Card.Content>
          </Card>

          {/* Card reservado para descrever o fluxo de uso do app. */}
          <Card className="min-h-80 border border-rpg-border bg-rpg-surface shadow-sm">
            <Card.Header className="border-b border-rpg-border px-6 py-5">
              <Card.Title className="text-xl font-black text-rpg-text">
                Como funciona?
              </Card.Title>
            </Card.Header>
            <Card.Content className="grid gap-4 p-6 sm:grid-cols-3 2xl:p-8">
              {[1, 2, 3].map((item) => (
                <div
                  className="min-h-44 rounded-2xl border border-rpg-border bg-rpg-surface-muted p-4 2xl:min-h-56"
                  key={item}
                />
              ))}
            </Card.Content>
          </Card>
        </motion.section>

        {/* Lista lateral carregada pela API; fica fixa no desktop para aproveitar telas grandes. */}
        <motion.aside variants={fadeInUp}>
          <Card className="border border-rpg-border bg-rpg-surface shadow-sm xl:sticky xl:top-6">
            <Card.Header className="border-b border-rpg-border px-6 py-5">
              <div>
                <Card.Title className="text-xl font-black text-rpg-text">
                  Sistemas suportados
                </Card.Title>
                <Card.Description className="mt-1 text-sm text-rpg-muted">
                  Lista de sistemas de RPG que nosso aplicativo suporta até o
                  momento.
                </Card.Description>
              </div>
            </Card.Header>

            <Card.Content className="p-5">
              {/* Estado de carregamento enquanto a API ainda nao respondeu. */}
              {isLoading && <SupportedSystemsSkeleton />}

              {/* Estado de erro caso a busca de sistemas falhe. */}
              {error && (
                <div className="rounded-2xl border border-rpg-danger/20 bg-rpg-danger/5 p-4 text-sm font-semibold text-rpg-danger">
                  Não foi possível carregar os sistemas.
                </div>
              )}

              {/* Estado de sucesso: cada sistema vira um item de lista visual. */}
              {!isLoading && !error && (
                <div className="grid gap-4">
                  {supportedSystems?.map((system) => (
                    <SupportedSystemItem key={system._id} system={system} />
                  ))}
                </div>
              )}
            </Card.Content>
          </Card>
        </motion.aside>
      </div>
    </motion.div>
  );
}
