import { defineStore } from 'pinia'

let point:Object = {}

export const usePointStore = defineStore('POINT',{
  state:()=>{
    return {point:point}
  },
  getters:{

  },
  actions:{
    setPoint(point0:Object) {
      this.point = point0
    }
  }
})