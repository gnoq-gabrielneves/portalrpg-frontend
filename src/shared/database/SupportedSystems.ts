export type SupportedSystem = {
  _id: string;
  name: string;
  description?: string;
  // Nicho do RPG, por exemplo: horror, investigacao ou aventura.
  type?: string;
  year?: number;
  version?: string;
  isActive: boolean;
};
