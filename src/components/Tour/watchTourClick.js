// Aguarda a atualização da tela antes de avançar e cancela cliques pendentes
// ao mudar de etapa. Cliques no espaço vazio ou em controles bloqueados não contam.
export function watchTourClick(element, next, { completeSelector, delay = 450 } = {}) {
  let timer
  const onClick = (event) => {
    const button = event.target.closest?.('button')
    if (!button || !element.contains(button) || button.disabled) return
    clearTimeout(timer)
    timer = setTimeout(() => {
      if (!completeSelector || element.querySelector(completeSelector)) next()
    }, delay)
  }
  element.addEventListener('click', onClick)
  return () => {
    clearTimeout(timer)
    element.removeEventListener('click', onClick)
  }
}
