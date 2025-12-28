import type ExecutionRepository from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { executionRepoKey } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import ExecutionFakeFactory from "@/test/common/fake-factory/execution/execution.fake-factory";
import createExecutionUseCase from "@/feature/core/execution/domain/usecase/create-execution.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedExecution = ExecutionFakeFactory.getFakeExecution();
const fakedWorkflowId = faker.string.uuid();
const fakedInngestEventId = faker.string.uuid();

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const executionDi = mockDi();

const mockedCreate = vi.fn<ExecutionRepository["create"]>();
const MockedRepo = getMock<ExecutionRepository>();
MockedRepo.setup((instance) => instance.create).returns(mockedCreate);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
executionDi.register(createExecutionUseCase.name, {
  useValue: createExecutionUseCase,
});
executionDi.register(executionRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = executionDi.resolve<typeof createExecutionUseCase>(
  createExecutionUseCase.name,
);

describe("Create execution usecase", () => {
  describe("On given valid params", () => {
    const params = {
      workflowId: fakedWorkflowId,
      inngestEventId: fakedInngestEventId,
    };

    describe("And repository returns success", () => {
      beforeEach(() => {
        mockedCreate.mockReturnValue(right(fakedExecution));
      });

      it("Then should return created execution", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedExecution));
        expect(mockedCreate).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("execution-creation-failed", "execution");

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

