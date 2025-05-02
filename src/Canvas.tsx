import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Decal, Environment, Center, OrbitControls } from '@react-three/drei'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'
import { state } from './store'
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
    const snap = useSnapshot(state)
    const controlsRef = useRef<any>()

    return (
        <Canvas
            shadows
            camera={{ position: state.cameraPos, fov: 60 }}
            gl={{ preserveDrawingBuffer: true }}
            eventSource={document.getElementById('root')!}
            eventPrefix="client"
        >
            {/* Sync camera each frame */}
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
                minDistance={snap.minZoom}
                maxDistance={snap.maxZoom}
                zoomSpeed={1}
            />
        </Canvas>
    )
}

function Model(props: JSX.IntrinsicElements['mesh']) {
    const snap = useSnapshot(state)
    const texture = useTexture(`/${snap.decal}.png`)
    const pocketTexture = useTexture(`/pocket.png`)
    const path = snap.model.url ?? `/${snap.model.name}.glb`
    const gltf = useGLTF(path) as any
    const { nodes, materials } = gltf
    const geometry = nodes[Object.keys(nodes)[snap.model.geometryNode]].geometry
    const material = materials[Object.keys(materials)[0]]

    useFrame((_, delta) => {
        easing.dampC(material.color, snap.color, 0.25, delta)
    })

    return (
        <mesh geometry={geometry} material={material} material-roughness={1} dispose={null} {...props}>
            <Decal position={[0.1, 0.17, 0.08]} rotation={[0, 0, 0]} scale={0.1} map={pocketTexture} polygonOffsetFactor={-1} depthTest />
            <Decal debug={snap.debug} position={snap.decalPos} rotation={snap.decalRot} scale={snap.decalScale} map={texture} polygonOffsetFactor={-2} depthTest />
        </mesh>
    )
}