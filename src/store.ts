import {proxy} from 'valtio'

interface State {
    colors: string[]
    decals: string[]
    color: string
    decal: string

    positions: { id: string; title: string }[]
    position: string

    minZoom: number
    maxZoom: number

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
    color: '#bbb',
    decal: 'proforto',
    positions: [
        {id: 'bl', title: 'Borst links'},
        {id: 'bm', title: 'Borst midden'},
    ],
    position: 'bm',
    minZoom: 0.3,
    maxZoom: 2,
    debug: false,
    decalPos: [0, 0.17, 0.13],    // X, Y, Z
    decalRot: [0, 0, 0],       // Euler angles X, Y, Z
    decalScale: 0.12,           // Decal scale (percentage or direct)
    model: {
        name: 'shirt',
        geometryNode: 1,
    },
    models: [
        {name: 'lange_broek', geometryNode: 1},
        {name: 'shirt', geometryNode: 1},
        {name: 'polo', geometryNode: 1},
        {name: 'longsleeve', geometryNode: 1},
        {name: 'overall_lange_mouwen', geometryNode: 1},
        {name: 'overhemd_korte_mouwen', geometryNode: 1},
        {name: 'overhemd_lange_mouwen', geometryNode: 1},
    ],
})
