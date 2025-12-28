import Credential from "@/feature/core/credential/domain/entity/credential.entity";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";
import { faker } from "@faker-js/faker";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class CredentialFakeFactory {
  static getFakeCredential(): Credential {
    return new Credential({
      id: faker.string.uuid(),
      name: faker.word.words(2),
      value: faker.string.alphanumeric(32), // Encrypted value
      type: CredentialType.OPENAI,
      userId: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  static getFakeCredentialList(length: number = 10): Credential[] {
    return Array.from({ length }).map(() =>
      CredentialFakeFactory.getFakeCredential(),
    );
  }

  static getFakeCredentialByType(type: CredentialType): Credential {
    return new Credential({
      id: faker.string.uuid(),
      name: faker.word.words(2),
      value: faker.string.alphanumeric(32),
      type,
      userId: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }
}
