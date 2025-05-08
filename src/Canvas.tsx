import React, { useEffect, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Decal, Environment, Center, OrbitControls } from '@react-three/drei'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'
import { state, loadVariants } from './store'
import * as THREE from 'three'

function CameraSync({ controlsRef }: { controlsRef: React.RefObject<any> }) {
    const pos = new THREE.Vector3()
    const quat = new THREE.Quaternion()
    const euler = new THREE.Euler()

    useFrame(() => {
        const controls = controlsRef.current
        if (controls) {
            const camera = controls.object as THREE.PerspectiveCamera
            camera.updateMatrixWorld()
            camera.getWorldPosition(pos)
            state.cameraPos = [pos.x, pos.y, pos.z]

            camera.getWorldQuaternion(quat)
            euler.setFromQuaternion(quat)
            state.cameraRot = [euler.x, euler.y, euler.z]

            const tgt = controls.target
            state.cameraTarget = [tgt.x, tgt.y, tgt.z]
        }
    })
    return null
}

export const App: React.FC = () => {
    useEffect(() => { loadVariants() }, [])

    const controlsRef = useRef<any>()
    const snap = useSnapshot(state)

    if (!snap.model) return null

    return (
        <Canvas
            shadows
            camera={{ position: state.cameraPos, fov: 60 }}
            gl={{ preserveDrawingBuffer: true }}
            eventSource={document.getElementById('root')!}
            eventPrefix="client"
        >
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
    )
}

function Model() {
    const snap = useSnapshot(state)

    const pocketTexture = useTexture('/pocket.png')
    const decalTexture  = useTexture(`/${snap.decal}.png`)

    const gltf = useGLTF(`/${snap.model!.slug}.glb`) as any

    const materialRef = useRef<any>()
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.color.set(snap.color)
        }
    }, [snap.color])

    const meshNode   = Object.values(gltf.nodes)[1] as any
    const meshMat    = Object.values(gltf.materials)[0] as any
    materialRef.current = meshMat

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
                scale={snap.decalScale}
                polygonOffsetFactor={-2}
                depthTest
            />
        </mesh>
    )
}

