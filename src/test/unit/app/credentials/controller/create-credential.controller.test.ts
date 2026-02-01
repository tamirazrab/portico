import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import createCredentialController from "@/server/controllers/credentials/create-credential.controller";
import createCredentialUseCase from "@/feature/core/credential/domain/usecase/create-credential.usecase";
import CredentialFakeFactory from "@/test/common/fake-factory/credential/credential.fake-factory";
import { right, left } from "fp-ts/lib/Either";
import BaseFailure from "@/feature/common/failures/base.failure";
import CredentialType from "@/feature/core/credential/domain/enum/credential-type.enum";
import * as connectionModule from "next/server";

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
vi.mock("server-only", () => ({}));
vi.mock("@/feature/core/credential/domain/usecase/create-credential.usecase");
vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

const mockedUseCase = vi.mocked(createCredentialUseCase);

describe("Create credential controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("On given valid params", () => {
    const params = {
      name: fakedName,
      value: fakedValue,
      type: fakedType,
      userId: fakedUserId,
    };

    describe("And usecase returns success", () => {
      beforeEach(() => {
        mockedUseCase.mockResolvedValue(right(fakedCredential));
      });

      it("Then should return credential", async () => {
        // ! Act
        const response = await createCredentialController(params);

        // ? Assert
        expect(response).toEqual(right(fakedCredential));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
        expect(connectionModule.connection).toHaveBeenCalled();
      });
    });

    describe("And usecase returns failure", () => {
      const failure = new BaseFailure("credential-creation-failed", "credential");

      beforeEach(() => {
        mockedUseCase.mockResolvedValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await createCredentialController(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
      });
    });
  });
});

