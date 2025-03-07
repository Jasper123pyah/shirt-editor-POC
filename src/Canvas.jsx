import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, AccumulativeShadows, RandomizedLight, Decal, Environment, Center } from '@react-three/drei'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'
import { state } from './store'

export const App = ({ position = [0, 0, 2.5], fov = 25 }) => (
    <Canvas
        shadows
        camera={{ position, fov }}
        gl={{ preserveDrawingBuffer: true }}
        eventSource={document.getElementById('root')}
        eventPrefix="client"
    >
        <ambientLight intensity={0.5 * Math.PI} />
        <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
        <CameraRig>
            <Backdrop />
            <Center>
                <Shirt />
            </Center>
        </CameraRig>
    </Canvas>
)

function Backdrop() {
    const shadows = useRef()
    useFrame((state, delta) =>
        easing.dampC(shadows.current.getMesh().material.color, state.color, 0.25, delta)
    )
    return (
        <AccumulativeShadows
            ref={shadows}
            temporal
            frames={60}
            alphaTest={0.85}
            scale={5}
            resolution={2048}
            rotation={[Math.PI / 2, 0, 0]}
            position={[0, 0, -0.14]}
        >
            <RandomizedLight
                amount={4}
                radius={9}
                intensity={0.55 * Math.PI}
                ambient={0.25}
                position={[5, 5, -10]}
            />
            <RandomizedLight
                amount={4}
                radius={5}
                intensity={0.25 * Math.PI}
                ambient={0.55}
                position={[-5, 5, -9]}
            />
        </AccumulativeShadows>
    )
}

function CameraRig({ children }) {
    const group = useRef()
    const snap = useSnapshot(state)

    // Local rotation state
    const [rotation, setRotation] = useState([0, 0, 0])

    // Track drag state
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef([0, 0])
    const rotationStart = useRef([0, 0, 0])

    const handlePointerDown = (e) => {
        setIsDragging(true)
        // Record the pointer’s screen coords and current rotation
        dragStart.current = [e.clientX, e.clientY]
        rotationStart.current = [...rotation]
    }

    const handlePointerMove = (e) => {
        if (!isDragging) return

        // Calculate how far the pointer has moved since the last pointerDown
        const deltaX = e.clientX - dragStart.current[0]
        const deltaY = e.clientY - dragStart.current[1]

        // Adjust rotation – tweak 0.01 to taste
        setRotation([
            rotationStart.current[0] + deltaY * 0.01,
            rotationStart.current[1] + deltaX * 0.01,
            0
        ])
    }

    const handlePointerUp = () => {
        setIsDragging(false)
    }

    // Update camera position & apply rotation each frame
    useFrame((state, delta) => {
        easing.damp3(
            state.camera.position,
            [snap.intro ? -state.viewport.width / 4 : 0, 0, 2],
            0.25,
            delta
        )
        group.current.rotation.x = rotation[0]
        group.current.rotation.y = rotation[1]
    })

    return (
        <group
            ref={group}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp} // stops drag if mouse leaves
        >
            {children}
        </group>
    )
}

function Shirt(props) {
    const snap = useSnapshot(state)
    const texture = useTexture(`/${snap.decal}.png`)
    const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb')
    useFrame((state, delta) =>
        easing.dampC(materials.lambert1.color, snap.color, 0.25, delta)
    )

    return (
        <mesh
            castShadow
            geometry={nodes.T_Shirt_male.geometry}
            material={materials.lambert1}
            material-roughness={1}
            {...props}
            dispose={null}
        >
            <Decal
                position={[0, 0.04, 0.15]}
                rotation={[0, 0, 0]}
                scale={0.15}
                map={texture}
            />
        </mesh>
    )
}

useGLTF.preload('/shirt_baked_collapsed.glb')
;['/react.png', '/three2.png', '/pmndrs.png'].forEach(useTexture.preload)
