// Canvas.tsx
import React, { useRef, useState, PointerEvent } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Center, Environment, useGLTF, useTexture, Decal } from '@react-three/drei'
import { easing } from 'maath'
import { useSnapshot } from 'valtio'

import { state } from './store'
import Editor from './Editor'

export const App: React.FC = () => {
  return (
    <>
      <Canvas
        shadows
        camera={{ position: [0, 0, 2.5], fov: 25 }}
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
      <Editor />
    </>
  )
}

/** Allows the user to click & drag the shirt to rotate it */
function CameraRig({ children }: { children?: React.ReactNode }) {
  const group = useRef<THREE.Group>(null)

  // Local rotation state
  const [rotation, setRotation] = useState<[number, number, number]>([0, 0, 0])
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
    setRotation([
      rotationStart.current[0] + deltaY * 0.01,
      rotationStart.current[1] + deltaX * 0.01,
      0,
    ])
  }

  const handlePointerUp = () => {
    setIsDragging(false)
  }

  useFrame((state, delta) => {
    // Damp camera if needed
    easing.damp3(state.camera.position, [0, 0, 2], 0.25, delta)
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

/** Shirt model that displays multiple decals from the store. */
function Shirt() {
  const snap = useSnapshot(state)
  const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb') as any

  // Animate base shirt color
  useFrame((_, delta) => {
    easing.dampC(materials.lambert1.color, snap.color, 0.25, delta)
  })

  return (
    <mesh
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-roughness={1}
      dispose={null}
    >
      {snap.decals.map((decal) => {
        const texture = useTexture(decal.texture)
        return (
          <Decal
            key={decal.id}
            position={decal.position}
            rotation={[0, 0, 0]}
            scale={decal.scale}
            map={texture}
          />
        )
      })}
    </mesh>
  )
}

// Preload assets
useGLTF.preload('/shirt_baked_collapsed.glb')
;['/react.png', '/three2.png', '/pmndrs.png'].forEach(useTexture.preload)
