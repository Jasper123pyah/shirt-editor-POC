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
            <Center>
                <Shirt />
            </Center>
        </CameraRig>
    </Canvas>
)


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
            onPointerLeave={handlePointerUp}
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

    console.log(texture)
    texture.rotation = 0;

    return (
        <mesh
            castShadow={false}
            geometry={nodes.T_Shirt_male.geometry}
            material={materials.lambert1}
            material-roughness={1}
            {...props}
            dispose={null}
        >
            {/*Borst Midden*/}
            {
                snap.position === "bm" && (
                    <Decal
                        position={[0, 0.04, 0.15]}
                        rotation={[0, 0, 0]}
                        scale={0.15}
                        map={texture}
                    />
                )
            }

            {/*Borst links*/}
            {
                snap.position === "bl" && (
                    <Decal
                        position={[0.08, 0.12, 0.09]}
                        rotation={[-0.2, 0, 0]}
                        scale={0.08}
                        map={texture}
                    />
                )
            }


            {/*Schouder links WIP*/}
            {/*<Decal*/}
            {/*    position={[0.25, 0.105, -0.02]}*/}
            {/*    rotation={[0, 0.1, 0.1]}*/}
            {/*    scale={0.06}*/}
            {/*    map={texture}*/}
            {/*/>*/}
        </mesh>
    )
}

useGLTF.preload('/shirt_baked_collapsed.glb')
;['/react.png', '/three2.png', '/pmndrs.png'].forEach(useTexture.preload)
