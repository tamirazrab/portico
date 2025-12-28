# Test Suite Documentation

## Overview

This directory contains comprehensive unit and E2E tests for the Portico application, following clean architecture principles and MVVM patterns.

## Test Structure

```
src/test/
├── common/                    # Shared test utilities
│   ├── fake-factory/         # Test data factories
│   │   ├── workflow/
│   │   ├── credential/
│   │   └── execution/
│   └── mock/                 # Mocking utilities
│       ├── mock-di.ts        # DI container mocking
│       └── mock-factory.ts   # Mock object factory
├── unit/                      # Unit tests
│   ├── feature/              # Feature layer tests
│   │   └── core/
│   │       ├── workflow/     # Workflow usecase tests
│   │       ├── credential/   # Credential usecase tests
│   │       └── execution/    # Execution usecase tests
│   └── app/                  # Application layer tests
│       ├── workflows/        # Workflow controller tests
│       ├── credentials/      # Credential controller tests
│       └── executions/       # Execution controller tests
└── e2e/                      # End-to-end tests
    ├── workflows.spec.ts
    ├── credentials.spec.ts
    └── executions.spec.ts
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
yarn test

# Run with coverage
yarn test:coverage

# Run in watch mode
yarn test --watch

# Run specific test file
yarn test create-workflow.usecase.test.ts

# Run tests matching pattern
yarn test workflow
```

### E2E Tests

```bash
# Run all E2E tests
yarn test:e2e

# Run with UI mode (interactive)
yarn test:e2e:ui

# Run specific test file
yarn test:e2e workflows

# Run in headed mode (see browser)
yarn test:e2e --headed
```

## Test Patterns

### Usecase Tests

Usecase tests follow this pattern:
1. Create fake data using factories
2. Mock repository using `getMock` and `moq.ts`
3. Register mocks in DI container using `mockDi()`
4. Test success and failure scenarios
5. Verify DI resolution

Example:
```typescript
import { getMock } from "@/test/common/mock/mock-factory";
import mockDi from "@/test/common/mock/mock-di";
import WorkflowFakeFactory from "@/test/common/fake-factory/workflow/workflow.fake-factory";

const workflowDi = mockDi();
const mockedCreate = vi.fn<WorkflowRepository["create"]>();
const MockedRepo = getMock<WorkflowRepository>();
MockedRepo.setup((instance) => instance.create).returns(mockedCreate);

workflowDi.register(workflowRepoKey, {
  useValue: MockedRepo.object(),
});
```

### Controller Tests

Controller tests use Vitest's `vi.mock`:
1. Mock the usecase module
2. Mock `next/server` connection
3. Test success and failure scenarios
4. Verify usecase calls and connection calls

Example:
```typescript
vi.mock("@/feature/core/workflow/domain/usecase/create-workflow.usecase");
vi.mock("next/server", () => ({
  connection: vi.fn().mockResolvedValue(undefined),
}));

const mockedUseCase = vi.mocked(createWorkflowUseCase);
```

### Mapper Tests

Mapper tests verify DTO ↔ Entity conversions:
1. Create database response objects
2. Call mapper methods
3. Verify entity creation
4. Test edge cases (null, undefined)

## Test Coverage

### Current Coverage

- **Domain Layer**: 18 usecase tests
- **Data Layer**: 3 mapper tests
- **Application Layer**: 4 controller tests
- **E2E**: 3 test suites

### Coverage Thresholds

- Lines: 90%
- Functions: 90%
- Branches: 90%
- Statements: 90%

### Viewing Coverage

After running `yarn test:coverage`:
- HTML report: `coverage/index.html`
- JSON report: `coverage/coverage-final.json`
- Text report: displayed in terminal

## Fake Factories

### WorkflowFakeFactory

```typescript
WorkflowFakeFactory.getFakeWorkflow()
WorkflowFakeFactory.getFakeWorkflowList(length)
WorkflowFakeFactory.getFakeWorkflowNode(workflowId?)
WorkflowFakeFactory.getFakeWorkflowNodeList(length, workflowId?)
WorkflowFakeFactory.getFakeWorkflowConnection(workflowId?)
WorkflowFakeFactory.getFakeWorkflowConnectionList(length, workflowId?)
```

### CredentialFakeFactory

```typescript
CredentialFakeFactory.getFakeCredential()
CredentialFakeFactory.getFakeCredentialList(length)
CredentialFakeFactory.getFakeCredentialByType(type)
```

### ExecutionFakeFactory

```typescript
ExecutionFakeFactory.getFakeExecution()
ExecutionFakeFactory.getFakeExecutionList(length)
ExecutionFakeFactory.getFakeExecutionWithWorkflow()
ExecutionFakeFactory.getFakeExecutionWithWorkflowList(length)
```

## Best Practices

1. **Use Fake Factories**: Always use fake factories for test data instead of creating objects manually
2. **Mock External Dependencies**: Mock repositories, usecases, and external services
3. **Test Both Paths**: Always test both success and failure scenarios
4. **Verify Calls**: Use `toHaveBeenCalledWith` to verify correct parameters
5. **Clear Mocks**: Use `beforeEach` with `vi.clearAllMocks()` to reset state
6. **Descriptive Names**: Use descriptive test names following "Given-When-Then" pattern

## Troubleshooting

### Tests Not Running

1. Ensure dependencies are installed: `yarn install`
2. Check Vitest configuration in `vite.config.ts`
3. Verify test file naming: `*.test.ts` or `*.spec.ts`

### Mock Issues

1. Ensure mocks are set up before imports
2. Use `vi.mocked()` for TypeScript type safety
3. Clear mocks between tests with `beforeEach`

### Coverage Issues

1. Check coverage thresholds in `vite.config.ts`
2. Verify exclusions are correct
3. Ensure all test files are in correct directories

## CI/CD Integration

Tests run automatically in CI/CD pipeline:
1. Unit tests with coverage
2. Coverage upload to Codecov
3. E2E tests execution
4. Build verification

See `.github/workflows/ci.yml` for details.

## Contributing

When adding new tests:
1. Follow existing patterns
2. Use appropriate fake factories
3. Test both success and failure paths
4. Update this documentation if needed
5. Ensure tests pass before committing

