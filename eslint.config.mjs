import js from '@eslint/js';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import globals from 'globals';
export default defineConfig(
 { ignores: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.expo/**', 'backend/src/generated/**', '**/.unused-template-assets/**'] },
 { files: ['**/*.{js,cjs,mjs}'], extends: [js.configs.recommended], languageOptions: { globals: globals.node } },
 { files: ['**/*.{ts,tsx}'], extends: [js.configs.recommended, tseslint.configs.recommended], languageOptions: { globals: { ...globals.node, ...globals.jest } } },
);
