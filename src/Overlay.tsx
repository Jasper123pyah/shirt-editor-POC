import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AiFillCamera } from 'react-icons/ai'
import { useSnapshot } from 'valtio'
import { state } from './store'

export const Overlay: React.FC = () => {
    const transition = { type: 'spring', duration: 0.8 }
    const config = {
        initial: { x: -100, opacity: 0, transition: { ...transition, delay: 0.5 } },
        animate: { x: 0, opacity: 1, transition: { ...transition, delay: 0 } },
        exit: { x: -100, opacity: 0, transition: { ...transition, delay: 0 } },
    }

    return (
      <div
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
        }}
      >
          <AnimatePresence>
              <motion.section key="custom" {...config}>
                  <Customizer />
              </motion.section>
          </AnimatePresence>
      </div>
    )
}

const Customizer: React.FC = () => {
    const snap = useSnapshot(state)

    return (
      <div className="customizer__container">
          <div className="customizer">
              <div className="section">
                  <b>Kleuren</b>
                  <div className="color-options">
                      {snap.colors.map((color) => (
                        <div
                          key={color}
                          className="circle"
                          style={{ background: color }}
                          onClick={() => (state.color = color)}
                        ></div>
                      ))}
                  </div>
              </div>

              <div className="decals section">
                  <b>Design</b>
                  <div className="decals--container">
                      {snap.decals.map((decal) => (
                        <div
                          key={decal}
                          className="decal"
                          onClick={() => (state.decal = decal)}
                        >
                            <img src={decal + '_thumb.png'} alt="brand" />
                        </div>
                      ))}
                  </div>
              </div>

              <div className="section">
                  <b>Positie</b>
                  <div className="positions">
                      {snap.positions.map((pos) => (
                        <a className="pos" key={pos.id} onClick={() => (state.position = pos.id)}>
                            {pos.title}
                        </a>
                      ))}
                  </div>
              </div>

              <button
                className="share"
                onClick={() => {
                    const canvas = document.querySelector('canvas')
                    if (!canvas) return
                    const link = document.createElement('a')
                    link.setAttribute('download', 'canvas.png')
                    link.setAttribute(
                      'href',
                      canvas
                        .toDataURL('image/png')
                        .replace('image/png', 'image/octet-stream')
                    )
                    link.click()
                }}
              >
                  PROEFDRUK
                  <AiFillCamera size="1.3em" />
              </button>
          </div>
      </div>
    )
}
