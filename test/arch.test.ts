import { type FileConditionBuilder, filesOfProject } from 'tsarch'
import * as path from 'node:path'
import { describe, expect, it } from 'vitest'

describe('architecture', () => {
  let files: FileConditionBuilder

  beforeAll(() => {
    files = filesOfProject(path.resolve('tsconfig.json'))
  })

  it('hooksディレクトリのファイルは、componentsディレクトリのファイルに依存してはいけない', async () => {
    const violations = await files
      .inFolder('hooks')
      .shouldNot()
      .dependOnFiles()
      .inFolder('components')
      .check()

    await expect(violations).toEqual([])
  })

  it('componentsディレクトリのファイルは、appディレクトリのファイルに依存してはいけない', async () => {
    const violations = await files
      .inFolder('components')
      .shouldNot()
      .dependOnFiles()
      .inFolder('app')
      .check()

    await expect(violations).toEqual([])
  })
})
