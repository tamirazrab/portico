import { describe, it, expect } from "vitest";
import { faker } from "@faker-js/faker";
import CredentialMapper from "@/feature/core/credential/data/repository/credential.mapper";
import Credential from "@/feature/core/credential/domain/entity/credential.entity";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";
import WithPagination from "@/feature/common/class-helpers/with-pagination";

describe("CredentialMapper", () => {
  describe("toEntity", () => {
    it("Should map database response to Credential entity", () => {
      // Arrange
      const dbCredential = {
        id: faker.string.uuid(),
        name: faker.word.words(2),
        value: faker.string.alphanumeric(32), // Encrypted value
        type: CredentialType.OPENAI,
        userId: faker.string.uuid(),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      };

      // Act
      const result = CredentialMapper.toEntity(dbCredential);

      // Assert
      expect(result).toBeInstanceOf(Credential);
      expect(result.id).toBe(dbCredential.id);
      expect(result.name).toBe(dbCredential.name);
      expect(result.value).toBe(dbCredential.value);
      expect(result.type).toBe(dbCredential.type);
      expect(result.userId).toBe(dbCredential.userId);
    });
  });

  describe("toPaginatedEntity", () => {
    it("Should map database credentials to paginated entity", () => {
      // Arrange
      const dbCredentials = [
        {
          id: faker.string.uuid(),
          name: faker.word.words(2),
          value: faker.string.alphanumeric(32),
          type: CredentialType.OPENAI,
          userId: faker.string.uuid(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
        {
          id: faker.string.uuid(),
          name: faker.word.words(2),
          value: faker.string.alphanumeric(32),
          type: CredentialType.ANTHROPIC,
          userId: faker.string.uuid(),
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        },
      ];
      const total = 5;

      // Act
      const result = CredentialMapper.toPaginatedEntity(dbCredentials, total);

      // Assert
      expect(result).toBeInstanceOf(WithPagination);
      expect(result.items).toHaveLength(2);
      expect(result.total).toBe(total);
      expect(result.items[0]).toBeInstanceOf(Credential);
    });
  });
});

