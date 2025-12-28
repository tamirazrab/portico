import Execution from "@/feature/core/execution/domain/entity/execution.entity";
import ExecutionStatus from "@/feature/core/execution/domain/enum/execution-status.enum";
import { faker } from "@faker-js/faker";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export default class ExecutionFakeFactory {
  static getFakeExecution(): Execution {
    return new Execution({
      id: faker.string.uuid(),
      workflowId: faker.string.uuid(),
      status: ExecutionStatus.SUCCESS,
      error: undefined,
      errorStack: undefined,
      startedAt: faker.date.past(),
      completedAt: faker.date.recent(),
      inngestEventId: faker.string.uuid(),
      output: { result: faker.word.words(3) },
    });
  }

  static getFakeExecutionList(length: number = 10): Execution[] {
    return Array.from({ length }).map(() =>
      ExecutionFakeFactory.getFakeExecution(),
    );
  }

  static getFakeExecutionWithWorkflow(): Execution & {
    workflow: { id: string; name: string };
  } {
    const execution = ExecutionFakeFactory.getFakeExecution();
    return {
      ...execution,
      workflow: {
        id: faker.string.uuid(),
        name: faker.word.words(3),
      },
    };
  }

  static getFakeExecutionWithWorkflowList(
    length: number = 10,
  ): Array<Execution & { workflow: { id: string; name: string } }> {
    return Array.from({ length }).map(() =>
      ExecutionFakeFactory.getFakeExecutionWithWorkflow(),
    );
  }
}

