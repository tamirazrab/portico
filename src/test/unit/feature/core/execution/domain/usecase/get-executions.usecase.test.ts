import { faker } from "@faker-js/faker";
import { left, right } from "fp-ts/lib/Either";
import { beforeEach, describe, expect, it, vi } from "vite-plus/test";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import BaseFailure from "@/feature/common/failures/base.failure";
import type ExecutionRepository from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { executionRepoKey } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import getExecutionsUseCase from "@/feature/core/execution/domain/usecase/get-executions.usecase";
import ExecutionFakeFactory from "@/test/common/fake-factory/execution/execution.fake-factory";
import mockDi from "@/test/common/mock/mock-di";
import { getMock } from "@/test/common/mock/mock-factory";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedExecutions =
  ExecutionFakeFactory.getFakeExecutionWithWorkflowList(5);
const fakedTotal = 10;
const fakedPagination = new WithPagination(fakedExecutions, fakedTotal);
const fakedUserId = faker.string.uuid();
const fakedPage = 1;
const fakedPageSize = 10;

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const executionDi = mockDi();

const mockedGetMany = vi.fn<ExecutionRepository["getMany"]>();
const MockedRepo = getMock<ExecutionRepository>();
MockedRepo.setup((instance) => instance.getMany).returns(mockedGetMany);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
executionDi.register(getExecutionsUseCase.name, {
  useValue: getExecutionsUseCase,
});
executionDi.register(executionRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = executionDi.resolve<typeof getExecutionsUseCase>(
  getExecutionsUseCase.name,
);

describe("Get executions usecase", () => {
  describe("On given valid params", () => {
    const params = {
      userId: fakedUserId,
      page: fakedPage,
      pageSize: fakedPageSize,
    };

    describe("And repository returns executions", () => {
      beforeEach(() => {
        mockedGetMany.mockReturnValue(right(fakedPagination));
      });

      it("Then should return paginated executions", async () => {
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
      const failure = new BaseFailure(
        "failed-to-fetch-executions",
        "execution",
      );

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
