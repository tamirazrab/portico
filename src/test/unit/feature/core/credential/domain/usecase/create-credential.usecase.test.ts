import type CredentialRepository from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import CredentialFakeFactory from "@/test/common/fake-factory/credential/credential.fake-factory";
import createCredentialUseCase from "@/feature/core/credential/domain/usecase/create-credential.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedCredential = CredentialFakeFactory.getFakeCredential();
const fakedUserId = faker.string.uuid();
const fakedName = faker.word.words(2);
const fakedValue = faker.string.alphanumeric(32);
const fakedType = CredentialType.OPENAI;

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const credentialDi = mockDi();

const mockedCreate = vi.fn<CredentialRepository["create"]>();
const MockedRepo = getMock<CredentialRepository>();
MockedRepo.setup((instance) => instance.create).returns(mockedCreate);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
credentialDi.register(createCredentialUseCase.name, {
  useValue: createCredentialUseCase,
});
credentialDi.register(credentialRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = credentialDi.resolve<typeof createCredentialUseCase>(
  createCredentialUseCase.name,
);

describe("Create credential usecase", () => {
  describe("On given valid params", () => {
    const params = {
      name: fakedName,
      value: fakedValue,
      type: fakedType,
      userId: fakedUserId,
    };

    describe("And repository returns success", () => {
      beforeEach(() => {
        mockedCreate.mockReturnValue(right(fakedCredential));
      });

      it("Then should return created credential", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedCredential));
        expect(mockedCreate).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("credential-creation-failed");

      beforeEach(() => {
        mockedCreate.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedCreate).toHaveBeenCalledWith(params);
      });
    });
  });
});

