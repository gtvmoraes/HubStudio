import test from 'node:test'
import assert from 'node:assert/strict'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ChatMarkdown from '../src/components/ChatMarkdown/ChatMarkdown.js'

const render = text => renderToStaticMarkup(createElement(ChatMarkdown, null, text))

test('assistant emphasis and lists are rendered instead of showing Markdown markers', () => {
  const html = render('Seu **perfil** está *conectado*.\n\n- Veja as redes\n- Consulte os posts')
  assert.ok(html.includes('<strong>perfil</strong>'))
  assert.ok(html.includes('<em>conectado</em>'))
  assert.ok(html.includes('<ul>'))
  assert.ok(html.includes('<li>Veja as redes</li>'))
  assert.ok(!html.includes('**perfil**'))
})

test('model output cannot embed HTML, remote images or clickable links', () => {
  const html = render('<script>alert(1)</script>\n\n[Perfil](javascript:alert(1))\n\n![imagem](https://example.test/tracker.png)\n\n[Ajuda](https://example.test)')
  assert.ok(!html.includes('<script'))
  assert.ok(!html.includes('<img'))
  assert.ok(!html.includes('<a '))
  assert.ok(html.includes('Perfil'))
  assert.ok(html.includes('Ajuda'))
})

test('plain responses and inline code remain readable', () => {
  const html = render('Vá em Configurações.\nConfira `POSTING`.')
  assert.ok(html.includes('Vá em Configurações.'))
  assert.ok(html.includes('<code>POSTING</code>'))
})
