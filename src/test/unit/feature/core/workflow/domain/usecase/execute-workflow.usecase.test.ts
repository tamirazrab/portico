import { faker } from "@faker-js/faker";
import { isLeft, left, right } from "fp-ts/lib/Either";
import { beforeEach, describe, expect, it, vi } from "vitest";
import WorkflowNode from "@/feature/core/workflow/domain/entity/workflow-node.entity";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import PremiumRequiredFailure from "@/feature/core/workflow/domain/failure/premium-required-failure";
import WorkflowNotFoundFailure from "@/feature/core/workflow/domain/failure/workflow-not-found-failure";
import type WorkflowRepository from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import { workflowRepoKey } from "@/feature/core/workflow/domain/i-repo/workflow.repository.interface";
import executeWorkflowUseCase from "@/feature/core/workflow/domain/usecase/execute-workflow.usecase";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";
import mockDi from "@/test/common/mock/mock-di";
import { getMock } from "@/test/common/mock/mock-factory";

const { mockUserHasPremium } = vi.hoisted(() => ({
  mockUserHasPremium: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/bootstrap/helpers/billing/polar-customer-state", () => ({
  userHasActivePolarSubscription: mockUserHasPremium,
}));

/* -------------------------------------------------------------------------- */
/*                                   Faking                                   */
/* -------------------------------------------------------------------------- */
const fakedWorkflow = WorkflowFakeFactory.getFakeWorkflow();
const fakedNodes = WorkflowFakeFactory.getFakeWorkflowNodeList(
  3,
  fakedWorkflow.id,
);
const fakedConnections = WorkflowFakeFactory.getFakeWorkflowConnectionList(
  2,
  fakedWorkflow.id,
);
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
        mockUserHasPremium.mockResolvedValue(true);
        mockedGetOne.mockResolvedValue(right(fakedWorkflowWithNodes));
      });

      it("Then should return workflow", async () => {
        // ! Act
        const response = await usecase(params);

        // ? Assert
        expect(response).toEqual(right(fakedWorkflow));
        expect(mockedGetOne).toHaveBeenCalledWith({
          id: params.id,
          userId: params.userId,
        });
      });

      it("When graph contains premium nodes and user is not entitled, returns premium failure", async () => {
        const base = WorkflowFakeFactory.getFakeWorkflowNode(fakedWorkflow.id);
        const openAiNode = new WorkflowNode({
          ...base.toPlainObject(),
          type: NodeType.OPENAI,
        });
        mockedGetOne.mockResolvedValue(
          right({
            ...fakedWorkflowWithNodes,
            nodes: [openAiNode],
          }),
        );
        mockUserHasPremium.mockResolvedValue(false);

        const response = await usecase(params);

        expect(isLeft(response)).toBe(true);
        if (isLeft(response)) {
          expect(response.left).toBeInstanceOf(PremiumRequiredFailure);
        }
      });
    });

    describe("And workflow does not exist", () => {
      const failure = new WorkflowNotFoundFailure();

      beforeEach(() => {
        mockedGetOne.mockResolvedValue(left(failure));
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
