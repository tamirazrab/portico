import { stackMiddlewares } from "@/middlewares/stackHandler";
import { withLocale } from "@/middlewares/with-locale";
import { withRateLimit } from "@/middlewares/with-rate-limit";

export const config = {
  matcher: [
    // locale routing + dashboard, etc.
    "/((?!api|static|.*\\..*|_next).*)",
    // abuse-sensitive endpoints
    "/api/trpc/:path*",
    "/api/workflows/:path*",
  ],
};

const middlewares = [withRateLimit, withLocale];
export default stackMiddlewares(middlewares);
