/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        setupFiles: 'src/test/setup.ts',
        include: ['src/test/unit/**/*.test.ts'],
        exclude: ['node_modules', 'src/test/e2e'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'src/test/',
                '**/*.test.ts',
                '**/*.spec.ts',
                '**/*.config.ts',
                '**/setup.ts',
                '**/*.d.ts',
                'src/generated/',
                'src/bootstrap/i18n/',
            ],
            thresholds: {
                lines: 90,
                functions: 90,
                branches: 90,
                statements: 90,
            },
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
  },
})