import React, {useEffect, useLayoutEffect, useRef} from 'react'
import {Canvas, useFrame, useThree} from '@react-three/fiber'
import {useGLTF, useTexture, Decal, Environment, Center, OrbitControls} from '@react-three/drei'
import {useSnapshot} from 'valtio'
import {state, loadVariants} from './store'
import * as THREE from 'three'

function useModelSizeMM(object: THREE.Object3D | undefined) {
    const sizeMM = React.useMemo(() => {
        if (!object) return null

        const box = new THREE.Box3().setFromObject(object)
        const size = new THREE.Vector3()
        box.getSize(size)

        return size.multiplyScalar(1000)
    }, [object])

    return sizeMM
}

// Syncs orthographic camera transforms and zoom
function CameraSync({controlsRef}: { controlsRef: React.RefObject<any> }) {
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
    const {camera, size} = useThree()
    const FRUSTUM_SIZE = 1

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

export const App: React.FC = () => {
    useEffect(() => {
        loadVariants()
    }, [])

    const controlsRef = useRef<any>()
    const snap = useSnapshot(state)

    if (!snap.model) return null

    // Destructure for brevity
    const {cameraPos, cameraZoom} = snap

    return (
            <Canvas
                style={{position: 'absolute', inset: 0}}
                shadows
                orthographic
                gl={{preserveDrawingBuffer: true}}
                onCreated={({gl}) => gl.setPixelRatio(window.devicePixelRatio)}
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
                <OrthoFrustumSync/>
                <CameraSync controlsRef={controlsRef}/>

                <ambientLight intensity={0.5}/>
                <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr"/>
                <directionalLight intensity={1} position={[5, 5, 5]} castShadow/>

                <Center>
                    <Model/>
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
    )
}

function Model() {
    const snap = useSnapshot(state)

    const pocketTexture = useTexture('/pocket.png')
    const decalTexture = useTexture(`/${snap.decal}.png`)

    const gltf = useGLTF(`/${snap.model!.slug}.glb`) as any
    const materialRef = useRef<any>()

    useEffect(() => {
        materialRef.current?.color.set(snap.color)
    }, [snap.color])

    const meshNode = Object.values(gltf.nodes)[1] as any
    const meshMat = Object.values(gltf.materials)[0] as any
    materialRef.current = meshMat

    const sizeMM = useModelSizeMM(meshNode)

    useLayoutEffect(() => {
        if (!sizeMM) return

        state.modelSizeWorld = [sizeMM.x / 1_000, sizeMM.y / 1_000, sizeMM.z / 1_000]
        state.modelSizeMM = [sizeMM.x, sizeMM.y, sizeMM.z]

    }, [sizeMM])

    const mmToWorldX = state.modelSizeWorld[0] / state.modelSizeMM[0]
    const mmToWorldY = state.modelSizeWorld[1] / state.modelSizeMM[1]

    const decalScale = [
        state.decalWidth  * mmToWorldX,
        state.decalHeight * mmToWorldY,
        0.08
    ]
    return (
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
    )
}
