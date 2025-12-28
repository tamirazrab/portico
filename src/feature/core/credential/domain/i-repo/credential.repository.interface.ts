import ApiTask from "@/feature/common/data/api-task";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Credential from "../entity/credential.entity";
import CredentialType from "../enum/credential-type.enum";

export type CreateCredentialParams = {
  name: string;
  value: string; // Plain text, will be encrypted in repository
  type: CredentialType;
  userId: string;
};

export type UpdateCredentialParams = {
  id: string;
  userId: string;
  name: string;
  value: string; // Plain text, will be encrypted in repository
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
  create(params: CreateCredentialParams): ApiTask<Credential>;
  update(params: UpdateCredentialParams): ApiTask<Credential>;
  delete(params: { id: string; userId: string }): ApiTask<true>;
  getOne(params: GetCredentialParams): ApiTask<Credential>;
  getMany(params: GetCredentialsParams): ApiTask<WithPagination<Credential>>;
  getByType(params: GetCredentialsByTypeParams): ApiTask<Credential[]>;
}

export const credentialRepoKey = "credentialRepoKey";
