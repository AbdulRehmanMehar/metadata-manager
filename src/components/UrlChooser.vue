<template>
    <div class="main" v-if="show">
        <h1 style="text-align: center;
    margin-bottom: 50px;
    font-size: 24px;
    font-weight: bold;">Delete the Urls you don't want to be stored</h1>
        <ul v-if="!!urls && urls.length > 0">
            <li v-for="(url, idx) of urls" :key="idx" style="margin: 10px 0px;">
                <span style="display: inline-block; margin-right: 10px">
                    {{ url.url }}
                </span>
                <span @click.prevent="$parent.removeFromUrls(idx)" style="color: #f00; cursor: pointer !important;"><i class="fas fa-trash"></i></span>
            </li>
        </ul>

        <div style="float: right;">
            <button @click.prevent="$parent.addUrlManually()">Add URL Manually</button>
            <button @click.prevent="$parent.performSessionRewrite()">Done </button>
            </div>
    </div>
</template>

<script>
import { Options, Vue } from "vue-class-component";

@Options({
    props: {
        show: Boolean,
        urls: Array
    }
})
export default class UrlChooser extends Vue {

}
</script>

<style scoped>
.main {
    position: absolute;
    top: 70px;
    left: 0;
    right: 0;
    height: 300px !important;
    width: 70% !important;
    background: #3c3c3c;
    color: #cccccc;
    z-index: 999;
    margin: 0 auto;
    overflow-y: auto;
}
</style>