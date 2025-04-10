import React from 'react'
import {useSnapshot} from 'valtio'
import {state} from './store'

export const Overlay: React.FC = () => {
    const snap = useSnapshot(state)
    const [openOverlay, setOpenOverlay] = React.useState(false);

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
            <button className={'open-overlay'} onClick={() => setOpenOverlay(!openOverlay)}>
                {openOverlay ? "Close" : "Open"} overlay
            </button>
            <div className={`customizer__container`} style={{display: openOverlay ? 'flex' : ''}}>
                <div className="customizer">
                    {/* Existing Color Section */}
                    <div className="section">
                        <b>Kleuren</b>
                        <div className="color-options">
                            {snap.colors.map((color) => (
                                <div
                                    key={color}
                                    className="circle"
                                    style={{background: color}}
                                    onClick={() => (state.color = color)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Existing Decals Section */}
                    <div className="decals section">
                        <b>Design</b>
                        <div className="decals--container">
                            {snap.decals.map((decal) => (
                                <div
                                    key={decal}
                                    className="decal"
                                    onClick={() => (state.decal = decal)}
                                >
                                    <img src={decal + '_thumb.png'} alt="brand"/>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="section" style={{width: "100%"}}>
                        <b>Debug</b>
                        <div className="debug">
                            <input
                                type="checkbox"
                                checked={snap.debug}
                                onChange={(e) => (state.debug = e.target.checked)}
                            />
                            <label>Debug Mode</label>
                        </div>
                        <b>Decal Transforms</b>
                        {/* Position Sliders */}
                        <label>Position X: {snap.decalPos[0]}</label>
                        <input
                            type="range"
                            min={-1}
                            max={1}
                            step={0.01}
                            value={snap.decalPos[0]}
                            onChange={(e) => {
                                const x = parseFloat(e.target.value)
                                state.decalPos = [x, snap.decalPos[1], snap.decalPos[2]]
                            }}
                        />

                        <label>Position Y: {snap.decalPos[1]}</label>
                        <input
                            type="range"
                            min={-1}
                            max={1}
                            step={0.01}
                            value={snap.decalPos[1]}
                            onChange={(e) => {
                                const y = parseFloat(e.target.value)
                                state.decalPos = [snap.decalPos[0], y, snap.decalPos[2]]
                            }}
                        />

                        <label>Position Z: {snap.decalPos[2]}</label>
                        <input
                            type="range"
                            min={-1}
                            max={1}
                            step={0.01}
                            value={snap.decalPos[2]}
                            onChange={(e) => {
                                const z = parseFloat(e.target.value)
                                state.decalPos = [snap.decalPos[0], snap.decalPos[1], z]
                            }}
                        />

                        {/* Rotation Sliders */}
                        <label>Rotation X: {snap.decalRot[0].toFixed(3)}</label>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.01}
                            value={snap.decalRot[0]}
                            onChange={(e) => {
                                const rx = parseFloat(e.target.value)
                                state.decalRot = [rx, snap.decalRot[1], snap.decalRot[2]]
                            }}
                        />

                        <label>Rotation Y: {snap.decalRot[1].toFixed(3)}</label>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.01}
                            value={snap.decalRot[1].toFixed(3)}
                            onChange={(e) => {
                                const ry = parseFloat(e.target.value)
                                state.decalRot = [snap.decalRot[0], ry, snap.decalRot[2]]
                            }}
                        />

                        <label>Rotation Z: {snap.decalRot[2].toFixed(3)}</label>
                        <input
                            type="range"
                            min={-Math.PI}
                            max={Math.PI}
                            step={0.01}
                            value={snap.decalRot[2]}
                            onChange={(e) => {
                                const rz = parseFloat(e.target.value)
                                state.decalRot = [snap.decalRot[0], snap.decalRot[1], rz]
                            }}
                        />

                        {/* Scale Slider */}
                        <label>Scale: {snap.decalScale}</label>
                        <input
                            type="range"
                            min={0.01}
                            max={1}
                            step={0.01}
                            value={snap.decalScale}
                            onChange={(e) => {
                                state.decalScale = parseFloat(e.target.value)
                            }}
                        />
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
                    </button>
                </div>
            </div>
        </div>
    )
}
