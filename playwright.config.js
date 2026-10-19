import { defineConfig } from '@playwright/test';
export default defineConfig({ testDir: './tests/browser', workers: 1, outputDir: './.scratch/test-results', reporter: 'list', timeout: 30000 });
