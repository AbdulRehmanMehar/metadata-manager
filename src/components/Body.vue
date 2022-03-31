<template>
    <div class="body">
        <div v-if="mode == 'standard'">
            <Sidebar />
            <Explorer />
        </div>
        <div v-else>
            <h1>Imprint Mode...</h1>
            <button @click.prevent="standardMode">Switch to Standard Mode</button>
        </div>
    </div>
</template>

<script>
import Sidebar from './Sidebar';
import Explorer from './Explorer';
import { Options, Vue } from "vue-class-component";

@Options({
    components: {
        Sidebar,
        Explorer
    }
})
export default class Body extends Vue {

    get mode() {
        return this.$store.getters.mode;
    }

    standardMode() {
        this.$store.dispatch('setMode', 'standard');
    }

}
</script>

<style scoped>
.body{
    height: 100vh;
    width: 100vw;
    background: #282c34;
}

</style>