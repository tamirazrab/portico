import { stackMiddlewares } from "@/middlewares/stackHandler";

export const config = {
  matcher: ["/((?!api|static|.*\\..*|_next).*)"],
};

const middlewares: never[] = [];
export default stackMiddlewares(middlewares);
