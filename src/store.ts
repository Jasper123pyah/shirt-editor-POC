import {proxy} from 'valtio'

interface State {
    colors: string[]
    decals: string[]
    color: string
    decal: string

    positions: { id: string; title: string }[]
    position: string

    debug: boolean
    decalPos: [number, number, number]
    decalRot: [number, number, number]
    decalScale: number
    model: {
        name: string
        geometryNode: number
    }
    models: {
        name: string
        geometryNode: number
    }[]
}

export const state = proxy<State>({
    colors: ['#ccc', '#EFBD4E', '#80C670', '#726DE8', '#EF674E', '#353934'],
    decals: ['react', 'three2', 'proforto'],
    color: '#EFBD4E',
    decal: 'proforto',
    positions: [
        {id: 'bl', title: 'Borst links'},
        {id: 'bm', title: 'Borst midden'},
    ],
    position: 'bm',

    debug: false,
    decalPos: [0, -0.04, -0.65],    // X, Y, Z
    decalRot: [0, 0, 0],       // Euler angles X, Y, Z
    decalScale: 0.3,           // Decal scale (percentage or direct)
    model: {
        name: 'helm',
        geometryNode: 0,
    },
    models: [
        {name: 'helm', geometryNode: 0},
        {name: 'broek', geometryNode: 1},
        {name: 'shirt', geometryNode: 1},
    ],
})
