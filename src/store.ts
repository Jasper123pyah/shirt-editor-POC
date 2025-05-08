import {proxy} from 'valtio'

type Pocket = {
    decal_position_x: number
    decal_position_y: number
    decal_position_z: number
    decal_rotation_x: number
    decal_rotation_y: number
    decal_rotation_z: number
    decal_scale: number
}

export type ModelVariant = {
    name: string
    slug: string
    pockets: Pocket[]
}

function mapJson(raw: any): ModelVariant[] {
    return raw.models.map((m: any) => ({
        name: m.name,
        slug: m.modelName,
        pockets: m.pockets ?? []
    }))
}

interface State {
    colors: string[]
    color: string
    decal: string
    debug: boolean

    model: ModelVariant
    models: ModelVariant[]

    decalPos: [number, number, number]
    decalRot: [number, number, number]
    decalScale: number

    cameraPos: [number, number, number]
    cameraRot: [number, number, number]
    cameraTarget: [number, number, number]
}

export const state = proxy<State>({
    colors: ['#ccc', '#EFBD4E', '#80C670', '#726DE8', '#EF674E', '#353934'],
    color: '#bbb',
    decal: 'pocket',
    debug: false,

    model: {
        name: 'Initial Shirt',
        slug: 'shirt',
        pockets: []
    },
    models: [{
        name: 'Shirt',
        slug: 'shirt',
        pockets: []
    }],

    decalPos: [0, 0.17, 0.13],
    decalRot: [0, 0, 0],
    decalScale: 0.12,

    cameraPos: [0, 0, 2.5],
    cameraRot: [0, 0, 0],
    cameraTarget: [0, 0, 0],
})

export async function loadVariants() {
    console.log('load')
    const res = await fetch('/models.json')
    const json = await res.json()
    console.log(json)
    state.models = mapJson(json)
    if (!state.model) state.model = state.models[0]
}
