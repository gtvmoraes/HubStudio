import test from 'node:test'
import assert from 'node:assert/strict'
import { watchTourClick } from '../src/components/Tour/watchTourClick.js'
import { STEPS } from '../src/components/Tour/steps.js'

const settle = () => new Promise(resolve => setTimeout(resolve, 15))

function target() {
  const element = new EventTarget()
  const button = { disabled: false }
  element.closest = () => button
  element.contains = candidate => candidate === button
  element.querySelector = () => null
  return { element, button }
}

test('network selection advances only after the selected control exists', async () => {
  const { element } = target()
  let advanced = 0
  const selector = STEPS.find(step => step.id === 'composer-networks').completeSelector
  const cleanup = watchTourClick(element, () => advanced++, { completeSelector: selector, delay: 0 })
  try {
    element.dispatchEvent(new Event('click'))
    await settle()
    assert.equal(advanced, 0)
    element.querySelector = query => query === selector ? {} : null
    element.dispatchEvent(new Event('click'))
    await settle()
    assert.equal(advanced, 1)
  } finally { cleanup() }
})

test('empty space and disabled network controls do not advance the tour', async () => {
  const { element, button } = target()
  let advanced = 0
  const cleanup = watchTourClick(element, () => advanced++, { delay: 0 })
  try {
    button.disabled = true
    element.dispatchEvent(new Event('click'))
    button.disabled = false
    element.closest = () => null
    element.dispatchEvent(new Event('click'))
    await settle()
    assert.equal(advanced, 0)
  } finally { cleanup() }
})

test('leaving a step cancels delayed advancement from a previous click', async () => {
  const { element } = target()
  let advanced = 0
  const cleanup = watchTourClick(element, () => advanced++, { delay: 0 })
  element.dispatchEvent(new Event('click'))
  cleanup()
  await settle()
  assert.equal(advanced, 0)
})

test('rapid clicks advance once rather than skipping the AI tools', async () => {
  const { element } = target()
  let advanced = 0
  const cleanup = watchTourClick(element, () => advanced++, { delay: 0 })
  try {
    element.dispatchEvent(new Event('click'))
    element.dispatchEvent(new Event('click'))
    await settle()
    assert.equal(advanced, 1)
  } finally { cleanup() }
})
