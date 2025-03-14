import React from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { App as CanvasApp } from './Canvas'
import { Overlay } from './Overlay'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <>
    <CanvasApp />
    <Overlay />
  </>
)
