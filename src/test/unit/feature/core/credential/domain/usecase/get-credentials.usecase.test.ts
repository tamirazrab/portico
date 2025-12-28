import type CredentialRepository from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { credentialRepoKey } from "@/feature/core/credential/domain/i-repo/credential.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import CredentialFakeFactory from "@/test/common/fake-factory/credential/credential.fake-factory";
import getCredentialsUseCase from "@/feature/core/credential/domain/usecase/get-credentials.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import BaseFailure from "@/feature/common/failures/base.failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedCredentials = CredentialFakeFactory.getFakeCredentialList(5);
const fakedTotal = 10;
const fakedPagination = new WithPagination(fakedCredentials, fakedTotal);
const fakedUserId = faker.string.uuid();
const fakedPage = 1;
const fakedPageSize = 10;
const fakedSearch = faker.word.words(1);

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const credentialDi = mockDi();

const mockedGetMany = vi.fn<CredentialRepository["getMany"]>();
const MockedRepo = getMock<CredentialRepository>();
MockedRepo.setup((instance) => instance.getMany).returns(mockedGetMany);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
credentialDi.register(getCredentialsUseCase.name, {
  useValue: getCredentialsUseCase,
});
credentialDi.register(credentialRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = credentialDi.resolve<typeof getCredentialsUseCase>(
  getCredentialsUseCase.name,
);

describe("Get credentials usecase", () => {
  describe("On given valid params", () => {
    const params = {
      userId: fakedUserId,
      page: fakedPage,
      pageSize: fakedPageSize,
      search: fakedSearch,
    };

    describe("And repository returns credentials", () => {
      beforeEach(() => {
        mockedGetMany.mockReturnValue(right(fakedPagination));
      });

      it("Then should return paginated credentials", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedPagination));
        expect(mockedGetMany).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns empty list", () => {
      const emptyPagination = new WithPagination([], 0);

      beforeEach(() => {
        mockedGetMany.mockReturnValue(right(emptyPagination));
      });

      it("Then should return empty pagination", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(emptyPagination));
        expect(mockedGetMany).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("failed-to-fetch-credentials");

      beforeEach(() => {
        mockedGetMany.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedGetMany).toHaveBeenCalledWith(params);
      });
    });
  });
});

