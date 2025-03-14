import { proxy } from 'valtio'

interface Position {
  id: string
  title: string
}

interface State {
  colors: string[]
  decals: string[]
  color: string
  decal: string
  positions: Position[]
  position: string
}

export const state = proxy<State>({
  colors: ['#ccc', '#EFBD4E', '#80C670', '#726DE8', '#EF674E', '#353934'],
  decals: ['react', 'three2', 'proforto'],
  color: '#EFBD4E',
  decal: 'three2',
  positions: [
    { id: 'bl', title: 'Borst links' },
    { id: 'bm', title: 'Borst midden' },
  ],
  position: 'bl',
})
