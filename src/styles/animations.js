// Variants de animação reaproveitados em várias telas.

// Páginas auth (Login, Cadastro): stagger nos campos do formulário.
export const formContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.5 } },
}

export const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
}

// Dashboard pages (Home, Redes): fade-up curto com stagger por índice.
export const dashFadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4 } }),
}
