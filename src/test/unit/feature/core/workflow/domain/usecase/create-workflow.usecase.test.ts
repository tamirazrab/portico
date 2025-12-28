import WorkflowRepository, {
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import createWorkflowUseCase from "@/feature/core/workflow/domain/usecase/create-workflow.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/Either";
import { isRight, isLeft } from "fp-ts/lib/Either";
import { workflowModuleKey } from "@/feature/core/workflow/data/workflow-module-key";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedWorkflow = WorkflowFakeFactory.getFakeWorkflow();
const fakedUserId = faker.string.uuid();
const fakedName = faker.word.words(3);

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const workflowDi = mockDi();

const mockedCreate = vi.fn<WorkflowRepository["create"]>();
const MockedRepo = getMock<WorkflowRepository>();
MockedRepo.setup((instance) => instance.create).returns(mockedCreate);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
workflowDi.register(createWorkflowUseCase.name, {
  useValue: createWorkflowUseCase,
});
workflowDi.register(workflowRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = workflowDi.resolve<typeof createWorkflowUseCase>(
  createWorkflowUseCase.name,
);

describe("Create workflow usecase", () => {
  describe("On given valid params", () => {
    const params = {
      name: fakedName,
      userId: fakedUserId,
    };

    describe("And repository returns success", () => {
      beforeEach(() => {
        mockedCreate.mockReturnValue(right(fakedWorkflow));
      });

      it("Then should return created workflow", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(isRight(response)).toBe(true);
        if (isRight(response)) {
          expect(response.right).toEqual(fakedWorkflow);
        }
        expect(mockedCreate).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new WorkflowNotFoundFailure();

      beforeEach(() => {
        mockedCreate.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(isLeft(response)).toBe(true);
        if (isLeft(response)) {
          expect(response.left.message).toBe(failure.message);
        }
        expect(mockedCreate).toHaveBeenCalledWith(params);
      });
    });
  });
});

