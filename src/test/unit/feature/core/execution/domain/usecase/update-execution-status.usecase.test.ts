import type ExecutionRepository from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { executionRepoKey } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import ExecutionFakeFactory from "@/test/common/fake-factory/execution/execution.fake-factory";
import updateExecutionStatusUseCase from "@/feature/core/execution/domain/usecase/update-execution-status.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedExecution = ExecutionFakeFactory.getFakeExecution();
const fakedId = faker.string.uuid();
const fakedStatus = ExecutionStatus.SUCCESS;
const fakedOutput = { result: faker.word.words(3) };

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const executionDi = mockDi();

const mockedUpdateStatus = vi.fn<ExecutionRepository["updateStatus"]>();
const MockedRepo = getMock<ExecutionRepository>();
MockedRepo.setup((instance) => instance.updateStatus).returns(mockedUpdateStatus);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
executionDi.register(updateExecutionStatusUseCase.name, {
  useValue: updateExecutionStatusUseCase,
});
executionDi.register(executionRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = executionDi.resolve<typeof updateExecutionStatusUseCase>(
  updateExecutionStatusUseCase.name,
);

describe("Update execution status usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      status: fakedStatus,
      output: fakedOutput,
    };

    describe("And repository returns updated execution", () => {
      beforeEach(() => {
        mockedUpdateStatus.mockReturnValue(right(fakedExecution));
      });

      it("Then should return updated execution", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedExecution));
        expect(mockedUpdateStatus).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure("execution-update-failed", "execution");

      beforeEach(() => {
        mockedUpdateStatus.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUpdateStatus).toHaveBeenCalledWith(params);
      });
    });

    describe("And updating with error", () => {
      const errorParams = {
        id: fakedId,
        status: ExecutionStatus.FAILED,
        error: faker.word.words(5),
        errorStack: faker.lorem.paragraph(),
      };

      beforeEach(() => {
        mockedUpdateStatus.mockReturnValue(right(fakedExecution));
      });

      it("Then should return execution with error", async () => {
        // ! Act
        const response = await usecase(errorParams);

        // ? Assert
        expect(response).toEqual(right(fakedExecution));
        expect(mockedUpdateStatus).toHaveBeenCalledWith(errorParams);
      });
    });
  });
});

