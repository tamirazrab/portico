import type ExecutionRepository from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { executionRepoKey } from "@/feature/core/execution/domain/i-repo/execution.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import ExecutionFakeFactory from "@/test/common/fake-factory/execution/execution.fake-factory";
import updateExecutionStatusByInngestEventIdUseCase from "@/feature/core/execution/domain/usecase/update-execution-status-by-inngest-event-id.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import BaseFailure from "@/feature/common/failures/base.failure";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedExecution = ExecutionFakeFactory.getFakeExecution();
const fakedInngestEventId = faker.string.uuid();
const fakedStatus = ExecutionStatus.SUCCESS;
const fakedOutput = { result: faker.word.words(3) };

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const executionDi = mockDi();

const mockedUpdateStatusByInngestEventId = vi.fn<
  ExecutionRepository["updateStatusByInngestEventId"]
>();
const MockedRepo = getMock<ExecutionRepository>();
MockedRepo.setup((instance) => instance.updateStatusByInngestEventId).returns(
  mockedUpdateStatusByInngestEventId,
);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
executionDi.register(updateExecutionStatusByInngestEventIdUseCase.name, {
  useValue: updateExecutionStatusByInngestEventIdUseCase,
});
executionDi.register(executionRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = executionDi.resolve<
  typeof updateExecutionStatusByInngestEventIdUseCase
>(updateExecutionStatusByInngestEventIdUseCase.name);

describe("Update execution status by inngest event id usecase", () => {
  describe("On given valid params", () => {
    const params = {
      inngestEventId: fakedInngestEventId,
      status: fakedStatus,
      output: fakedOutput,
    };

    describe("And repository returns updated execution", () => {
      beforeEach(() => {
        mockedUpdateStatusByInngestEventId.mockReturnValue(right(fakedExecution));
      });

      it("Then should return updated execution", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedExecution));
        expect(mockedUpdateStatusByInngestEventId).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new BaseFailure(
        "execution-update-failed",
        "execution",
      );

      beforeEach(() => {
        mockedUpdateStatusByInngestEventId.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUpdateStatusByInngestEventId).toHaveBeenCalledWith(params);
      });
    });

    describe("And updating with error", () => {
      const errorParams = {
        inngestEventId: fakedInngestEventId,
        status: ExecutionStatus.FAILED,
        error: faker.word.words(5),
        errorStack: faker.lorem.paragraph(),
      };

      beforeEach(() => {
        mockedUpdateStatusByInngestEventId.mockReturnValue(right(fakedExecution));
      });

      it("Then should return execution with error", async () => {
        // ! Act
        const response = await usecase(errorParams);

        // ? Assert
        expect(response).toEqual(right(fakedExecution));
        expect(mockedUpdateStatusByInngestEventId).toHaveBeenCalledWith(errorParams);
      });
    });
  });
});

