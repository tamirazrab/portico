/**
 * Shared types for credentials feature.
 * These types represent the UI layer's view of credential data.
 */

export type Credential = {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CredentialsData = {
  items: Credential[];
  page: number;
  totalPages: number;
};

