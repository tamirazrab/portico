// Using Prisma types for UI layer
type Credential = {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default interface CredentialsListIVM {
  credentials: Credential[];
  isLoading: boolean;
  isEmpty: boolean;
  totalPages: number;
  currentPage: number;
}

