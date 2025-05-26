import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {useGLTF, useTexture, Decal, Environment, Center, OrbitControls, Html} from '@react-three/drei'
import { useSnapshot } from 'valtio'
import { state, loadVariants } from './store'
import * as THREE from 'three'

function useModelSizeMM(object: THREE.Object3D | undefined) {
    const sizeMM = React.useMemo(() => {
        if (!object) return null

        const box  = new THREE.Box3().setFromObject(object)
        const size = new THREE.Vector3()
        box.getSize(size)

        return size.multiplyScalar(1_000)
    }, [object])

    return sizeMM
}

// Syncs orthographic camera transforms and zoom
function CameraSync({ controlsRef }: { controlsRef: React.RefObject<any> }) {
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const euler = new THREE.Euler()

    useFrame(() => {
        const controls = controlsRef.current
        if (controls) {
            const camera = controls.object as THREE.OrthographicCamera
            camera.updateMatrixWorld()

            // Record position
            camera.getWorldPosition(pos)
            state.cameraPos = [pos.x, pos.y, pos.z]

            // Record rotation
            camera.getWorldQuaternion(quat)
            euler.setFromQuaternion(quat)
            state.cameraRot = [euler.x, euler.y, euler.z]

            // Record target
            const tgt = controls.target
            state.cameraTarget = [tgt.x, tgt.y, tgt.z]

            // Record zoom
            state.cameraZoom = camera.zoom
        }
    })

    return null
}

function OrthoFrustumSync() {
    const { camera, size } = useThree()
    const FRUSTUM_SIZE = 1              // world‑space height when zoom = 1

    useEffect(() => {
        if (!(camera instanceof THREE.OrthographicCamera)) return
        const aspect = size.width / size.height
        const halfHeight = FRUSTUM_SIZE / 2
        const halfWidth = halfHeight * aspect

        camera.left = -halfWidth
        camera.right = halfWidth
        camera.top = halfHeight
        camera.bottom = -halfHeight
        camera.updateProjectionMatrix()
    }, [camera, size.width, size.height])

    return null
}

// Overlay crosshair
export const Overlay: React.FC = () => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, width: '100%', height: '1px', backgroundColor: 'rgb(150,150,150)', transform: 'translateY(-0.5px)' }} />
        <div style={{ position: 'absolute', left: '50%', top: 0, width: '1px', height: '100%', backgroundColor: 'rgb(150,150,150)', transform: 'translateX(-0.5px)' }} />
    </div>
)

export const App: React.FC = () => {
    useEffect(() => { loadVariants() }, [])

    const controlsRef = useRef<any>()
    const snap = useSnapshot(state)

    if (!snap.model) return null

    // Destructure for brevity
    const { cameraPos, cameraZoom } = snap

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            <Canvas
                style={{ position: 'absolute', inset: 0 }}
                shadows
                orthographic
                gl={{ preserveDrawingBuffer: true }}
                onCreated={({ gl }) => gl.setPixelRatio(window.devicePixelRatio)}
                // initial camera props
                camera={{
                    position: cameraPos,
                    zoom: cameraZoom,
                    near: 0.1,
                    far: 1000,
                }}
                eventSource={document.getElementById('root')!}
                eventPrefix="client"
            >
                <OrthoFrustumSync />
                <CameraSync controlsRef={controlsRef} />

                <ambientLight intensity={0.5} />
                <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
                <directionalLight intensity={1} position={[5, 5, 5]} castShadow />

                <Center>
                    <Model />
                </Center>

                <OrbitControls
                    ref={controlsRef}
                    enableRotate
                    enablePan
                    enableZoom
                    minDistance={0.3}
                    maxDistance={2}
                    zoomSpeed={1}
                />
            </Canvas>

            <Overlay />
        </div>
    )
}

function Model() {

    const snap = useSnapshot(state)


    const pocketTexture = useTexture('/pocket.png')
    const decalTexture  = useTexture(`/${snap.decal}.png`)


    const decalScale  = snap.decalScale

    const gltf        = useGLTF(`/${snap.model!.slug}.glb`) as any
    const materialRef = useRef<any>()

    useEffect(() => {
        materialRef.current?.color.set(snap.color)
    }, [snap.color])

    const meshNode = Object.values(gltf.nodes)[1] as any
    const meshMat  = Object.values(gltf.materials)[0] as any
    materialRef.current = meshMat

    const sizeMM = useModelSizeMM(meshNode)

    useEffect(() => {
        if (!sizeMM) return

        state.modelSizeWorld = [sizeMM.x / 1_000, sizeMM.y / 1_000, sizeMM.z / 1_000]
        state.modelSizeMM    = [sizeMM.x,         sizeMM.y,         sizeMM.z]
    }, [sizeMM])

    return (
        <>

            <mesh geometry={meshNode.geometry} material={meshMat} material-roughness={1} dispose={null}>
                {snap.model!.pockets.map((pocket, i) => (
                    <Decal
                        key={`pocket-${i}`}
                        map={pocketTexture}
                        position={[pocket.decal_position_x, pocket.decal_position_y, pocket.decal_position_z]}
                        rotation={[pocket.decal_rotation_x, pocket.decal_rotation_y, pocket.decal_rotation_z]}
                        scale={pocket.decal_scale}
                        polygonOffsetFactor={-1}
                        depthTest
                    />
                ))}

                <Decal
                    debug={snap.debug}
                    map={decalTexture}
                    position={snap.decalPos}
                    rotation={snap.decalRot}
                    scale={decalScale}
                    polygonOffsetFactor={-2}
                    depthTest
                />
            </mesh>

            {sizeMM && (
                <Html>
                    {`${sizeMM.x.toFixed(0)} × ${sizeMM.y.toFixed(0)} × ${sizeMM.z.toFixed(0)} mm`}
                </Html>
            )}
        </>

    )
}
