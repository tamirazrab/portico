import { faker } from "@faker-js/faker";
import { left, right } from "fp-ts/lib/Either";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BaseFailure from "@/feature/common/failures/base.failure";
import type CredentialRepository from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import getCredentialUseCase from "@/feature/core/credential/domain/usecase/get-credential.usecase";
import CredentialFakeFactory from "@/test/common/fake-factory/credential/credential.fake-factory";
import mockDi from "@/test/common/mock/mock-di";
import { getMock } from "@/test/common/mock/mock-factory";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedCredential = CredentialFakeFactory.getFakeCredential();
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const credentialDi = mockDi();

const mockedGetOne = vi.fn<CredentialRepository["getOne"]>();
const MockedRepo = getMock<CredentialRepository>();
MockedRepo.setup((instance) => instance.getOne).returns(mockedGetOne);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
credentialDi.register(getCredentialUseCase.name, {
  useValue: getCredentialUseCase,
});
credentialDi.register(credentialRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = credentialDi.resolve<typeof getCredentialUseCase>(
  getCredentialUseCase.name,
);

describe("Get credential usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
    };

    describe("And repository returns credential", () => {
      beforeEach(() => {
        mockedGetOne.mockReturnValue(right(fakedCredential));
      });

      it("Then should return credential", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedCredential));
        expect(mockedGetOne).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("credential-not-found");

      beforeEach(() => {
        mockedGetOne.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedGetOne).toHaveBeenCalledWith(params);
      });
    });
  });
});
