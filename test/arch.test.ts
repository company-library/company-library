import { type FileConditionBuilder, filesOfProject } from 'tsarch'
import * as path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('architecture', () => {
  let files: FileConditionBuilder

  beforeAll(() => {
    files = filesOfProject(path.resolve('tsconfig.json'))
  })

  it('componentsディレクトリのファイルは、hooksディレクトリのファイルに依存してはいけない', async () => {
    const violations = await files
      .inFolder('components')
      .shouldNot()
      .dependOnFiles()
      .inFolder('hooks')
      .check()

    await expect(violations).toEqual([])
  })
})
