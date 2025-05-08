import {proxy} from 'valtio'

interface State {
    colors: string[]
    color: string
    decal: string

    debug: boolean
    decalPos: [number, number, number]
    decalRot: [number, number, number]
    decalScale: number
    model: {
        name: string
        url: string | null
    }
    models: {
        name: string
        url: string | null
    }[]

    cameraPos: [number, number, number]
    cameraRot: [number, number, number]
    cameraTarget: [number, number, number]
}

export const state = proxy<State>({
    colors: ['#ccc', '#EFBD4E', '#80C670', '#726DE8', '#EF674E', '#353934'],
    color: '#bbb',
    decal: 'pocket',
    debug: false,
    decalPos: [0, 0.17, 0.13],    // X, Y, Z
    decalRot: [0, 0, 0],       // Euler angles X, Y, Z
    decalScale: 0.12,           // Decal scale (percentage or direct)
    model: {
        name: 'shirt',
        url: null
    },
    models: [
        {name: 'lange_broek', url: null},
        {name: 'shirt', url: null},
        {name: 'longsleeve', url: null},
        {name: 'overall_lange_mouwen', url: null},
        {name: 'overhemd_korte_mouwen', url: null},
        {name: 'overhemd_lange_mouwen', url: null},
        {name: 'polo_korte_mouwen', url: null},
        {name: 'polo_lange_mouwen', url: null},
        {name: 'trui', url: null},
        {name: 'hoodie', url: null},
        {name: 'bodywarmer', url: null},
        {name: 'vest_met_zip', url: null},
        {name: 'korte_broek', url: null},
        {name: 'tuinbroek', url: null},
        {name: 'schort_lang', url: null},
        {name: 'schort_kort', url: null},
        {name: 'pet', url: null},
        {name: 'labjas', url: null},
        {name: 'koksbuis', url: null},
        {name: 'muts', url: null},
        {name: 'gilet', url: null},
    ],

    cameraPos: [0, 0, 2.5],
    cameraRot: [0, 0, 0],
    cameraTarget: [0, 0, 0],
})
