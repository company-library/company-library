import '@testing-library/jest-dom/vitest'

vi.stubEnv('AZURE_AD_B2C_TENANT_NAME', 'company-library-test')
vi.stubEnv('AZURE_AD_B2C_CLIENT_ID', 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx')
vi.stubEnv('AZURE_AD_B2C_CLIENT_SECRET', 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx')
vi.stubEnv('AZURE_AD_B2C_PRIMARY_USER_FLOW', 'B2C_1_flow')
