// This file mocks server-only module for test environment
// It must be imported before any code that uses server-only

// @ts-expect-error - Mocking server-only
if (typeof require !== "undefined") {
  const Module = require("module");
  const originalRequire = Module.prototype.require;
  Module.prototype.require = function (id: string) {
    if (id === "server-only") {
      return {};
    }
    return originalRequire.apply(this, arguments);
  };
}

export {};

