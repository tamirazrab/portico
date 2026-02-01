import { ApiEither } from "@/feature/common/data/api-task";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Credential from "../entity/credential.entity";
import CredentialType from "../enum/credential-type.enum";

export type CreateCredentialParams = {
  name: string;
  value: string; 
  type: CredentialType;
  userId: string;
};

export type UpdateCredentialParams = {
  id: string;
  userId: string;
  name: string;
  value: string; 
  type: CredentialType;
};

export type GetCredentialsParams = {
  userId: string;
  page?: number;
  pageSize?: number;
  search?: string;
};

export type GetCredentialParams = {
  id: string;
  userId: string;
};

export type GetCredentialsByTypeParams = {
  userId: string;
  type: CredentialType;
};

export default interface CredentialRepository {
  create(params: CreateCredentialParams): Promise<ApiEither<Credential>>;
  update(params: UpdateCredentialParams): Promise<ApiEither<Credential>>;
  delete(params: { id: string; userId: string }): Promise<ApiEither<true>>;
  getOne(params: GetCredentialParams): Promise<ApiEither<Credential>>;
  getMany(params: GetCredentialsParams): Promise<ApiEither<WithPagination<Credential>>>;
  getByType(params: GetCredentialsByTypeParams): Promise<ApiEither<Credential[]>>;
}

export const credentialRepoKey = "credentialRepoKey";
