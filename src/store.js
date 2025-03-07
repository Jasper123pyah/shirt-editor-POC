import { proxy } from 'valtio'

const state = proxy({
  colors: ['#ccc', '#EFBD4E', '#80C670', '#726DE8', '#EF674E', '#353934'],
  decals: ['react', 'three2', 'proforto'],
  color: '#EFBD4E',
  decal: 'three2',
  positions: [{id:'bl', title: 'Borst links'},{id:'bm', title: 'Borst midden'}],
  position: 'bl'
})

export { state }
