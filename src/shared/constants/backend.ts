export const API_ERROR_MESSAGES: Record<number, string> = {
  400: "Verifique os dados enviados.",
  401: "Voce precisa estar logado.",
  403: "Voce nao tem permissao para fazer isso.",
  404: "Recurso nao encontrado.",
  409: "Esse registro ja existe.",
  500: "Erro interno no servidor.",
  503: "Servidor temporariamente indisponivel.",
};

export const API_FIELD_LABELS: Record<string, string> = {
  displayName: "nome de jogador",
  email: "email",
  description: "descricao",
  name: "nome",
  password: "senha",
  refreshToken: "sessao",
  system: "sistema",
  supportedSystemId: "sistema",
  theme: "tema",
};

export const API_VALIDATION_MESSAGE_PATTERNS: Array<{
  pattern: RegExp;
  getMessage: (fieldLabel: string, match: RegExpMatchArray) => string;
}> = [
  {
    pattern: /^property (\w+) should not exist$/,
    getMessage: (fieldLabel) => `O campo ${fieldLabel} nao deveria ser enviado.`,
  },
  {
    pattern: /^(\w+) should not be empty$/,
    getMessage: (fieldLabel) => `Preencha o campo ${fieldLabel}.`,
  },
  {
    pattern: /^(\w+) must be an email$/,
    getMessage: () => "Informe um email valido.",
  },
  {
    pattern: /^(\w+) must be a mongodb id$/,
    getMessage: (fieldLabel) => `Selecione um ${fieldLabel} valido.`,
  },
  {
    pattern: /^(\w+) must be a string$/,
    getMessage: (fieldLabel) => `O campo ${fieldLabel} deve ser texto.`,
  },
  {
    pattern: /^(\w+) must be a boolean value$/,
    getMessage: (fieldLabel) => `O campo ${fieldLabel} deve ser verdadeiro ou falso.`,
  },
  {
    pattern: /^(\w+) must be an integer number$/,
    getMessage: (fieldLabel) => `O campo ${fieldLabel} deve ser um numero inteiro.`,
  },
  {
    pattern: /^(\w+) must not be less than (\d+)$/,
    getMessage: (fieldLabel, match) =>
      `O campo ${fieldLabel} deve ser no minimo ${match[2]}.`,
  },
  {
    pattern: /^(\w+) must be longer than or equal to (\d+) characters$/,
    getMessage: (fieldLabel, match) =>
      `O campo ${fieldLabel} deve ter no minimo ${match[2]} caracteres.`,
  },
  {
    pattern: /^(\w+) must be shorter than or equal to (\d+) characters$/,
    getMessage: (fieldLabel, match) =>
      `O campo ${fieldLabel} deve ter no maximo ${match[2]} caracteres.`,
  },
];

export const API_DATABASE_ERROR_MESSAGES: Record<string, string> = {
  "Bad Request": "Verifique os dados enviados.",
  Conflict: "Ja existe um cadastro com estes dados.",
  Forbidden: "Voce nao tem permissao para acessar este recurso.",
  "Internal Server Error": "Erro interno no servidor.",
  "Not Found": "Recurso nao encontrado.",
  Unauthorized: "Voce precisa entrar novamente.",
  "Dados invalidos para salvar no MongoDB.":
    "Os dados enviados nao puderam ser salvos.",
  "Ja existe um registro com estes dados.":
    "Ja existe um cadastro com estes dados.",
  "Sistema de RPG invalido.": "Selecione um sistema de RPG cadastrado.",
  "Valor invalido para o tipo esperado.":
    "Um dos dados enviados esta em formato invalido.",
};
