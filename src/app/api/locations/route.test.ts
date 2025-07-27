import { GET } from '@/app/api/locations/route'
import { location1, location2 } from '../../../../test/__utils__/data/location'
import { prismaMock } from '../../../../test/__utils__/libs/prisma/singleton'

describe('locations api', () => {
  const expectedLocations = [location1, location2]

  it('ロケーション一覧をorder昇順で取得し、それを返す', async () => {
    prismaMock.location.findMany.mockResolvedValueOnce(expectedLocations)

    const result = await GET()

    expect(result.status).toBe(200)
    const response = await result.json()
    expect(response.locations.length).toBe(2)
    expect(response.locations[0].id).toBe(expectedLocations[0].id)
    expect(response.locations[0].name).toBe(expectedLocations[0].name)
    expect(response.locations[0].order).toBe(expectedLocations[0].order)
    expect(response.locations[1].id).toBe(expectedLocations[1].id)
    expect(response.locations[1].name).toBe(expectedLocations[1].name)
    expect(response.locations[1].order).toBe(expectedLocations[1].order)
  })

  it('ロケーション一覧をorder昇順で取得するよう指定する', async () => {
    prismaMock.location.findMany.mockResolvedValueOnce(expectedLocations)

    await GET()

    expect(prismaMock.location.findMany).toBeCalledWith({
      orderBy: {
        order: 'asc',
      },
    })
  })

  it('ロケーション一覧の取得に失敗した場合、既定のエラーを返す', async () => {
    console.error = vi.fn()
    const expectErrorMsg = 'query has errored!'
    prismaMock.location.findMany.mockRejectedValueOnce(expectErrorMsg)

    const result = await GET()

    expect(result.status).toBe(500)
    expect(await result.json()).toEqual({ errorCode: '500', message: 'Location fetch failed' })
    expect(console.error).toBeCalledWith(expectErrorMsg)
  })
})
