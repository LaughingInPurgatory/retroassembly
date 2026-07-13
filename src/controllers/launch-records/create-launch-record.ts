import { and, eq } from 'drizzle-orm'
import { getContext } from 'hono/context-storage'
import { HTTPException } from 'hono/http-exception'
import { launchRecordTable, romTable, statusEnum } from '#@/databases/schema.ts'

interface CreateRomParams {
  core: string
  rom: string
}

export async function createLaunchRecord(params: CreateRomParams) {
  const { currentUser, db, effectiveLibraryUserId } = getContext().var
  const { library } = db

  const [rom] = await library
    .select()
    .from(romTable)
    .where(
      and(
        eq(romTable.id, params.rom),
        eq(romTable.userId, effectiveLibraryUserId),
        eq(romTable.status, statusEnum.normal),
      ),
    )
    .limit(1)
  if (!rom) {
    throw new HTTPException(404, { message: 'ROM not found' })
  }

  const [result] = await library
    .insert(launchRecordTable)
    .values({
      core: params.core,
      platform: rom.platform,
      romId: rom.id,
      userId: currentUser.id,
    })
    .returning()

  return result
}
