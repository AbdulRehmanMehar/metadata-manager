<template>
    <div class="main" v-if="!!currentWorkspace">
<!--        <h1 style="text-align: center;-->
<!--    margin-bottom: 20px;-->
<!--    font-size: 24px;-->
<!--    font-weight: bold;">{{ currentWorkspace.name }}</h1>-->
        <div  v-if="!!currentWorkspace.groups && currentWorkspace.groups.length > 0">
                <div v-for="group of currentWorkspace.groups" :key="group.id" style="overflow: auto; margin: 10px 0px; position: relative;">
                    <table>
                        <thead>
                            <tr @dragover="allowDrop($event)" @drop="handleDrop($event)" :data-process-app='JSON.stringify(group)'>
                                <th colspan="6">
                                    <span title="Click to Edit" style="float: left;" contenteditable="true"
                                          @keyup.prevent="updateTitle($event, 'group', group.id)"
                                          @input.prevent="updateTitle($event, 'group', group.id)"
                                          @blur.prevent="updateTitle($event, 'group', group.id)"
                                          @paste.prevent="updateTitle($event, 'group', group.id)"
                                    >{{ group.title || 'none' }}</span>
                                    <div class="controls" style="position: absolute; left: 87%">
                                        <span title="Export" @click.prevent="exportGroup(group)">
                                            <i class="fas fa-file-export"></i>
                                        </span>
                                        <span title="Save Session | Rewrite" @click.prevent="rewriteSession(group)">
                                            <i class="fas fa-box-archive"></i>
                                        </span>
                                        <span title="Open | Launch Session" @click.prevent="launchSession(group)">
                                            <i class="fas fa-arrow-up-right-from-square"></i>
                                        </span>
                                        <span title="Edit Session" @click.prevent="editSession(group)">
                                            <i class="fas fa-pencil"></i>
                                        </span>

<!--                                        <span title="Share via Email" @click.prevent="shareSession(group, 'mail')">-->
<!--                                            <i class="fas fa-share-nodes"></i>-->
<!--                                        </span>-->

<!--                                        <span title="Share via Whatsapp" @click.prevent="shareSession(group, 'wp')">-->
<!--                                            <i class="fab fa-whatsapp"></i>-->
<!--                                        </span>-->
                                    </div>

                                </th>
                            </tr>
                        </thead>
                        <tbody v-if="!!group.data && group.data.length > 0">
                            <tr colspan="2" @dragover="allowDrop($event)" @drop="handleDrop($event)" :data-process-app='JSON.stringify(group)'>
                                <td style="width: 200px !important; max-width: 200px !important;"
                                >
                                    <pre style="white-space: pre-line; width: 200px !important;"
                                        title="Click to Edit" contenteditable="true"
                                      @keyup.prevent="updateTitle($event, 'url', group.id)"
                                      @input.prevent="updateTitle($event, 'url', group.id)"
                                      @blur.prevent="updateTitle($event, 'url', group.id)"
                                      @paste.prevent="updateTitle($event, 'url', group.id)"
                                    >
                                        {{ group.data[0].title.trim() || 'none' }}
                                    </pre>
                                </td>
                                <td colspan="3" style="overflow-x: auto !important; width: calc(100% - 200px) !important;">
                                    <div style="overflow: auto; max-height: 150px;">
                                        <code v-for="data of group.data" :key="data.id" :title="data.url" @click.prevent="openExternal" style="display: block; margin: 10px 0px; cursor: pointer !important; -webkit-user-drag: element;"
                                        draggable="true" @dragstart="handleDrag($event)" :data-process-data='JSON.stringify(data)' >{{ data.url }}</code>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
        </div>
        <div class="btns">
            <button @click.prevent="handleFileSelection">Import from file</button>
            <input type="file" style="display: none" ref="importFile" accept=".txt" @change="importGroup">
            <button @click.prevent="rewriteSession(null)">Create a new one</button>
        </div>
    </div>
    <div style="padding: 20px;" v-else>
        <h1 v-if="workspaces.length == 0">Create a Workspace to continue</h1>
        <h1 v-else>Choose a Workspace from sidebar</h1>
    </div>
    <UrlChooser :show="showUrlChooser" :urls="urls"></UrlChooser>
</template>

<script>
import { Options, Vue } from "vue-class-component";
import UrlChooser from './UrlChooser';

@Options({
    components: {
        UrlChooser
    }
})
export default class Explorer extends Vue {

    data() {
        return {
            showUrlChooser: false,
            urls: [],
            currentGroup: null,

            groupTitleUpdation: ''
        }
    }

    get workspaces() {
        return this.$store.getters.workspaces;
    }

    get currentWorkspace() {
        return this.$store.getters.currentWorkspace;
    }


    async exportGroup(group) {
        let body = `${group.title}\n`;
        if (!!group.data && group.data.length > 0) {
            body += `${group.data[0].title}\n`;
            for (const data of group.data) {
                body += data.url + "\n";
            }
        }
        const el = document.createElement('a');
        const file = new Blob([body], {type: "text/plain"});
        el.href = URL.createObjectURL(await file);
        el.download = `${group.title}.txt`;
        el.click();
    }

    async rewriteSession(group) {
        const urls = await window.darwin_scripts.getChromeData();

        if (group)
            this.urls = [...urls, ...group.data];
        else
            this.urls = urls;
        this.showUrlChooser = true;
        this.currentGroup = group;
        // this.$store.dispatch('addMetaData', { workspaceId: this.currentWorkspace.id, GroupTitle: group.title });
        // setTimeout(() => {
        //     this.$store.dispatch('destroyGroup', group.id);
        // }, 1000);
    }

    async editSession(group) {
         this.urls = group.data;
        this.showUrlChooser = true;
        this.currentGroup = group;
    }

    async performSessionRewrite() {
        let payload = { workspaceId: this.currentWorkspace.id, data: this.urls };
        if (!!this.currentGroup) {
            payload.GroupTitle = this.currentGroup.title;
            payload.urlsTitle = !!this.currentGroup.data && this.currentGroup.data.length > 0 ? this.currentGroup.data[0].title : this.currentGroup.title;
        }
        payload = JSON.parse(JSON.stringify(payload));
        // console.log(payload)
        if (!!this.currentGroup) {
            this.$store.dispatch('destroyGroup', this.currentGroup.id).then(async () => {
                await this.$store.dispatch('addMetaData', payload);
                this.showUrlChooser = false;
                this.urls = [];
                this.currentGroup = null;
                setTimeout(() => {
                    this.$store.dispatch('loadWorkspaces');
                }, 1000);
            });
        } else {
            await this.$store.dispatch('addMetaData', payload);
            this.showUrlChooser = false;
            this.urls = [];
            this.currentGroup = null;
            setTimeout(() => {
                this.$store.dispatch('loadWorkspaces');
            }, 1000);
        }
    }

    launchSession(group) {
        window.darwin_scripts.restoreApplicationWithData(JSON.stringify(group))
    }

    shareSession(group, method) {
        let body = "", href = "";
        if (!!group.data && group.data.length > 0) {
            for (const data of group.data) {
                body += `${data.url}\n`;
            }
        }
        if (method == 'mail')
            href = `mailto:?subject="MetaData Application - Group {${group.title}}"&body=${body}`;
        else href = `https://wa.me/?text=${"MetaData Application\n" + body}`;
        window.general.openExternalLink(href);
    }

    openExternal($event) {
        const href = $event.target.title;
        window.general.openExternalLink(href);

    }

    addMetaData() {
        this.$store.dispatch('addMetaData', { workspaceId: this.currentWorkspace.id });
    }

    handleFileSelection() {
        this.$refs.importFile.click();
    }

    async importGroup() {
        const file = this.$refs.importFile.files[0];
        let data = await file.text();
        data = data.split('\n');

        const groupTitle = data[0];
        const internalTitle = data[1];

        const customData = [];

        for (let i=2; i < data.length; i++) {
            if (data[i] != "") {
                const obj = {
                    title: internalTitle,
                    url: data[i]
                };

                customData.push(obj);
            }
        }

        this.$store.dispatch('createGroupByImportedData', { workspaceId: this.currentWorkspace.id, GroupTitle: groupTitle, data: customData, urlTitle: internalTitle });
    }

    removeFromUrls(idx) {
        this.urls = this.urls.filter((url, id) => id != idx);
    }


    handleDrop($event) {
        $event.preventDefault();
        let new_app;
        let paths = $event.path;
        for (let path of paths) {
            if (path.tagName == 'TR') {
                new_app = JSON.parse(path.getAttribute('data-process-app'));
            }
        }

        let meta_data = JSON.parse($event.dataTransfer.getData('AppMetaData'));
        // this.$store.dispatch('changeMetaDataBelongingApplication', { new_app, meta_data });
        let group = new_app;
        let url = meta_data;
        
        this.$store.dispatch('moveUrlToGroup', { groupId: group.id, urlId: url.id });
    }

    handleDrag($event) {
        let data = $event.target.getAttribute('data-process-data');
        $event.dataTransfer.setData('AppMetaData', data);
        $event.dataTransfer.dropEffect = "move";
    }

    handleDragerOver($event) {
        setTimeout(() => {
            $event.target.click();
        }, 700);

    }

    allowDrop($event) {
        $event.preventDefault();
    }

    updateTitle($event, type, id) {
        if ($event.type == 'blur') {
            $event.preventDefault();
            $event.target.innerText = this.groupTitleUpdation;
            this.$store.dispatch('updateTitle', { typeofTitle: type, groupId: id, newTitle: this.groupTitleUpdation });
            setTimeout(() => {
                this.groupTitleUpdation = '';
            }, 200);
            return false;
        } else {
            this.groupTitleUpdation = $event.target.innerText;
        }
    }

    async addUrlManually() {
        const url = await window.general.promptDialogue('Url', 'Add the URL');
        if (!!url) {
            this.urls.push({
                title: '',
                url
            });
        }
    }

}
</script>


<style scoped>
.main {
    padding: 20px 30px;
    overflow-y: auto;
    margin-bottom: 50px;
    height: calc(100vh - 100px);
}


.main > .btns {
    width: 100%;
}

.main > .btns button {
    width: calc(50% - 20px);
    margin: 10px;
}

th {
    font-size: 18px;
}

th > .controls {
    float: right;
}

th > .controls span {
    margin: 0 5px;
    cursor: pointer !important;
}

table {
  border: 1px solid #ccc;
  margin: 20px 0;
  padding: 0;
  width: 100%;
  table-layout: auto;
}

table caption {
  font-size: 1.5em;
  margin: .5em 0 .75em;
}

table tr, table tr td{
  border: 1px solid #ddd;
  padding: .35em;
}

table tr td {
    max-height: 200px !important;
    overflow-y: auto;
}

table th,
table td {
  padding: .625em;
  text-align: center;
}

table th {
  font-size: .85em;
  letter-spacing: .1em;
  text-transform: uppercase;
}

@media screen and (max-width: 600px) {
  table {
    border: 0;
  }

  table caption {
    font-size: 1.3em;
  }

  table thead {
    border: none;
    clip: rect(0 0 0 0);
    height: 1px;
    margin: -1px;
    overflow: hidden;
    padding: 0;
    position: absolute;
    width: 1px;
  }

  table tr {
    border-bottom: 3px solid #ddd;
    display: block;
    margin-bottom: .625em;
  }

  table td {
    border-bottom: 1px solid #ddd;
    display: block;
    font-size: .8em;
    text-align: right;
  }

  table td::before {
    /*
    * aria-label has no advantage, it won't be read inside a table
    content: attr(aria-label);
    */
    content: attr(data-label);
    float: left;
    font-weight: bold;
    text-transform: uppercase;
  }

  table td:last-child {
    border-bottom: 0;
  }
}




table tr td {
    text-align: left !important;
}

.disabled {
    pointer-events: none;
    cursor: not-allowed;
}


</style>