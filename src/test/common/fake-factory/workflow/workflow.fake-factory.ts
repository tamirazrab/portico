import Workflow from "@/feature/core/workflow/domain/entity/workflow.entity";
import WorkflowNode from "@/feature/core/workflow/domain/entity/workflow-node.entity";
import WorkflowConnection from "@/feature/core/workflow/domain/entity/workflow-connection.entity";
import NodeType from "@/feature/core/workflow/domain/enum/node-type.enum";
import { faker } from "@faker-js/faker";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class WorkflowFakeFactory {
  static getFakeWorkflow(): Workflow {
    return new Workflow({
      id: faker.string.uuid(),
      name: faker.word.words(3),
      userId: faker.string.uuid(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  static getFakeWorkflowList(length: number = 10): Workflow[] {
    return Array.from({ length }).map(() =>
      WorkflowFakeFactory.getFakeWorkflow(),
    );
  }

  static getFakeWorkflowNode(workflowId?: string): WorkflowNode {
    return new WorkflowNode({
      id: faker.string.uuid(),
      workflowId: workflowId || faker.string.uuid(),
      name: faker.word.words(2),
      type: NodeType.INITIAL,
      position: {
        x: faker.number.int({ min: 0, max: 1000 }),
        y: faker.number.int({ min: 0, max: 1000 }),
      },
      data: {},
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  static getFakeWorkflowNodeList(
    length: number = 5,
    workflowId?: string,
  ): WorkflowNode[] {
    return Array.from({ length }).map(() =>
      WorkflowFakeFactory.getFakeWorkflowNode(workflowId),
    );
  }

  static getFakeWorkflowConnection(workflowId?: string): WorkflowConnection {
    return new WorkflowConnection({
      id: faker.string.uuid(),
      workflowId: workflowId || faker.string.uuid(),
      fromNodeId: faker.string.uuid(),
      toNodeId: faker.string.uuid(),
      fromOutput: faker.word.words(1),
      toInput: faker.word.words(1),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    });
  }

  static getFakeWorkflowConnectionList(
    length: number = 3,
    workflowId?: string,
  ): WorkflowConnection[] {
    return Array.from({ length }).map(() =>
      WorkflowFakeFactory.getFakeWorkflowConnection(workflowId),
    );
  }
}

