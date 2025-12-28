import type CredentialRepository from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import deleteCredentialUseCase from "@/feature/core/credential/domain/usecase/delete-credential.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const credentialDi = mockDi();

const mockedDelete = vi.fn<CredentialRepository["delete"]>();
const MockedRepo = getMock<CredentialRepository>();
MockedRepo.setup((instance) => instance.delete).returns(mockedDelete);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
credentialDi.register(deleteCredentialUseCase.name, {
  useValue: deleteCredentialUseCase,
});
credentialDi.register(credentialRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = credentialDi.resolve<typeof deleteCredentialUseCase>(
  deleteCredentialUseCase.name,
);

describe("Delete credential usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
    };

    describe("And repository returns success", () => {
      beforeEach(() => {
        mockedDelete.mockReturnValue(right(true as const));
      });

      it("Then should return success", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(true));
        expect(mockedDelete).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("credential-delete-failed");

      beforeEach(() => {
        mockedDelete.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedDelete).toHaveBeenCalledWith(params);
      });
    });
  });
});

