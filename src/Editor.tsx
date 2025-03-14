// Editor.tsx
import React, { useState, PointerEvent } from 'react'
import { useSnapshot } from 'valtio'
import { state } from './store'

// DnD Kit imports
import {
    DndContext,
    DragEndEvent,
    useDraggable,
} from '@dnd-kit/core'

// Utility clamp function to limit range
function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max)
}

/** Overlay for controlling decals in a 2D plane. */
export default function Editor() {
    const snap = useSnapshot(state)

    /** Fired after user finishes dragging any decal overlay. */
    function handleDragEnd(event: DragEndEvent) {
        const { active, delta } = event
        const decalId = active.id
        // Convert 2D screen px → some 3D offset. Tweak ratio to taste.
        const dx = delta.x * 0.01
        const dy = -delta.y * 0.01

        // Find the relevant decal in state
        const index = snap.decals.findIndex(d => d.id === decalId)
        if (index < 0) return

        const decal = snap.decals[index]
        const newX = clamp(decal.position[0] + dx, -1, 1)
        const newY = clamp(decal.position[1] + dy, -1, 1)

        // Update position in the Valtio store
        state.decals[index].position = [newX, newY, decal.position[2]]
    }

    return (
      <div
        style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none', // Let the Draggable elements themselves be interactive
        }}
      >
          <DndContext onDragEnd={handleDragEnd}>
              {/** Render a draggable overlay box for each decal */}
              {snap.decals.map(decal => (
                <DecalOverlay key={decal.id} decalId={decal.id} />
              ))}
          </DndContext>
      </div>
    )
}

/** Represents each decal as a draggable & resizable 2D box. */
function DecalOverlay({ decalId }: { decalId: string }) {
    const snap = useSnapshot(state)
    const decal = snap.decals.find(d => d.id === decalId)
    if (!decal) return null

    // ============ DnD-Kit Draggable ============
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: decalId,
    })

    // This <div> is just a placeholder. Position & styling is up to you.
    const style: React.CSSProperties = {
        position: 'absolute',
        width: 60,
        height: 60,
        background: 'rgba(0, 255, 0, 0.2)',
        top: 100,
        left: 100,
        pointerEvents: 'auto',
        transform: transform
          ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
          : undefined,
        border: '1px solid #0f0',
    }

    const [isResizing, setIsResizing] = useState(false)
    const [startY, setStartY] = useState(0)
    const [startScale, setStartScale] = useState(decal.scale)

    function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
        e.stopPropagation()
        setIsResizing(true)
        setStartY(e.clientY)
        setStartScale(decal.scale)
    }
    function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
        if (!isResizing) return
        const deltaY = e.clientY - startY
        // For example: dragging 100px = +0.1 scale
        const newScale = clamp(startScale + deltaY * 0.001, 0.01, 1)

        // Update the store
        const idx = snap.decals.findIndex(d => d.id === decalId)
        if (idx >= 0) {
            state.decals[idx].scale = newScale
        }
    }
    function handlePointerUp() {
        setIsResizing(false)
    }

    return (
      <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
          <p style={{ textAlign: 'center', margin: 0 }}>Decal: {decal.id}</p>

          {/** Resize handle in bottom-right corner */}
          <div
            style={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                width: 15,
                height: 15,
                background: 'red',
                cursor: 'nwse-resize',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
          />
      </div>
    )
}
