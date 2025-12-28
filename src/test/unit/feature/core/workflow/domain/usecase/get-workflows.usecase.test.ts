import WorkflowRepository, {
  workflowRepoKey,
} from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { getMock } from "@/test/common/mock/mock-factory";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { faker } from "@faker-js/faker";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import getWorkflowsUseCase from "@/feature/core/workflow/domain/usecase/get-workflows.usecase";
import mockDi from "@/test/common/mock/mock-di";
import { right, left } from "fp-ts/lib/TaskEither";
import WithPagination from "@/feature/common/class-helpers/with-pagination";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedWorkflows = WorkflowFakeFactory.getFakeWorkflowList(5);
const fakedTotal = 10;
const fakedPagination = new WithPagination(fakedWorkflows, fakedTotal);
const fakedUserId = faker.string.uuid();
const fakedPage = 1;
const fakedPageSize = 10;
const fakedSearch = faker.word.words(1);

/* -------------------------------------------------------------------------- */
/*                                   Mocking                                  */
/* -------------------------------------------------------------------------- */
const workflowDi = mockDi();

const mockedGetMany = vi.fn<WorkflowRepository["getMany"]>();
const MockedRepo = getMock<WorkflowRepository>();
MockedRepo.setup((instance) => instance.getMany).returns(mockedGetMany);

/* -------------------------------------------------------------------------- */
/*                                     DI                                     */
/* -------------------------------------------------------------------------- */
workflowDi.register(getWorkflowsUseCase.name, {
  useValue: getWorkflowsUseCase,
});
workflowDi.register(workflowRepoKey, {
  useValue: MockedRepo.object(),
});

/* -------------------------------------------------------------------------- */
/*                                   Testing                                  */
/* -------------------------------------------------------------------------- */
const usecase = workflowDi.resolve<typeof getWorkflowsUseCase>(
  getWorkflowsUseCase.name,
);

describe("Get workflows usecase", () => {
  describe("On given valid params", () => {
    const params = {
      userId: fakedUserId,
      page: fakedPage,
      pageSize: fakedPageSize,
      search: fakedSearch,
    };

    describe("And repository returns workflows", () => {
      beforeEach(() => {
        mockedGetMany.mockReturnValue(right(fakedPagination));
      });

      it("Then should return paginated workflows", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedPagination));
        expect(mockedGetMany).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns empty list", () => {
      const emptyPagination = new WithPagination([], 0);

      beforeEach(() => {
        mockedGetMany.mockReturnValue(right(emptyPagination));
      });

      it("Then should return empty pagination", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(emptyPagination));
        expect(mockedGetMany).toHaveBeenCalledWith(params);
      });
    });

    describe("And repository returns failure", () => {
      const failure = new WorkflowNotFoundFailure();

      beforeEach(() => {
        mockedGetMany.mockReturnValue(left(failure));
      });

      it("Then should return failure", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(left(failure));
        expect(mockedGetMany).toHaveBeenCalledWith(params);
      });
    });
  });
});

