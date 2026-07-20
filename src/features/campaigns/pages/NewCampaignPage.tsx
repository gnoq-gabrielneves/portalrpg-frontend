"use client";

import {
  Button,
  FieldError,
  Form,
  InputGroup,
  Label,
  ListBox,
  Select,
  TextField,
} from "@heroui/react";
import { fadeInUp } from "@/shared/animations/fadeInUp";
import { useSupportedSystems } from "@/shared/hooks/useSupportedSystems";
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ChevronDownIcon,
  PlusIcon,
  SparklesIcon,
  SwordsIcon,
} from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCreateCampaign } from "../hooks/useCreateCampaign";

export function NewCampaignPage() {
  const router = useRouter();
  const createCampaign = useCreateCampaign();
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [systemError, setSystemError] = useState("");
  const { data: supportedSystems = [], isLoading: isLoadingSystems } =
    useSupportedSystems();
  const activeSupportedSystems = supportedSystems.filter(
    (system) => system.isActive,
  );
  const hasActiveSupportedSystems = activeSupportedSystems.length > 0;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const theme = String(formData.get("theme") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();

    if (!selectedSystemId) {
      setSystemError("Selecione um sistema cadastrado no aplicativo.");
      return;
    }

    createCampaign.mutate(
      {
        description: description || undefined,
        name,
        supportedSystemId: selectedSystemId,
        theme: theme || undefined,
      },
      {
        onSuccess: (campaign) => {
          router.push(`/campaigns/${campaign._id}`);
        },
      },
    );
  }

  return (
    <motion.section
      animate="visible"
      className="grid w-full gap-6 2xl:gap-8"
      initial="hidden"
      transition={{ staggerChildren: 0.08 }}
    >
      <motion.header
        className="rounded-3xl border border-rpg-border bg-rpg-surface p-6 shadow-sm 2xl:p-8"
        variants={fadeInUp}
      >
        <Link
          className="mb-5 inline-flex w-fit items-center gap-2 text-sm font-bold text-rpg-muted transition hover:text-rpg-primary"
          href="/campaigns"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Voltar para campanhas
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/20">
            <PlusIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-rpg-muted">
              Nova campanha
            </p>
            <h1 className="text-3xl font-black tracking-normal text-rpg-text">
              Dados iniciais
            </h1>
          </div>
        </div>
      </motion.header>

      <motion.div
        className="grid min-h-[34rem] overflow-hidden rounded-3xl border border-rpg-border bg-rpg-surface shadow-sm xl:grid-cols-[minmax(24rem,0.85fr)_minmax(0,1.15fr)] 2xl:min-h-[40rem]"
        variants={fadeInUp}
      >
        {/* Lateral ajuda o mestre a tomar decisoes rapidas sem parecer onboarding pesado. */}
        <aside className="hidden bg-rpg-night p-8 text-white xl:block 2xl:p-10">
          <div className="grid size-12 place-items-center rounded-2xl bg-rpg-primary text-white shadow-lg shadow-rpg-primary/25">
            <SwordsIcon className="h-6 w-6" />
          </div>
          <h1 className="mt-8 max-w-xl text-4xl font-black leading-tight tracking-normal 2xl:text-5xl">
            Crie o ponto de encontro da sua mesa.
          </h1>
          <p className="mt-4 max-w-2xl text-justify text-sm leading-6 text-white/72 2xl:text-base 2xl:leading-7">
            Este hub vai receber personagens, sessoes, notas, jogadores e o
            material que depois vira mesa de jogo.
          </p>

          <div className="mt-10 grid gap-3 2xl:grid-cols-2">
            {isLoadingSystems ? (
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/72">
                Carregando sistemas...
              </div>
            ) : null}

            {!isLoadingSystems && activeSupportedSystems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/72">
                Nenhum sistema ativo cadastrado.
              </div>
            ) : null}

            {activeSupportedSystems.map((system) => (
              <div
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white/84"
                key={system._id}
              >
                <BookOpenIcon className="h-4 w-4 text-rpg-success" />
                {system.name}
              </div>
            ))}
          </div>
        </aside>

        <div className="p-6 sm:p-8 2xl:p-10">
          <Form className="grid max-w-4xl gap-5 2xl:max-w-5xl" onSubmit={handleSubmit}>
            <TextField
              className="flex flex-col gap-2"
              isRequired
              name="name"
              validate={(value) => {
                if (value.trim().length < 3) {
                  return "Use um nome com pelo menos 3 caracteres.";
                }
                return null;
              }}
            >
              <Label className="text-sm font-semibold text-rpg-text">
                Nome da campanha
              </Label>
              <InputGroup
                className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                fullWidth
                variant="secondary"
              >
                <InputGroup.Input
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                  placeholder="Ex: Ecos de Eldoria"
                />
              </InputGroup>
              <FieldError className="text-sm font-medium text-rpg-danger" />
            </TextField>

            <div className="grid gap-5 sm:grid-cols-2">
              <Select
                className="flex flex-col gap-2"
                isDisabled={isLoadingSystems || !hasActiveSupportedSystems}
                isRequired
                onSelectionChange={(key) => {
                  setSelectedSystemId(String(key));
                  setSystemError("");
                }}
                selectedKey={selectedSystemId}
              >
                <Label className="text-sm font-semibold text-rpg-text">
                  Sistema
                </Label>
                <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-lg border border-rpg-border bg-white px-4 text-left text-sm font-semibold text-rpg-text shadow-sm outline-none transition focus:border-rpg-primary focus:ring-4 focus:ring-rpg-primary-soft disabled:cursor-not-allowed disabled:bg-rpg-surface-muted disabled:text-rpg-muted">
                  <Select.Value className="truncate text-sm font-semibold text-rpg-text">
                    {selectedSystemId
                      ? activeSupportedSystems.find(
                          (system) => system._id === selectedSystemId,
                        )?.name
                      : isLoadingSystems
                        ? "Carregando sistemas..."
                        : "Selecione um sistema"}
                  </Select.Value>
                  <Select.Indicator className="text-rpg-muted">
                    <ChevronDownIcon className="h-4 w-4" />
                  </Select.Indicator>
                </Select.Trigger>
                <Select.Popover className="min-w-(--trigger-width) overflow-hidden rounded-2xl border border-rpg-border bg-rpg-surface p-1 shadow-xl">
                  <ListBox className="grid max-h-64 gap-1 overflow-auto">
                    {activeSupportedSystems.map((system) => (
                      <ListBox.Item
                        className="cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold text-rpg-text outline-none transition hover:bg-rpg-primary-soft hover:text-rpg-primary selected:bg-rpg-primary selected:text-white"
                        id={system._id}
                        key={system._id}
                      >
                        {system.name}
                      </ListBox.Item>
                    ))}
                  </ListBox>
                </Select.Popover>
                {!isLoadingSystems && !hasActiveSupportedSystems ? (
                  <p className="text-sm font-medium text-rpg-danger">
                    Cadastre um sistema ativo antes de criar campanhas.
                  </p>
                ) : null}
                {systemError ? (
                  <p className="text-sm font-medium text-rpg-danger">
                    {systemError}
                  </p>
                ) : null}
              </Select>

              <TextField className="flex flex-col gap-2" name="theme">
                <Label className="text-sm font-semibold text-rpg-text">
                  Tema
                </Label>
                <InputGroup
                  className="rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                  fullWidth
                  variant="secondary"
                >
                  <InputGroup.Input
                    className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                    placeholder="Fantasia heroica"
                  />
                </InputGroup>
              </TextField>
            </div>

            <TextField className="flex flex-col gap-2" name="description">
              <Label className="text-sm font-semibold text-rpg-text">
                Descricao
              </Label>
              <InputGroup
                className="min-h-28 rounded-lg border border-rpg-border bg-white shadow-sm transition focus-within:border-rpg-primary focus-within:ring-4 focus-within:ring-rpg-primary-soft"
                fullWidth
                variant="secondary"
              >
                <InputGroup.TextArea
                  className="min-h-24 min-w-0 flex-1 resize-none bg-transparent text-sm font-semibold text-rpg-text outline-none placeholder:font-medium placeholder:text-slate-400"
                  placeholder="Qual e a premissa da campanha?"
                />
              </InputGroup>
            </TextField>

            <Button
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-3 font-bold text-white shadow-lg shadow-rpg-primary/25 transition hover:bg-rpg-primary-hover"
              isDisabled={
                createCampaign.isPending ||
                isLoadingSystems ||
                !hasActiveSupportedSystems
              }
              type="submit"
            >
              <SparklesIcon className="h-5 w-5" />
              {createCampaign.isPending ? "Criando..." : "Criar campanha"}
            </Button>
          </Form>
        </div>
      </motion.div>
    </motion.section>
  );
}
