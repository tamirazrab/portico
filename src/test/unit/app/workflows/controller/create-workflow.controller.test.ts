import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import createWorkflowController from "@/server/controllers/workflows/create-workflow.controller";
import createWorkflowUseCase from "@/feature/core/workflow/domain/usecase/create-workflow.usecase";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import { right, left } from "fp-ts/lib/Either";
import BaseFailure from "@/feature/common/failures/base.failure";
import * as connectionModule from "next/server";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedWorkflow = WorkflowFakeFactory.getFakeWorkflow();
const fakedUserId = faker.string.uuid();
const fakedName = faker.word.words(3);

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
vi.mock("server-only", () => ({}));
vi.mock("@/feature/core/workflow/domain/usecase/create-workflow.usecase");
vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

const mockedUseCase = vi.mocked(createWorkflowUseCase);

describe("Create workflow controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("On given valid params", () => {
    const params = {
      name: fakedName,
      userId: fakedUserId,
    };

    describe("And usecase returns success", () => {
      beforeEach(() => {
        mockedUseCase.mockResolvedValue(right(fakedWorkflow));
      });

      it("Then should return workflow", async () => {
        // ! Act
        const response = await createWorkflowController(params);

        // ? Assert
        expect(response).toEqual(right(fakedWorkflow));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
        expect(connectionModule.connection).toHaveBeenCalled();
      });
    });

    describe("And usecase returns failure", () => {
      const failure = new BaseFailure("workflow-creation-failed", "workflow");

      beforeEach(() => {
        mockedUseCase.mockResolvedValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await createWorkflowController(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
      });
    });
  });
});

