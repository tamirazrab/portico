import CredentialType from "../enum/credential-type.enum";

export type CredentialParams = Omit<Credential, "toPlainObject">;

export default class Credential {
  readonly id: string;
  readonly name: string;
  readonly value: string; // Encrypted value
  readonly type: CredentialType;
  readonly userId: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(params: CredentialParams) {
    this.id = params.id;
    this.name = params.name;
    this.value = params.value;
    this.type = params.type;
    this.userId = params.userId;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
  }

  toPlainObject(): CredentialParams {
    return {
      id: this.id,
      name: this.name,
      value: this.value,
      type: this.type,
      userId: this.userId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

