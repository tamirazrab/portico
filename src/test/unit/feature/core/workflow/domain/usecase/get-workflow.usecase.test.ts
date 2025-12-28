import WorkflowRepository, {
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import getWorkflowUseCase from "@/feature/core/workflow/domain/usecase/get-workflow.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/Either";
import { isRight, isLeft } from "fp-ts/lib/Either";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";

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
const workflowDi = mockDi();

const mockedGetOne = vi.fn<WorkflowRepository["getOne"]>();
const MockedRepo = getMock<WorkflowRepository>();
MockedRepo.setup((instance) => instance.getOne).returns(mockedGetOne);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
workflowDi.register(getWorkflowUseCase.name, {
  useValue: getWorkflowUseCase,
});
workflowDi.register(workflowRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = workflowDi.resolve<typeof getWorkflowUseCase>(
  getWorkflowUseCase.name,
);

describe("Get workflow usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
    };

    describe("And repository returns workflow", () => {
      beforeEach(() => {
        mockedGetOne.mockReturnValue(right(fakedWorkflowWithNodes));
      });

      it("Then should return workflow with nodes and connections", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(isRight(response)).toBe(true);
        if (isRight(response)) {
          expect(response.right).toEqual(fakedWorkflowWithNodes);
        }
        expect(mockedGetOne).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new WorkflowNotFoundFailure();

      beforeEach(() => {
        mockedGetOne.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(isLeft(response)).toBe(true);
        if (isLeft(response)) {
          expect(response.left.message).toBe(failure.message);
        }
        expect(mockedGetOne).toHaveBeenCalledWith(params);
      });
    });
  });
});

