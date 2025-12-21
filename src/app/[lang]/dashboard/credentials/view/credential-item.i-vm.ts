// Using Prisma types for UI layer
type Credential = {
  id: string;
  name: string;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default interface CredentialItemIVM {
  credential: Credential;
  onRemove: () => void;
  isRemoving: boolean;
}

