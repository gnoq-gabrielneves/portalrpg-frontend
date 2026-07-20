"use client";

import {
  CameraIcon,
  CheckIcon,
  Edit3Icon,
  ExternalLinkIcon,
  GlobeIcon,
  LinkIcon,
  PlusIcon,
  SaveIcon,
  Trash2Icon,
  UserRoundIcon,
  XIcon,
} from "lucide-react";
import { motion } from "motion/react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { AuthProfileSocialLink, AuthUser } from "@/features/auth/types/auth";
import { useSupportedSystems } from "@/shared/hooks/useSupportedSystems";
import { useToast } from "@/shared/hooks/useToast";
import { ApiClientError } from "@/shared/services/apiClient";
import {
  toAbsoluteApiAssetUrl,
  updateMyProfile,
} from "../services/profileService";

const emptySocialLink: AuthProfileSocialLink = {
  label: "",
  url: "",
};

export function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <motion.section
      animate={{ opacity: 1, y: 0 }}
      className="grid w-full gap-6"
      initial={{ opacity: 0, y: 16 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
    >
      {isEditing ? (
        <ProfileForm
          key={`edit-${user.id}-${user.profile?.avatarUrl ?? ""}`}
          onCancel={() => setIsEditing(false)}
          onSaved={() => setIsEditing(false)}
          user={user}
        />
      ) : (
        <ProfileView onEdit={() => setIsEditing(true)} user={user} />
      )}
    </motion.section>
  );
}

function ProfileView({
  onEdit,
  user,
}: Readonly<{ onEdit: () => void; user: AuthUser }>) {
  const profile = user.profile;
  const avatarUrl = toAbsoluteApiAssetUrl(profile?.avatarUrl);
  const preferredSystems = profile?.preferredSystems?.length
    ? profile.preferredSystems
    : profile?.favoriteSystem
      ? [profile.favoriteSystem]
      : [];
  const socialLinks = profile?.socialLinks ?? [];
  const isOnline = user.status === "active";

  return (
    <article className="grid w-full gap-6 rounded-lg border border-rpg-border bg-rpg-surface p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-lg border border-rpg-border bg-rpg-primary-soft text-rpg-primary shadow-sm">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                alt="Foto de perfil"
                className="h-full w-full object-cover"
                src={avatarUrl}
              />
            ) : (
              <UserRoundIcon className="h-11 w-11" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="break-words text-3xl font-black tracking-normal text-rpg-text">
                {profile?.displayName ?? "Jogador"}
              </h1>
              <span className="inline-flex items-center gap-2 rounded-lg border border-rpg-border bg-rpg-surface-muted px-3 py-1.5 text-xs font-black uppercase tracking-[0.12em] text-rpg-muted">
                <span
                  className={`size-2 rounded-full ${
                    isOnline ? "bg-emerald-500" : "bg-slate-400"
                  }`}
                />
                {isOnline ? "Online" : "Offline"}
              </span>
            </div>
            <p className="mt-2 break-all text-sm font-semibold text-rpg-muted">
              {user.email}
            </p>
          </div>
        </div>

        <button
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-rpg-primary px-4 py-2 text-sm font-black text-rpg-primary transition hover:bg-rpg-primary-soft"
          onClick={onEdit}
          type="button"
        >
          <Edit3Icon className="h-4 w-4" />
          Editar
        </button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <section className="rounded-lg border border-rpg-border bg-rpg-surface-muted p-4">
          <h2 className="text-xs font-black uppercase tracking-[0.14em] text-rpg-muted">
            Biografia
          </h2>
          <p className="mt-3 min-h-20 whitespace-pre-wrap text-sm font-semibold leading-6 text-rpg-text">
            {profile?.bio?.trim() || "Nenhuma biografia adicionada."}
          </p>
        </section>

        <div className="grid gap-5">
          <section className="rounded-lg border border-rpg-border bg-rpg-surface-muted p-4">
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-4 w-4 text-rpg-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.14em] text-rpg-muted">
                Sistemas preferidos
              </h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {preferredSystems.length ? (
                preferredSystems.map((systemName) => (
                  <span
                    className="rounded-lg border border-rpg-primary/25 bg-white px-3 py-2 text-sm font-black text-rpg-primary"
                    key={systemName}
                  >
                    {systemName}
                  </span>
                ))
              ) : (
                <p className="text-sm font-semibold text-rpg-muted">
                  Nenhum sistema preferido adicionado.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-lg border border-rpg-border bg-rpg-surface-muted p-4">
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-rpg-primary" />
              <h2 className="text-xs font-black uppercase tracking-[0.14em] text-rpg-muted">
                Redes sociais
              </h2>
            </div>
            <div className="mt-3 grid gap-2">
              {socialLinks.length ? (
                socialLinks.map((socialLink) => (
                  <a
                    className="flex items-center justify-between gap-3 rounded-lg border border-rpg-border bg-white px-3 py-2 text-sm font-black text-rpg-text transition hover:border-rpg-primary hover:text-rpg-primary"
                    href={socialLink.url}
                    key={`${socialLink.label}-${socialLink.url}`}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <span className="truncate">{socialLink.label}</span>
                    <ExternalLinkIcon className="h-4 w-4 shrink-0" />
                  </a>
                ))
              ) : (
                <p className="text-sm font-semibold text-rpg-muted">
                  Nenhuma rede social adicionada.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </article>
  );
}

function ProfileForm({
  onCancel,
  onSaved,
  user,
}: Readonly<{ onCancel: () => void; onSaved: () => void; user: AuthUser }>) {
  const { accessToken, updateSessionUser } = useAuth();
  const { data: supportedSystems = [] } = useSupportedSystems();
  const { showToast } = useToast();
  const profile = user.profile;
  const fallbackPreferredSystems = profile?.favoriteSystem
    ? [profile.favoriteSystem]
    : [];
  const profilePreferredSystems =
    profile?.preferredSystems?.length
      ? profile.preferredSystems
      : fallbackPreferredSystems;
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [preferredSystems, setPreferredSystems] = useState<string[]>(
    profilePreferredSystems,
  );
  const [socialLinks, setSocialLinks] = useState<AuthProfileSocialLink[]>(
    profile?.socialLinks?.length ? profile.socialLinks : [emptySocialLink],
  );
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const avatarPreviewUrl = useMemo(() => {
    if (!avatarFile) {
      return "";
    }

    return URL.createObjectURL(avatarFile);
  }, [avatarFile]);

  const avatarUrl = useMemo(() => {
    if (avatarPreviewUrl) {
      return avatarPreviewUrl;
    }

    return toAbsoluteApiAssetUrl(profile?.avatarUrl);
  }, [avatarPreviewUrl, profile?.avatarUrl]);

  const isOnline = user?.status === "active";

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  function handlePreferredSystemToggle(systemName: string) {
    setPreferredSystems((currentSystems) =>
      currentSystems.includes(systemName)
        ? currentSystems.filter((currentSystem) => currentSystem !== systemName)
        : [...currentSystems, systemName],
    );
  }

  function handleSocialLinkChange(
    index: number,
    field: keyof AuthProfileSocialLink,
    value: string,
  ) {
    setSocialLinks((currentLinks) =>
      currentLinks.map((currentLink, currentIndex) =>
        currentIndex === index
          ? { ...currentLink, [field]: value }
          : currentLink,
      ),
    );
  }

  function handleAddSocialLink() {
    setSocialLinks((currentLinks) => [...currentLinks, emptySocialLink]);
  }

  function handleRemoveSocialLink(index: number) {
    setSocialLinks((currentLinks) => {
      const nextLinks = currentLinks.filter(
        (_, currentIndex) => currentIndex !== index,
      );

      return nextLinks.length ? nextLinks : [emptySocialLink];
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!accessToken) {
      showToast({
        title: "Sessao indisponivel",
        description: "Entre novamente para editar o perfil.",
        type: "warning",
      });
      return;
    }

    const trimmedDisplayName = displayName.trim();

    if (!trimmedDisplayName) {
      showToast({
        title: "Nome obrigatorio",
        description: "Informe como voce quer aparecer no portal.",
        type: "warning",
      });
      return;
    }

    setIsSaving(true);

    try {
      const updatedUser = await updateMyProfile(accessToken, {
        avatar: avatarFile,
        bio,
        displayName: trimmedDisplayName,
        preferredSystems,
        socialLinks: socialLinks
          .map((socialLink) => ({
            label: socialLink.label.trim(),
            url: socialLink.url.trim(),
          }))
          .filter((socialLink) => socialLink.label && socialLink.url),
      });

      updateSessionUser(updatedUser);
      setAvatarFile(null);
      setDisplayName(updatedUser.profile?.displayName ?? "");
      setBio(updatedUser.profile?.bio ?? "");
      setPreferredSystems(updatedUser.profile?.preferredSystems ?? []);
      setSocialLinks(
        updatedUser.profile?.socialLinks?.length
          ? updatedUser.profile.socialLinks
          : [emptySocialLink],
      );
      onSaved();
      showToast({
        title: "Perfil atualizado",
        description: "Suas informacoes foram salvas.",
        type: "success",
      });
    } catch (error) {
      const description =
        error instanceof ApiClientError
          ? getApiErrorDescription(error)
          : "Revise os dados e tente novamente.";

      showToast({
        title: "Nao foi possivel salvar",
        description,
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form
      className="grid w-full gap-6 rounded-lg border border-rpg-border bg-rpg-surface p-5 shadow-sm sm:p-6"
      onSubmit={(event) => void handleSubmit(event)}
    >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <label
              className="group relative grid size-24 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-lg border border-rpg-border bg-rpg-primary-soft text-rpg-primary shadow-sm transition hover:border-rpg-primary"
              htmlFor="profile-avatar"
            >
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Foto de perfil"
                  className="h-full w-full object-cover"
                  src={avatarUrl}
                />
              ) : (
                <UserRoundIcon className="h-10 w-10" />
              )}
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-rpg-night/75 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-white opacity-0 transition group-hover:opacity-100">
                <CameraIcon className="h-3.5 w-3.5" />
                Foto
              </span>
              <input
                accept="image/*"
                className="sr-only"
                id="profile-avatar"
                onChange={(event) =>
                  setAvatarFile(event.target.files?.[0] ?? null)
                }
                type="file"
              />
            </label>

            <div className="min-w-0 flex-1">
              <label
                className="text-xs font-black uppercase tracking-[0.14em] text-rpg-muted"
                htmlFor="profile-display-name"
              >
                Nome
              </label>
              <input
                className="mt-2 w-full rounded-lg border border-rpg-border bg-rpg-surface-muted px-4 py-3 text-xl font-black tracking-normal text-rpg-text outline-none transition focus:border-rpg-primary focus:bg-white focus:ring-2 focus:ring-rpg-primary/15"
                id="profile-display-name"
                maxLength={80}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Seu nome no portal"
                value={displayName}
              />
              <p className="mt-2 truncate text-sm font-semibold text-rpg-muted">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-rpg-border bg-rpg-surface-muted px-4 py-3">
            <span
              className={`size-2.5 rounded-full ${
                isOnline ? "bg-emerald-500" : "bg-slate-400"
              }`}
            />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-rpg-muted">
                Status
              </p>
              <p className="text-sm font-black text-rpg-text">
                {isOnline ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
          <section className="grid gap-5">
            <div>
              <label
                className="text-xs font-black uppercase tracking-[0.14em] text-rpg-muted"
                htmlFor="profile-bio"
              >
                Biografia
              </label>
              <textarea
                className="mt-2 min-h-36 w-full resize-y rounded-lg border border-rpg-border bg-rpg-surface-muted px-4 py-3 text-sm font-semibold leading-6 text-rpg-text outline-none transition focus:border-rpg-primary focus:bg-white focus:ring-2 focus:ring-rpg-primary/15"
                id="profile-bio"
                maxLength={500}
                onChange={(event) => setBio(event.target.value)}
                placeholder="Conte um pouco sobre voce, suas campanhas e seu estilo de jogo."
                value={bio}
              />
              <p className="mt-2 text-right text-xs font-bold text-rpg-muted">
                {bio.length}/500
              </p>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <GlobeIcon className="h-4 w-4 text-rpg-primary" />
                <h2 className="text-sm font-black uppercase tracking-[0.14em] text-rpg-muted">
                  Sistemas preferidos
                </h2>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {supportedSystems.map((system) => {
                  const isSelected = preferredSystems.includes(system.name);

                  return (
                    <button
                      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-black transition ${
                        isSelected
                          ? "border-rpg-primary bg-rpg-primary text-white shadow-sm shadow-rpg-primary/20"
                          : "border-rpg-border bg-rpg-surface-muted text-rpg-muted hover:border-rpg-primary hover:text-rpg-primary"
                      }`}
                      key={system._id}
                      onClick={() => handlePreferredSystemToggle(system.name)}
                      type="button"
                    >
                      {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
                      {system.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-rpg-border bg-rpg-surface-muted p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-rpg-primary" />
                <h2 className="text-sm font-black uppercase tracking-[0.14em] text-rpg-muted">
                  Redes sociais
                </h2>
              </div>
              <button
                aria-label="Adicionar rede social"
                className="grid size-8 place-items-center rounded-lg border border-rpg-border bg-white text-rpg-primary transition hover:border-rpg-primary hover:bg-rpg-primary-soft"
                onClick={handleAddSocialLink}
                type="button"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              {socialLinks.map((socialLink, index) => (
                <div className="grid gap-2" key={`${index}-${socialLink.label}`}>
                  <div className="flex gap-2">
                    <input
                      className="min-w-0 flex-1 rounded-lg border border-rpg-border bg-white px-3 py-2 text-sm font-bold text-rpg-text outline-none transition focus:border-rpg-primary focus:ring-2 focus:ring-rpg-primary/15"
                      maxLength={40}
                      onChange={(event) =>
                        handleSocialLinkChange(
                          index,
                          "label",
                          event.target.value,
                        )
                      }
                      placeholder="Nome"
                      value={socialLink.label}
                    />
                    <button
                      aria-label="Remover rede social"
                      className="grid size-10 shrink-0 place-items-center rounded-lg border border-rpg-border bg-white text-rpg-muted transition hover:border-rpg-danger hover:text-rpg-danger"
                      onClick={() => handleRemoveSocialLink(index)}
                      type="button"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </button>
                  </div>
                  <input
                    className="w-full rounded-lg border border-rpg-border bg-white px-3 py-2 text-sm font-semibold text-rpg-text outline-none transition focus:border-rpg-primary focus:ring-2 focus:ring-rpg-primary/15"
                    maxLength={300}
                    onChange={(event) =>
                      handleSocialLinkChange(index, "url", event.target.value)
                    }
                    placeholder="https://"
                    value={socialLink.url}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-rpg-border pt-5 sm:flex-row">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-rpg-border px-5 py-3 text-sm font-black text-rpg-muted transition hover:border-rpg-primary hover:bg-rpg-primary-soft hover:text-rpg-primary"
            disabled={isSaving}
            onClick={onCancel}
            type="button"
          >
            <XIcon className="h-4 w-4" />
            Cancelar
          </button>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-rpg-primary px-5 py-3 text-sm font-black text-white shadow-lg shadow-rpg-primary/20 transition hover:bg-rpg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving}
            type="submit"
          >
            <SaveIcon className="h-4 w-4" />
            {isSaving ? "Salvando..." : "Salvar alteracoes"}
          </button>
        </div>
    </form>
  );
}

function getApiErrorDescription(error: ApiClientError) {
  const { message } = error.response;

  return Array.isArray(message)
    ? message[0] || "Revise os dados e tente novamente."
    : message;
}
