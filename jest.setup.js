import '@testing-library/jest-dom'

process.env.AZURE_AD_B2C_TENANT_NAME = 'company-library-test'
process.env.AZURE_AD_B2C_CLIENT_ID = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
process.env.AZURE_AD_B2C_CLIENT_SECRET = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
process.env.AZURE_AD_B2C_PRIMARY_USER_FLOW = 'B2C_1_flow'

afterEach(() => {
  jest.clearAllMocks()
})
