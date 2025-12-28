import type CredentialRepository from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import CredentialFakeFactory from "@/test/common/fake-factory/credential/credential.fake-factory";
import updateCredentialUseCase from "@/feature/core/credential/domain/usecase/update-credential.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedCredential = CredentialFakeFactory.getFakeCredential();
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();
const fakedName = faker.word.words(2);
const fakedValue = faker.string.alphanumeric(32);
const fakedType = CredentialType.ANTHROPIC;

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const credentialDi = mockDi();

const mockedUpdate = vi.fn<CredentialRepository["update"]>();
const MockedRepo = getMock<CredentialRepository>();
MockedRepo.setup((instance) => instance.update).returns(mockedUpdate);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
credentialDi.register(updateCredentialUseCase.name, {
  useValue: updateCredentialUseCase,
});
credentialDi.register(credentialRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = credentialDi.resolve<typeof updateCredentialUseCase>(
  updateCredentialUseCase.name,
);

describe("Update credential usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
      name: fakedName,
      value: fakedValue,
      type: fakedType,
    };

    describe("And repository returns updated credential", () => {
      beforeEach(() => {
        mockedUpdate.mockReturnValue(right(fakedCredential));
      });

      it("Then should return updated credential", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedCredential));
        expect(mockedUpdate).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("credential-update-failed");

      beforeEach(() => {
        mockedUpdate.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUpdate).toHaveBeenCalledWith(params);
      });
    });
  });
});

