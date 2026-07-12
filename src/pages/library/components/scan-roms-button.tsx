import { Button } from '@radix-ui/themes'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { client } from '#@/api/client.ts'
import { libraryModeEnum } from '#@/databases/schema.ts'
import { useGlobalLoaderData } from '#@/pages/hooks/use-global-loader-data.ts'
import { useRouter } from '../hooks/use-router.ts'

// Imports files dropped directly onto the storage volume under roms/<platform>/.
// New roms simply show up in the library after the reload; nothing else to report.
export function ScanRomsButton() {
  const { t } = useTranslation()
  const { currentUser } = useGlobalLoaderData()
  const { reload } = useRouter()
  const [loading, setLoading] = useState(false)

  if (currentUser?.libraryMode === libraryModeEnum.shared) {
    return null
  }

  async function handleClick() {
    setLoading(true)
    try {
      await client.roms.scan.$post()
      await reload()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button disabled={loading} onClick={handleClick} variant='soft'>
      <span className={loading ? 'icon-[mdi--loading] animate-spin' : 'icon-[mdi--folder-search-outline]'} />
      {t('common.scan')}
    </Button>
  )
}
