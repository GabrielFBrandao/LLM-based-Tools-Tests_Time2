import type { Config } from 'jest';

// Configuração de Jest isolada na Etapa4, importando fontes da Etapa3 (ESM + TS)
const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', { useESM: true }],
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      useESM: true,
      tsconfig: {
        target: 'ES2020',
        module: 'ES2020',
        moduleResolution: 'Node',
        esModuleInterop: true,
        strict: true,
        resolveJsonModule: true
      },
    },
  },
};

export default config;
