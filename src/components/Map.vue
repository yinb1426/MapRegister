<template>
    <body>
        <div id="container"></div>
    </body>
</template>

<script lang="ts">
import mapboxgl, { Map } from "mapbox-gl";
import { usePointStore } from '../stores/counter'

let map: Map;
let pointClick: Object;
export default {
    name: "map",
    mounted() {
        mapboxgl.accessToken = "pk.eyJ1Ijoiam9obm55dCIsImEiOiJja2xxNXplNjYwNnhzMm5uYTJtdHVlbTByIn0.f1GfZbFLWjiEayI6hb_Qvg";    //你的accessToken
        map = new mapboxgl.Map({
            container: "container",   //地图容器的id
            center: [116, 32], //中心点
            zoom: 6.5,              //地图初始化时的层级
            style: "mapbox://styles/mapbox/navigation-preview-night-v2",   //底图样式
        });
        map.on('click', (e: any) => {
            pointClick = e.lngLat
            const pointStore = usePointStore()
            pointStore.setPoint(pointClick)
        })
    },
};
</script>



<style scoped>
body {
    margin: 0;
    padding: 0;
}

#container {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 50%;
}</style>
