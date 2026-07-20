// Regex simples para validar o formato basico de email antes de enviar o formulario.
export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

// Chave usada apenas para preencher o email quando "Lembrar acesso" estiver marcado.
export const rememberedLoginEmailStorageKey = "portal-rpg:remembered-email";

// Pequena lista visual para mostrar beneficios do portal sem criar componentes extras.
export const loginHighlights = [
  "Campanhas reunidas",
  "Fichas sempre por perto",
  "Mesas prontas para jogar",
];
