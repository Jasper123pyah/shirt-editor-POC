import React, { useRef, useState, PointerEvent } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Decal, Environment, Center } from '@react-three/drei'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'
import { state } from './store'

/** Props for the main <App> component */
interface AppProps {
    position?: [number, number, number]
    fov?: number
}

/** The main Canvas + 3D scene setup */
export const App: React.FC<AppProps> = ({
                                            position = [0, 0, 2.5],
                                            fov = 25,
                                        }) => {
    return (
      <Canvas
        shadows
        camera={{ position, fov }}
        gl={{ preserveDrawingBuffer: true }}
        eventSource={document.getElementById('root')!}
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
}

/** Props for the <CameraRig> component (children are 3D objects) */
interface CameraRigProps {
    children?: React.ReactNode
}

/** Handles dragging/rotation of the shirt in the scene */
const CameraRig: React.FC<CameraRigProps> = ({ children }) => {
    const group = useRef<THREE.Group>(null)
    const snap = useSnapshot(state)

    // Local rotation state
    const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0])

    // Track drag state
    const [isDragging, setIsDragging] = useState(false)
    const dragStart = useRef<[number, number]>([0, 0])
    const rotationStart = useRef<[number, number, number]>([0, 0, 0])

    const handlePointerDown = (e: PointerEvent<HTMLElement>) => {
        setIsDragging(true)
        dragStart.current = [e.clientX, e.clientY]
        rotationStart.current = [...rotation]
    }

    const handlePointerMove = (e: PointerEvent<HTMLElement>) => {
        if (!isDragging) return

        const deltaX = e.clientX - dragStart.current[0]
        const deltaY = e.clientY - dragStart.current[1]

        // Adjust rotation – tweak 0.01 to taste
        setRotation([
            rotationStart.current[0] + deltaY * 0.01,
            rotationStart.current[1] + deltaX * 0.01,
            0,
        ])
    }

    const handlePointerUp = () => {
        setIsDragging(false)
    }

    // Update camera position & apply rotation each frame
    useFrame((st, delta) => {
        // Intro animation moves the camera slightly
        easing.damp3(
          st.camera.position,
          [0, 0, 2],
          0.25,
          delta
        )
        if (group.current) {
            group.current.rotation.x = rotation[0]
            group.current.rotation.y = rotation[1]
        }
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

/** Props for the <Shirt> component; extend mesh props if needed */
type ShirtProps = JSX.IntrinsicElements['mesh']

/** 3D Shirt model that supports color & decal updates */
function Shirt(props: ShirtProps) {
    const snap = useSnapshot(state)
    const texture = useTexture(`/${snap.decal}.png`)

    // If you generated type definitions via gltfjsx, use them;
    // here we cast to 'any' for brevity
    const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb') as any

    // Animate the shirt color
    useFrame((_, delta) => {
        easing.dampC(materials.lambert1.color, snap.color, 0.25, delta)
    })

    texture.rotation = 0

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
          {snap.position === 'bm' && (
            <Decal
              position={[0, 0.04, 0.15]}
              rotation={[0, 0, 0]}
              scale={0.15}
              map={texture}
            />
          )}

          {/*Borst links*/}
          {snap.position === 'bl' && (
            <Decal
              position={[0.08, 0.12, 0.09]}
              rotation={[-0.2, 0, 0]}
              scale={0.08}
              map={texture}
            />
          )}

          {/* Example for another decal (commented out in original) */}
          {/* <Decal
        position={[0.25, 0.105, -0.02]}
        rotation={[0, 0.1, 0.1]}
        scale={0.06}
        map={texture}
      /> */}
      </mesh>
    )
}

useGLTF.preload('/shirt_baked_collapsed.glb')
;['/react.png', '/three2.png', '/pmndrs.png'].forEach(useTexture.preload)
