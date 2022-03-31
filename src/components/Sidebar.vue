<template>
    <div class="sidebar">
        <div class="content">
            <h2 style="margin: 5px 0;">Workspaces</h2>
            <div v-if="!!workspaces && workspaces.length > 0">
                <input type="text" @keyup="filterWorkspaces" ref="search" placeholder="Search" style="width: 90%;">
                <ul v-for="workspace of workspaces" :key="workspace.id" style="margin: 10px 0">
                    <li @click.prevent="setWorkspace(workspace.id)" :style="{ pointerEvents: workspace.name == 'No result' ? 'none' : 'all' }" @dragover="handleDragerOver">{{ workspace.name }}</li>
                </ul>
            </div>
            <button @click.prevent="createWorkspace">+</button>
        </div>

        <button @click.prevent="imprintMode">Imprint</button>
    </div>
</template>

<script>
import { Options, Vue } from 'vue-class-component';

@Options({})
export default class Sidebar extends Vue {
    data() {
        return {
            searchFilter: ''
        }
    }

    get workspaces() {
        let workspaces = this.$store.getters.workspaces;
        if (this.searchFilter == '') return workspaces;
        workspaces = workspaces.filter(el => JSON.stringify(el).toLowerCase().match(this.searchFilter.toLowerCase(), 'i'));
        return !!workspaces && workspaces.length > 0 ? workspaces : [{id: 99, name: 'No result'}];
    }

    get currentWorkspace() {
        return this.$store.getters.currentWorkspace;
    }

    createWorkspace() {
        this.$store.dispatch('createWorkspace');
    }

    setWorkspace(id) {
        this.$store.dispatch('setCurrentWorkspace', id);
    }

    filterWorkspaces() {
        this.searchFilter = this.$refs.search.value;
    }

    imprintMode() {
        this.$store.dispatch('setMode', 'imprint');
    }
    handleDragerOver($event) {
        setTimeout(() => {
            $event.target.click();
        }, 700);
    }
}
</script>

<style scoped>
.sidebar {
    width: 20vw;
    height: 100vh;
    background-color: #1e2428;
    border-right: 1px solid rgba(0,0,0,0.4);
    float: left;
}
.sidebar .content {
    margin: 30px 20px;
    height: calc(100vh - 150px);
    overflow: auto;
}

button {
    margin: 10px 0;
    width: 100%;
    cursor: pointer !important;
}

ul li {
    cursor: pointer !important;
    margin: 3px 0;
}
</style>