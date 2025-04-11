import React, {useRef, useState, PointerEvent} from 'react'
import {Canvas, ReactThreeFiber, useFrame} from '@react-three/fiber'
import {useGLTF, useTexture, Decal, Environment, Center} from '@react-three/drei'
import {easing} from 'maath'
import {useSnapshot} from 'valtio'
import {state} from './store'
import {OrbitControls} from '@react-three/drei'
import * as THREE from 'three'

declare global {
    namespace JSX {
        interface IntrinsicElements {
            mesh: ReactThreeFiber.Object3DNode<THREE.Mesh, typeof THREE.Mesh>
            group: ReactThreeFiber.Object3DNode<THREE.Group, typeof THREE.Group>
            ambientLight: ReactThreeFiber.Object3DNode<THREE.AmbientLight, typeof THREE.AmbientLight>
            directionalLight: ReactThreeFiber.Object3DNode<THREE.DirectionalLight, typeof THREE.DirectionalLight>
        }
    }
}

/** Props for the main <App> component */
interface AppProps {
    position?: [number, number, number]
}

/** The main Canvas + 3D scene setup */
export const App: React.FC<AppProps> = ({
                                            position = [0, 0, 2.5],
                                        }) => {
    const fov = 60

    return (
        <Canvas
            shadows
            camera={{position, fov}}
            gl={{preserveDrawingBuffer: true}}
            eventSource={document.getElementById('root')!}
            eventPrefix="client"
        >
            {/* Ambient + Environment for overall light */}
            <ambientLight intensity={0.5}/>
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr"/>

            {/* Additional directional light */}
            <directionalLight
                intensity={1}
                position={[5, 5, 5]}
                castShadow
            />

            <Center>
                <Model/>
            </Center>

            <OrbitControls
                enableRotate={true}
                enablePan={true}
                enableZoom={true}
                minDistance={0.5}
                maxDistance={3}
                zoomSpeed={1}
            />
        </Canvas>
    )
}

type ModelProps = JSX.IntrinsicElements['mesh']

function Model(props: ModelProps) {
    const snap = useSnapshot(state)
    const texture = useTexture(`/${snap.decal}.png`)


    const gltf = useGLTF(`/${snap.model.name}.glb`) as any
    const {nodes, materials} = gltf
    const geometry = nodes[Object.keys(nodes)[snap.model.geometryNode]].geometry
    const material = materials[Object.keys(materials)[0]]

    useFrame((_, delta) => {
        easing.dampC(material.color, snap.color, 0.25, delta)
    })

    return (
        <mesh
            geometry={geometry}
            material={material}
            material-roughness={1}
            dispose={null}
            {...props}
        >
            <Decal
                debug={snap.debug}
                position={snap.decalPos}
                rotation={snap.decalRot}
                scale={snap.decalScale}
                map={texture}
                polygonOffsetFactor={-1}
                depthTest
            />
        </mesh>
    )
}
