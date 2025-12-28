import WorkflowRepository, {
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import executeWorkflowUseCase from "@/feature/core/workflow/domain/usecase/execute-workflow.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
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
workflowDi.register(executeWorkflowUseCase.name, {
  useValue: executeWorkflowUseCase,
});
workflowDi.register(workflowRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = workflowDi.resolve<typeof executeWorkflowUseCase>(
  executeWorkflowUseCase.name,
);

describe("Execute workflow usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
    };

    describe("And workflow exists", () => {
      beforeEach(() => {
        mockedGetOne.mockReturnValue(right(fakedWorkflowWithNodes));
      });

      it("Then should return workflow with nodes and connections", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedWorkflowWithNodes));
        expect(mockedGetOne).toHaveBeenCalledWith({
          id: params.id,
          userId: params.userId,
        });
      });
    });

    describe("And workflow does not exist", () => {
      const failure = new WorkflowNotFoundFailure();

      beforeEach(() => {
        mockedGetOne.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedGetOne).toHaveBeenCalledWith({
          id: params.id,
          userId: params.userId,
        });
      });
    });
  });
});

