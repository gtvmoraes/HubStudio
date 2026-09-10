import { LuCompass } from 'react-icons/lu'
import { useTour } from './TourProvider'

/**
 * Botão "Refazer tour". Só aparece dentro do DashboardLayout (onde o
 * TourProvider existe) — fora dele, não renderiza nada.
 */
export default function RestartTourButton({ label = 'Refazer tour', className = '' }) {
  const tour = useTour()
  if (!tour) return null

  return (
    <button
      type="button"
      className={`tour-restart ${className}`.trim()}
      onClick={tour.restart}
    >
      <LuCompass size={15} />
      {label}
    </button>
  )
}
