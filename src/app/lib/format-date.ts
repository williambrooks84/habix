import { parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'

export function formatIsoForUi(iso?: string | null): string {
  if (!iso) return ''
  try {
    return format(parseISO(iso), 'PPP', { locale: fr })
  } catch {
    return String(iso)
  }
}

export default formatIsoForUi
