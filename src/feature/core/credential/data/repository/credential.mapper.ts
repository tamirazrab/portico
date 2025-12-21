import { PrismaClient } from "@/generated/prisma/client";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import Credential from "@/feature/core/credential/domain/entity/credential.entity";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";

type CredentialDbResponse = {
  id: string;
  name: string;
  value: string;
  type: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

export default class CredentialMapper {
  static toEntity(dbCredential: CredentialDbResponse): Credential {
    return new Credential({
      id: dbCredential.id,
      name: dbCredential.name,
      value: dbCredential.value, // Keep encrypted
      type: dbCredential.type as CredentialType,
      userId: dbCredential.userId,
      createdAt: dbCredential.createdAt,
      updatedAt: dbCredential.updatedAt,
    });
  }

  static toPaginatedEntity(
    dbCredentials: CredentialDbResponse[],
    total: number,
  ): WithPagination<Credential> {
    const credentials = dbCredentials.map((cred) => CredentialMapper.toEntity(cred));
    return new WithPagination(credentials, total);
  }
}

