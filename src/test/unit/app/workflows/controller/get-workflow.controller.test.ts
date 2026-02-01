import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import getWorkflowController from "@/server/controllers/workflows/get-workflow.controller";
import getWorkflowUseCase from "@/feature/core/workflow/domain/usecase/get-workflow.usecase";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import { right, left } from "fp-ts/lib/Either";
import BaseFailure from "@/feature/common/failures/base.failure";
import * as connectionModule from "next/server";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedWorkflow = WorkflowFakeFactory.getFakeWorkflow();
const fakedNodes = WorkflowFakeFactory.getFakeWorkflowNodeList(3, fakedWorkflow.id);
const fakedConnections = WorkflowFakeFactory.getFakeWorkflowConnectionList(2, fakedWorkflow.id);
const fakedWorkflowWithNodes = {
  workflow: fakedWorkflow,
  nodes: fakedNodes,
  connections: fakedConnections,
};
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
vi.mock("server-only", () => ({}));
vi.mock("@/feature/core/workflow/domain/usecase/get-workflow.usecase");
vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

const mockedUseCase = vi.mocked(getWorkflowUseCase);

describe("Get workflow controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
    };

    describe("And usecase returns workflow", () => {
      beforeEach(() => {
        mockedUseCase.mockResolvedValue(right(fakedWorkflowWithNodes));
      });

      it("Then should return workflow with nodes and connections", async () => {
        // ! Act
        const response = await getWorkflowController(params);

        // ? Assert
        expect(response).toEqual(right(fakedWorkflowWithNodes));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
        expect(connectionModule.connection).toHaveBeenCalled();
      });
    });

    describe("And usecase returns failure", () => {
      const failure = new BaseFailure("workflow-not-found", "workflow");

      beforeEach(() => {
        mockedUseCase.mockResolvedValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await getWorkflowController(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUseCase).toHaveBeenCalledWith(params);
      });
    });
  });
});

