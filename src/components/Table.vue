<script setup lang="ts">
import { reactive, ref } from 'vue'
import { usePointStore } from '../stores/counter'

const pointStore = usePointStore()
console.log(pointStore.point)
let _jsonData = {}
const startDate: number = 9000000000
const hourList: number[] = Array.from(new Array(24).keys())
const minuteList: number[] = Array.from(new Array(60).keys())
const secondList: number[] = Array.from(new Array(60).keys())

//日期与时分秒转Date类型
function stringToDate(str: any, hour: number, minute: number, second: number): Date {
    const [y, m, d] = str.split('-')
    return new Date(+y, m - 1, +d, hour, minute, second, 0)
}

//将公元纪年转换为以-9000000000年为基准的绝对日期，输出为Map<number,number>类型
function transformDate(dateInput: Date): Map<number, number> {
    let dateOutput: Map<number, number> = new Map()
    let second: number = dateInput.getSeconds()
    let minute: number = dateInput.getMinutes()
    let hour: number = dateInput.getHours()
    let date: number = dateInput.getDate()
    let month: number = dateInput.getMonth() + 1
    let year: number = dateInput.getFullYear() + startDate
    let tempYear: number[] = []
    for (let i = 0; i < 10; i++) {
        let value: number = year % 10
        tempYear.push(value)
        year = Math.trunc(year / 10)
    }
    tempYear.reverse()
    for (let i = 0; i < 10; i++) {
        dateOutput.set(i, tempYear[i])
    }
    dateOutput.set(10, month)
    dateOutput.set(11, date)
    dateOutput.set(12, hour)
    dateOutput.set(13, minute)
    dateOutput.set(14, second)

    return dateOutput
}

//Map<number,number>转对象类型
function mapToObj(map: Map<number, number>):Object {
    let obj = Object.create(null);
    for (let [k, v] of map) {
        obj[k] = v;
    }
    return obj;
}

//根据经纬度得到geohash值，输出为字符串
function geoHash(lng: number, lat: number): string {
    let lngList: number[] = []
    let latList: number[] = []
    let totalList: number[] = []
    let left: number = -180.0, right: number = 180.0, mid: number
    let iter: number = 0
    let maxIteration: number = 15
    const Base32 = function (str: any) {
        let num: any = str
        if (typeof num == "string") {
            num = Number(str)
        }
        if (num >= 0 && num <= 9) {
            return num.toString()
        } else if (num >= 10 && num <= 16) {
            return String.fromCharCode(98 + str - 10)
        } else if (num >= 17 && num <= 18) {
            return String.fromCharCode(106 + str - 17)
        } else if (num >= 19 && num <= 20) {
            return String.fromCharCode(109 + str - 19)
        } else if (num >= 21 && num <= 31) {
            return String.fromCharCode(112 + str - 21)
        }
    }

    while (iter < maxIteration) {
        mid = (left + right) / 2.0
        if (lng > mid) {
            lngList.push(1)
            left = mid
        }
        else {
            lngList.push(0)
            right = mid
        }
        iter++
    }
    iter = 0, left = -90.0, right = 90.0
    while (iter < maxIteration) {
        mid = (left + right) / 2.0
        if (lat > mid) {
            latList.push(1)
            left = mid
        }
        else {
            latList.push(0)
            right = mid
        }
        iter++
    }
    iter = 0
    while (iter < maxIteration) {
        totalList.push(lngList[iter])
        totalList.push(latList[iter])
        iter++
    }
    let geohash = ''
    for (let k = 0; k < totalList.length; k = k + 5) {
        let arr = totalList.slice(k, k + 5)
        let sum = parseInt(arr.join(''), 2)
        let base32 = Base32(sum)
        geohash += base32
    }
    return geohash
}
interface timeData {
    date: Date,
    hour: number,
    minute: number,
    second: number
}
// interface spatialData {
//     lng: number,
//     lat: number
// }

const newTimeData = reactive<timeData>(
    {
        date: new Date(),
        hour: 0,
        minute: 0,
        second: 0
    }
)

// const newSpatialData = reactive<spatialData>(
//     {
//         lng: pointStore.point.lng,
//         lat: pointStore.point.lat
//     }
// )

const propertyValueList: string[] = reactive([])
let valueList: string[] = []
let propertySet = new Set<string>()
let propertyMap = new Map()
const propertyInput = ref("")
const valueInput = ref("")

function SetPropertyMap(propertyMap: Map<string, string>, propertySet: Set<string>, value: string[]): Map<string, string> {
    const propertyArray = [...propertySet]
    for (let i = 0; i < propertySet.size; i++) {
        const _property = propertyArray[i]
        const _value = value[i]
        propertyMap.set(_property, _value)
    }
    return propertyMap
}

function createProperty() {
    if (propertyInput.value.trim() && valueInput.value.trim()) {
        const pair: string = `${propertyInput.value}：${valueInput.value}`
        if (!propertySet.has(propertyInput.value)) {
            propertySet.add(propertyInput.value)
            valueList.push(valueInput.value)
            propertyValueList.push(pair)
            propertyInput.value = ""
            valueInput.value = ""
        }
    }
}

// function uploadProperty() {
//     SetPropertyMap(propertyMap, propertySet, valueList)
//     propertyValueList.splice(0)
//     valueList.splice(0)
//     propertySet.clear()
//     alert("上传成功")
//     console.log(propertyMap);
// }

function uploadData() {
    
    const date: Map<number, number> = transformDate(stringToDate(newTimeData.date, newTimeData.hour, newTimeData.minute, newTimeData.second))
    const dateObj = mapToObj(date)
    const geohash: string = geoHash(pointStore.point.lng, pointStore.point.lat)
    SetPropertyMap(propertyMap, propertySet, valueList)
    const propertyObj = mapToObj(propertyMap)
    newTimeData.date = new Date()
    newTimeData.hour = 0
    newTimeData.minute = 0
    newTimeData.second = 0
    // newSpatialData.lng = 0
    // newSpatialData.lat = 0
    propertyValueList.splice(0)
    valueList.splice(0)
    propertySet.clear()
    pointStore.point.lng = 0
    pointStore.point.lat = 0
    const data = { "time": dateObj, "spatial": geohash, "property": propertyObj}
    const jsonData: string = JSON.stringify(data)
    alert("提交成功")
    _jsonData = jsonData
    console.log(_jsonData)
}



</script>

<template>
    <body>
        <div id="register">
        <h1>注册器</h1>
        <div>
            <h3>时间:</h3>
            <h3>
                <input type="date" v-model="newTimeData.date">
                <select v-model="newTimeData.hour">
                    <option v-for="item in hourList">{{ item }}</option>
                </select>
                时
                <select v-model="newTimeData.minute">
                    <option v-for="item in minuteList">{{ item }}</option>
                </select>
                分
                <select v-model="newTimeData.second">
                    <option v-for="item in secondList">{{ item }}</option>
                </select>
                秒
            </h3>
        <hr /> 
        <h3>地点:</h3>
        <h3>
            经度：{{ pointStore.point.lng }}<br />
            纬度：{{ pointStore.point.lat }}
        </h3>
        <hr /> 
        <h3>属性：</h3>
        <select size="5">
            <option v-for="propertyValue in propertyValueList" :key="propertyValue">{{ propertyValue }}</option>
        </select><br />
        <label>属性: <input v-model="propertyInput"></label><br />
        <label>值: <input v-model="valueInput"></label>
        <button @click="createProperty">创建</button><br />
        <hr />  
        </div>
        <button @click="uploadData">提交</button>
        </div>
    </body>
</template>

<style>
body {
    margin-right:30%;
    padding:0
}
</style>