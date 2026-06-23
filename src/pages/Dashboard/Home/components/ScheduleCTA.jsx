import { motion } from 'framer-motion'
import { LuCalendar, LuArrowRight } from 'react-icons/lu'
import Button from '../../../../components/Button/Button'
import { dashFadeUp as fadeUp } from '../../../../styles/animations'

export default function ScheduleCTA({ onSchedule }) {
  return (
    <motion.div
      className="schedule-cta"
      variants={fadeUp} initial="hidden" animate="visible" custom={9}
    >
      <LuCalendar size={32} className="schedule-cta__icon" />
      <div className="schedule-cta__text">
        <strong>Pronto para agendar seu próximo post?</strong>
        <p>Planeje, crie e agende conteúdos que gerem resultados.</p>
      </div>
      <Button
        variant="primary"
        size="md"
        iconRight={<LuArrowRight />}
        onClick={onSchedule}
      >
        Agendar agora
      </Button>
    </motion.div>
  )
}
