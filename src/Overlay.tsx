import React from 'react'
import {useSnapshot} from 'valtio'
import {state} from './store'

export const Overlay: React.FC = () => {
    const snap = useSnapshot(state)
    const [openOverlay, setOpenOverlay] = React.useState(false)

    const screenShot = () => {
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
    }

    const handleModelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const url = URL.createObjectURL(file)
        state.models = [...snap.models, { name: url, geometryNode: 1, url }]
        state.model = { name: url, geometryNode: 1, url }
    }

    const exportState = () => {
        const data = {
            minZoom: snap.minZoom,
            maxZoom: snap.maxZoom,
            decalPos: snap.decalPos,
            decalRot: snap.decalRot,
            decalScale: snap.decalScale,
            modelName: snap.model.name,
            cameraPos: snap.cameraPos,
            cameraRot: snap.cameraRot,
            cameraTarget: snap.cameraTarget,
        }
        const json = JSON.stringify(data, null, 2)
        const blob = new Blob([json], {type: 'application/json'})
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = snap.model.name + '-scene-settings.json'
        link.click()
        URL.revokeObjectURL(url)
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
            <button className={'open-overlay'} onClick={() => setOpenOverlay(!openOverlay)}>
                {openOverlay ? 'Close' : 'Open'} overlay
            </button>
            <div className={`customizer__container`} style={{display: openOverlay ? 'flex' : ''}}

            >
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

                    <div className="decals section">
                        <b>Model</b>
                        <div className="decals--container">
                            <select
                                className="decals--dropdown"
                                onChange={(e) => {
                                    const selectedModel = snap.models.find((model) => model.name === e.target.value)
                                    if (selectedModel) state.model = selectedModel
                                }}
                                value={snap.model.name}
                            >
                                {snap.models.map((model) => (
                                    <option key={model.name} value={model.name}>
                                        {model.name}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={snap.model.geometryNode}
                                onChange={e => state.model.geometryNode = parseInt(e.target.value)}
                            />
                            <input
                                type="file"
                                accept=".glb"
                                onChange={handleModelUpload}
                                style={{ marginLeft: '8px' }}
                            />
                        </div>
                    </div>

                    <div className="section" style={{width: '100%'}}>
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
                        <label>
                            Position X:{' '}
                            <input
                                className={'value-display'}
                                value={snap.decalPos[0]}
                                onChange={(e) => {
                                    const x = parseFloat(e.target.value)
                                    state.decalPos = [x, snap.decalPos[1], snap.decalPos[2]]
                                }}
                            />
                        </label>
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

                        <label>
                            Position Y:{' '}
                            <input
                                className={'value-display'}
                                value={snap.decalPos[1]}
                                onChange={(e) => {
                                    const y = parseFloat(e.target.value)
                                    state.decalPos = [snap.decalPos[0], y, snap.decalPos[2]]
                                }}
                            />
                        </label>
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

                        <label>
                            Position Z:{' '}
                            <input
                                className={'value-display'}
                                value={snap.decalPos[2]}
                                onChange={(e) => {
                                    const z = parseFloat(e.target.value)
                                    state.decalPos = [snap.decalPos[0], snap.decalPos[1], z]
                                }}
                            />
                        </label>
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
                        <label>
                            Rotation X:{' '}
                            <input
                                className={'value-display'}
                                value={snap.decalRot[0].toFixed(3)}
                                onChange={(e) => {
                                    const rx = parseFloat(e.target.value)
                                    state.decalRot = [rx, snap.decalRot[1], snap.decalRot[2]]
                                }}
                            />
                        </label>
                        <input
                            type="range"
                            min={-Math.PI - 0.001}
                            max={Math.PI + 0.001}
                            step={Math.PI / 2}
                            value={snap.decalRot[0]}
                            onChange={(e) => {
                                const rx = parseFloat(e.target.value)
                                state.decalRot = [rx, snap.decalRot[1], snap.decalRot[2]]
                            }}
                        />

                        <label>
                            Rotation Y:{' '}
                            <input
                                className={'value-display'}
                                value={snap.decalRot[1].toFixed(3)}
                                onChange={(e) => {
                                    const ry = parseFloat(e.target.value)
                                    state.decalRot = [snap.decalRot[0], ry, snap.decalRot[2]]
                                }}
                            />
                        </label>
                        <input
                            type="range"
                            min={-Math.PI - 0.001}
                            max={Math.PI + 0.001}
                            step={Math.PI / 2}
                            value={snap.decalRot[1]}
                            onChange={(e) => {
                                const ry = parseFloat(e.target.value)
                                state.decalRot = [snap.decalRot[0], ry, snap.decalRot[2]]
                            }}
                        />

                        <label>
                            Rotation Z:{' '}
                            <input
                                className={'value-display'}
                                value={snap.decalRot[2].toFixed(3)}
                                onChange={(e) => {
                                    const rz = parseFloat(e.target.value)
                                    state.decalRot = [snap.decalRot[0], snap.decalRot[1], rz]
                                }}
                            />
                        </label>
                        <input
                            type="range"
                            min={-Math.PI - 0.001}
                            max={Math.PI + 0.001}
                            step={Math.PI / 2}
                            value={snap.decalRot[2]}
                            onChange={(e) => {
                                const rz = parseFloat(e.target.value)
                                state.decalRot = [snap.decalRot[0], snap.decalRot[1], rz]
                            }}
                        />

                        {/* Scale Slider */}
                        <label>
                            Scale:{' '}
                            <input
                                className={'value-display'}
                                value={snap.decalScale}
                                onChange={(e) => {
                                    state.decalScale = parseFloat(e.target.value)
                                }}
                            />
                        </label>
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

                    <div className={"decals section"}>
                        <b>Scene settings</b>
                        <label>
                            Min zoom:{' '}
                            <input
                                className={'value-display'}
                                value={snap.minZoom}
                                onChange={(e) => {
                                    const x = parseFloat(e.target.value)
                                    state.minZoom = x
                                }}
                            />
                        </label>
                        <input
                            type="range"
                            min={0.2}
                            max={1}
                            step={0.1}
                            value={snap.minZoom}
                            onChange={(e) => {
                                const x = parseFloat(e.target.value)
                                state.minZoom = x
                            }}
                        />
                        <label>
                            Max zoom:{' '}
                            <input
                                className={'value-display'}
                                value={snap.maxZoom}
                                onChange={(e) => {
                                    const x = parseFloat(e.target.value)
                                    state.maxZoom = x
                                }}
                            />
                        </label>
                        <input
                            type="range"
                            min={1}
                            max={2}
                            step={0.1}
                            value={snap.maxZoom}
                            onChange={(e) => {
                                const x = parseFloat(e.target.value)
                                state.maxZoom = x
                            }}
                        />
                    </div>

                    <button
                        className="share"
                        onClick={exportState}
                    >
                        EXPORT
                    </button>
                </div>
            </div>
        </div>
    )
}