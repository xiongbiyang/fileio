import { beforeEach, describe, expect, it, vi } from 'vitest'

type MockDbResult = {
  results?: unknown[]
}

interface MockStatement {
  bind: ReturnType<typeof vi.fn>
}

interface MockDb {
  prepare: ReturnType<typeof vi.fn>
}

const getD1BindingMock = vi.fn()
const requireAuthSessionUserMock = vi.fn()
const readBodyMock = vi.fn()
const getRouterParamMock = vi.fn()

vi.mock('~/server/utils/d1', () => ({
  getD1Binding: getD1BindingMock,
}))

vi.mock('~/server/utils/session', () => ({
  requireAuthSessionUser: requireAuthSessionUserMock,
}))

function createErrorMock(input: { statusCode: number, statusMessage: string }) {
  const error = new Error(input.statusMessage) as Error & { statusCode: number }
  error.statusCode = input.statusCode
  return error
}

function createMockDb(options?: {
  allResult?: MockDbResult
  firstResult?: unknown
}) {
  const statement: MockStatement = {
    bind: vi.fn(() => ({
      all: vi.fn(async () => options?.allResult ?? { results: [] }),
      first: vi.fn(async () => options?.firstResult ?? null),
      run: vi.fn(async () => ({})),
    })),
  }

  const db: MockDb = {
    prepare: vi.fn(() => statement),
  }

  return { db, statement }
}

async function importHandler(path: string) {
  vi.resetModules()
  const mod = await import(path)
  return mod.default as (event: unknown) => Promise<unknown>
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('defineEventHandler', (handler: unknown) => handler)
  vi.stubGlobal('createError', createErrorMock)
  vi.stubGlobal('readBody', readBodyMock)
  vi.stubGlobal('getRouterParam', getRouterParamMock)
})

describe('/api/clipboard permission regression', () => {
  it('rejects unauthenticated users for rooms list', async () => {
    const { db } = createMockDb()
    getD1BindingMock.mockReturnValue(db)
    requireAuthSessionUserMock.mockRejectedValue(createErrorMock({
      statusCode: 401,
      statusMessage: 'Authentication required',
    }))

    const handler = await importHandler('./rooms.get')
    await expect(handler({ context: {} })).rejects.toMatchObject({ statusCode: 401 })
    expect(db.prepare).not.toHaveBeenCalled()
  })

  it('scopes room messages query by authenticated user id', async () => {
    const { db, statement } = createMockDb({
      firstResult: {
        payload_json: '[]',
        updated_at: 123,
      },
    })
    getD1BindingMock.mockReturnValue(db)
    requireAuthSessionUserMock.mockResolvedValue({ uid: 'user_1' })
    getRouterParamMock.mockReturnValue('room_a')

    const handler = await importHandler('./rooms/[roomId]/messages.get')
    await handler({ context: {} })

    expect(db.prepare).toHaveBeenCalledTimes(1)
    expect(statement.bind).toHaveBeenCalledWith('ROOM_A', 'user_1')
  })

  it('deletes room data only within authenticated user scope', async () => {
    const { db } = createMockDb()
    getD1BindingMock.mockReturnValue(db)
    requireAuthSessionUserMock.mockResolvedValue({ uid: 'owner_9' })
    getRouterParamMock.mockReturnValue('my_room')

    const handler = await importHandler('./rooms/[roomId].delete')
    await handler({ context: {} })

    expect(db.prepare).toHaveBeenCalledTimes(2)
    const firstBind = db.prepare.mock.results[0].value.bind
    const secondBind = db.prepare.mock.results[1].value.bind
    expect(firstBind).toHaveBeenCalledWith('MY_ROOM', 'owner_9')
    expect(secondBind).toHaveBeenCalledWith('MY_ROOM', 'owner_9')
  })

  it('rejects message upsert when room is not owned by current user', async () => {
    const { db, statement } = createMockDb({
      firstResult: null,
    })
    getD1BindingMock.mockReturnValue(db)
    requireAuthSessionUserMock.mockResolvedValue({ uid: 'user_404' })
    getRouterParamMock.mockReturnValue('missing_room')
    readBodyMock.mockResolvedValue({ messages: ['hello'] })

    const handler = await importHandler('./rooms/[roomId]/messages.put')
    await expect(handler({ context: {} })).rejects.toMatchObject({ statusCode: 404 })

    expect(db.prepare).toHaveBeenCalledTimes(1)
    expect(statement.bind).toHaveBeenCalledWith('MISSING_ROOM', 'user_404')
  })
})
