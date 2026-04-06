import type { InjectionToken } from "tsyringe";
import { vi } from "vitest";
import di from "@/bootstrap/di/init-di";
import * as serverDi from "@/feature/common/features.di";

/**
 * Mocks `diResolve` to resolve against the shared test root container.
 * Spying `featuresDi` default does not affect the `diResolve` closure in `features.di.ts`
 * (local binding), so tests must patch `diResolve` directly.
 */
export default function mockDi() {
  vi.spyOn(serverDi, "diResolve").mockImplementation(
    (_module: string, key: InjectionToken) => di.resolve(key),
  );
  return di;
}
