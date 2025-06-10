import React from 'react'
import {createRoot} from 'react-dom/client'
import './styles.css'
import {App as CanvasApp} from './Canvas'
import {Overlay} from './Overlay'

const rootElement = document.getElementById('root')
if (!rootElement) {
    throw new Error("Root element not found")
}

export const Crosshair: React.FC = () => (
    <div style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none'}}>
        <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: '100%',
            height: '1px',
            backgroundColor: 'rgb(150,150,150)',
            transform: 'translateY(-0.5px)'
        }}/>
        <div style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            width: '1px',
            height: '100%',
            backgroundColor: 'rgb(150,150,150)',
            transform: 'translateX(-0.5px)'
        }}/>

    </div>
)

createRoot(rootElement).render(
    <div style={{position: 'relative', width: '100%', height: '100%'}}>
        <CanvasApp/>
        <Overlay/>
        <Crosshair/>
    </div>
)
