import type ExecutionRepository from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { executionRepoKey } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import ExecutionFakeFactory from "@/test/common/fake-factory/execution/execution.fake-factory";
import getExecutionUseCase from "@/feature/core/execution/domain/usecase/get-execution.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedExecutionWithWorkflow = ExecutionFakeFactory.getFakeExecutionWithWorkflow();
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const executionDi = mockDi();

const mockedGetOne = vi.fn<ExecutionRepository["getOne"]>();
const MockedRepo = getMock<ExecutionRepository>();
MockedRepo.setup((instance) => instance.getOne).returns(mockedGetOne);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
executionDi.register(getExecutionUseCase.name, {
  useValue: getExecutionUseCase,
});
executionDi.register(executionRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = executionDi.resolve<typeof getExecutionUseCase>(
  getExecutionUseCase.name,
);

describe("Get execution usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
    };

    describe("And repository returns execution", () => {
      beforeEach(() => {
        mockedGetOne.mockReturnValue(right(fakedExecutionWithWorkflow));
      });

      it("Then should return execution with workflow", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedExecutionWithWorkflow));
        expect(mockedGetOne).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("execution-not-found", "execution");

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

