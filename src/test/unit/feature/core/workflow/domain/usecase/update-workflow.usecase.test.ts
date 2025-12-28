import WorkflowRepository, {
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import updateWorkflowUseCase from "@/feature/core/workflow/domain/usecase/update-workflow.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedWorkflow = WorkflowFakeFactory.getFakeWorkflow();
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();
const fakedNodes = [
  {
    id: faker.string.uuid(),
    type: null,
    position: { x: 100, y: 200 },
    data: {},
  },
];
const fakedEdges = [
  {
    source: faker.string.uuid(),
    target: faker.string.uuid(),
    sourceHandle: null,
    targetHandle: null,
  },
];

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const workflowDi = mockDi();

const mockedUpdate = vi.fn<WorkflowRepository["update"]>();
const MockedRepo = getMock<WorkflowRepository>();
MockedRepo.setup((instance) => instance.update).returns(mockedUpdate);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
workflowDi.register(updateWorkflowUseCase.name, {
  useValue: updateWorkflowUseCase,
});
workflowDi.register(workflowRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = workflowDi.resolve<typeof updateWorkflowUseCase>(
  updateWorkflowUseCase.name,
);

describe("Update workflow usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
      nodes: fakedNodes,
      edges: fakedEdges,
    };

    describe("And repository returns updated workflow", () => {
      beforeEach(() => {
        mockedUpdate.mockReturnValue(right(fakedWorkflow));
      });

      it("Then should return updated workflow", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedWorkflow));
        expect(mockedUpdate).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new WorkflowNotFoundFailure();

      beforeEach(() => {
        mockedUpdate.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUpdate).toHaveBeenCalledWith(params);
      });
    });
  });
});

