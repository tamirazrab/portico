import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import getExecutionController from "@/app/[lang]/dashboard/executions/controller/get-execution.controller";
import getExecutionUseCase from "@/feature/core/execution/domain/usecase/get-execution.usecase";
import ExecutionFakeFactory from "@/test/common/fake-factory/execution/execution.fake-factory";
import { right, left } from "fp-ts/lib/Either";
import BaseFailure from "@/feature/common/failures/base.failure";
import * as connectionModule from "next/server";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedExecutionWithWorkflow = ExecutionFakeFactory.getFakeExecutionWithWorkflow();
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
vi.mock("server-only", () => ({}));
vi.mock("@/feature/core/execution/domain/usecase/get-execution.usecase");
vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

const mockedUseCase = vi.mocked(getExecutionUseCase);

describe("Get execution controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
    };

    describe("And usecase returns execution", () => {
      beforeEach(() => {
        mockedUseCase.mockResolvedValue(right(fakedExecutionWithWorkflow));
      });

      it("Then should return execution with workflow", async () => {
        // ! Act
        const response = await getExecutionController(params);

        // ? Assert
        expect(response).toEqual(right(fakedExecutionWithWorkflow));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
        expect(connectionModule.connection).toHaveBeenCalled();
      });
    });

    describe("And usecase returns failure", () => {
      const failure = new BaseFailure("execution-not-found", "execution");

      beforeEach(() => {
        mockedUseCase.mockResolvedValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await getExecutionController(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
      });
    });
  });
});

