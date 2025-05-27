import React from 'react'
import {useSnapshot} from 'valtio'
import {state} from './store'

export const Overlay: React.FC = () => {
    const snap = useSnapshot(state)

    if (!snap.model) return null

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

    function updateDecalScale() {
        const mmToWorldX = state.modelSizeWorld[0] / state.modelSizeMM[0]
        const mmToWorldY = state.modelSizeWorld[1] / state.modelSizeMM[1]

        if (!mmToWorldX || !mmToWorldY) return   // model not ready yet

        const widthWorld = state.decalWidth * mmToWorldX  // metres
        const heightWorld = state.decalHeight * mmToWorldY  // metres
        const depthWorld = 0.08

        state.decalScale = [widthWorld, heightWorld, depthWorld]
    }


    const exportState = () => {
        const data = {
            decal_position_x: snap.decalPos[0],
            decal_position_y: snap.decalPos[1],
            decal_position_z: snap.decalPos[2],
            decal_rotation_x: snap.decalRot[0],
            decal_rotation_y: snap.decalRot[1],
            decal_rotation_z: snap.decalRot[2],
            decal_scale: snap.decalScale,
            width: snap.decalWidth,
            height: snap.decalHeight,
            camera_position_x: snap.cameraPos[0],
            camera_position_y: snap.cameraPos[1],
            camera_position_z: snap.cameraPos[2],
            camera_rotation_x: snap.cameraRot[0],
            camera_rotation_y: snap.cameraRot[1],
            camera_rotation_z: snap.cameraRot[2],
            camera_target_x: snap.cameraTarget[0],
            camera_target_y: snap.cameraTarget[1],
            camera_target_z: snap.cameraTarget[2],
            camera_zoom: snap.cameraZoom,
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

    const stopEvent = (e: React.SyntheticEvent) => {
        e.stopPropagation();
    };


    return (
        <>
            <button className={'open-overlay'} onClick={() => setOpenOverlay(!openOverlay)}>
                {openOverlay ? 'Close' : 'Open'} overlay
            </button>
            <div className={`customizer`} style={{display: openOverlay ? 'flex' : ''}}
                 onWheelCapture={stopEvent}
                 onPointerDownCapture={stopEvent}
                 onPointerMoveCapture={stopEvent}
                 onPointerUpCapture={stopEvent}
                 onPointerCancelCapture={stopEvent}
            >
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

                <div className="decals section">
                    <b>Model</b>
                    <div className="decals--container model">
                        <select
                            className="decals--dropdown"
                            onChange={(e) => {
                                const selectedModel = state.models.find(
                                    (model) => model.name === e.target.value)
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
                    </div>
                </div>

                <div className="section" style={{width: '100%'}}>
                    <b>Decal Transforms</b>
                    <div className="debug">
                        <input
                            type="checkbox"
                            checked={snap.debug}
                            onChange={(e) => (state.debug = e.target.checked)}
                        />
                        <label>Debug Mode</label>
                    </div>
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
                        step={0.01}
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
                        step={0.01}
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
                        step={0.01}
                        value={snap.decalRot[2]}
                        onChange={(e) => {
                            const rz = parseFloat(e.target.value)
                            state.decalRot = [snap.decalRot[0], snap.decalRot[1], rz]
                        }}
                    />
                    <label>
                        Decal Width in MM:{' '}
                        <input
                            className="value-display"
                            value={snap.decalWidth}
                            onChange={(e) => {
                                state.decalWidth = parseInt(e.target.value, 10)
                                updateDecalScale()
                            }}
                        />
                    </label>
                    <input
                        type="range"
                        min={1}
                        max={1000}
                        step={1}
                        value={snap.decalWidth}
                        onChange={(e) => {
                            state.decalWidth = parseInt(e.target.value, 10)
                            updateDecalScale()
                        }}
                    />

                    <label>
                        Decal Height in MM:{' '}
                        <input
                            className="value-display"
                            value={snap.decalHeight}
                            onChange={(e) => {
                                state.decalHeight = parseInt(e.target.value, 10)
                                updateDecalScale()
                            }}
                        />
                    </label>

                    <input
                        type="range"
                        min={1}
                        max={1000}
                        step={1}
                        value={snap.decalHeight}
                        onChange={(e) => {
                            state.decalHeight = parseInt(e.target.value, 10)
                            updateDecalScale()
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
        </>
    )
}