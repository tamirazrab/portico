import type { Either } from "fp-ts/lib/Either";
import type { TaskEither } from "fp-ts/lib/TaskEither";
import type BaseFailure from "@/feature/common/failures/base.failure";

type ApiTask<ResponseType> = TaskEither<BaseFailure<unknown>, ResponseType>;
export type ApiEither<ResponseType> = Either<
  BaseFailure<unknown>,
  ResponseType
>;

export default ApiTask;
