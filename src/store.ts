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
        geometryNode: number,
        url: string | null
    }
    models: {
        name: string
        geometryNode: number,
        url: string | null
    }[]

    cameraPos: [number, number, number]
    cameraRot: [number, number, number]
    cameraTarget: [number, number, number]
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
        url: null
    },
    models: [
        {name: 'lange_broek', geometryNode: 1, url: null},
        {name: 'shirt', geometryNode: 1, url: null},
        {name: 'longsleeve', geometryNode: 1, url: null},
        {name: 'overall_lange_mouwen', geometryNode: 1, url: null},
        {name: 'overhemd_korte_mouwen', geometryNode: 1, url: null},
        {name: 'overhemd_lange_mouwen', geometryNode: 1, url: null},
        {name: 'polo_korte_mouwen', geometryNode: 1, url: null},
        {name: 'polo_lange_mouwen', geometryNode: 1, url: null},
        {name: 'trui', geometryNode: 1, url: null},
    ],

    cameraPos: [0, 0, 2.5],
    cameraRot: [0, 0, 0],
    cameraTarget: [0, 0, 0],
})
