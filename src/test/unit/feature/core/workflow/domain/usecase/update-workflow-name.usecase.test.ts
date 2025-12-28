import type WorkflowRepository from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { workflowRepoKey } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import updateWorkflowNameUseCase from "@/feature/core/workflow/domain/usecase/update-workflow-name.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedWorkflow = WorkflowFakeFactory.getFakeWorkflow();
const fakedId = faker.string.uuid();
const fakedUserId = faker.string.uuid();
const fakedName = faker.word.words(3);

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const workflowDi = mockDi();

const mockedUpdateName = vi.fn<WorkflowRepository["updateName"]>();
const MockedRepo = getMock<WorkflowRepository>();
MockedRepo.setup((instance) => instance.updateName).returns(mockedUpdateName);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
workflowDi.register(updateWorkflowNameUseCase.name, {
  useValue: updateWorkflowNameUseCase,
});
workflowDi.register(workflowRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = workflowDi.resolve<typeof updateWorkflowNameUseCase>(
  updateWorkflowNameUseCase.name,
);

describe("Update workflow name usecase", () => {
  describe("On given valid params", () => {
    const params = {
      id: fakedId,
      userId: fakedUserId,
      name: fakedName,
    };

    describe("And repository returns updated workflow", () => {
      beforeEach(() => {
        mockedUpdateName.mockReturnValue(right(fakedWorkflow));
      });

      it("Then should return updated workflow", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedWorkflow));
        expect(mockedUpdateName).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new WorkflowNotFoundFailure();

      beforeEach(() => {
        mockedUpdateName.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedUpdateName).toHaveBeenCalledWith(params);
      });
    });
  });
});
