import { createElement } from 'react'
import Markdown from 'react-markdown'

export default function ChatMarkdown({ children }) {
  return createElement('div', { className: 'sup-chat__markdown' },
    createElement(Markdown, {
      skipHtml: true,
      disallowedElements: ['a', 'img'],
      unwrapDisallowed: true,
    }, children))
}
