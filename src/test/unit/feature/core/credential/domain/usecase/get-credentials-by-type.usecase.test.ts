import type CredentialRepository from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import CredentialFakeFactory from "@/test/common/fake-factory/credential/credential.fake-factory";
import getCredentialsByTypeUseCase from "@/feature/core/credential/domain/usecase/get-credentials-by-type.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedType = CredentialType.OPENAI;
const fakedCredentials = [
  CredentialFakeFactory.getFakeCredentialByType(fakedType),
  CredentialFakeFactory.getFakeCredentialByType(fakedType),
];
const fakedUserId = faker.string.uuid();

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const credentialDi = mockDi();

const mockedGetByType = vi.fn<CredentialRepository["getByType"]>();
const MockedRepo = getMock<CredentialRepository>();
MockedRepo.setup((instance) => instance.getByType).returns(mockedGetByType);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
credentialDi.register(getCredentialsByTypeUseCase.name, {
  useValue: getCredentialsByTypeUseCase,
});
credentialDi.register(credentialRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = credentialDi.resolve<typeof getCredentialsByTypeUseCase>(
  getCredentialsByTypeUseCase.name,
);

describe("Get credentials by type usecase", () => {
  describe("On given valid params", () => {
    const params = {
      userId: fakedUserId,
      type: fakedType,
    };

    describe("And repository returns credentials", () => {
      beforeEach(() => {
        mockedGetByType.mockReturnValue(right(fakedCredentials));
      });

      it("Then should return credentials of specified type", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedCredentials));
        expect(mockedGetByType).toHaveBeenCalledWith(params);
        expect(fakedCredentials.every((c) => c.type === fakedType)).toBe(true);
      });
    });

    describe("And repository returns empty list", () => {
      beforeEach(() => {
        mockedGetByType.mockReturnValue(right([]));
      });

      it("Then should return empty array", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right([]));
        expect(mockedGetByType).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("failed-to-fetch-credentials-by-type");

      beforeEach(() => {
        mockedGetByType.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedGetByType).toHaveBeenCalledWith(params);
      });
    });
  });
});

