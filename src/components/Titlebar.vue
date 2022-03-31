<template>
    <div class="Titlebar">
        <div class="title-wrapper">
            <div class="title" title="Current Workspace" v-if="!!currentWorkspace">{{ currentWorkspace.name }}</div>
            <div class="title" v-else>Create or Choose Workpsace</div>
        </div>

        <div class="leftBtns">
            <select>
                <option>Meta Data Manager</option>
            </select>
        </div>
    </div>
</template>

<script>
import { Options, Vue } from "vue-class-component";

@Options({})
export default class Titlebar extends Vue {
    get currentWorkspace() {
        return  this.$store.getters.currentWorkspace;
    }
}
</script>

<style scoped>

.Titlebar{
    width: 100%;
    height: 36px;
    font-size: 12px;
    position: relative;
    background: #3c3c3c;
    -webkit-app-region: drag;
    z-index: 99;
    user-select: none;
}
.leftBtns{
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    -webkit-app-region: no-drag;
    margin-left: 70px;
}

.leftBtns select {
    color: #f9f9f9;
    border: none;
    outline: none;
    background: transparent;
    border-left: 2px solid #ccc;
    padding: 0 5px;
    float: left;
    margin-top: 10px;
    pointer-events: none;
}
.leftBtns i{
    display: inline-block;
    width: 1px;
    margin: 5px;
    height: calc(100% - 10px);
    background-color: #626262;
}
.title{
    color: #fff;
    display: flex;
    font-size: 14px;
    padding-top: 7px;
    font-weight: normal;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

.title-wrapper {
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
}
.buttons{
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    -webkit-app-region: no-drag;
}
.buttons span, .leftBtns span{
    display: inline-block;
    color: #fff;
    padding: 12px 18px 11px;
    -webkit-app-region: no-drag;
    cursor: pointer !important;
}
.leftBtns span{
    margin-top: 0 !important;
    padding: 8px 7px;
    -webkit-app-region: no-drag;
    position: relative;
}

.leftBtns span[aria-disabled=true] {
    cursor: not-allowed;
    pointer-events: none;
}

.leftBtns span.app{
    width: 20px;
    margin-left: 2px;
}

.buttons span:hover, .leftBtns span:hover{
    background-color: #626262;
}
.leftBtns span.app:hover, .leftBtns span.disabled:hover{
    background: #3c3c3c;
}
.buttons span.close:hover{
    background-color: #d80027;
}
.buttons span b, .leftBtns span b{
    display: block;
    color: #fff;
    height: 10px;
    width: 10px;
    background-size: cover;
    background-position: center center;
    background-repeat: no-repeat;
    cursor: pointer;
}
.leftBtns span b{
    height: 18px;
    width: 18px;
}

/*.leftBtns span #prev{*/
/*    background-image: url('../assets/skip.png');*/
/*}*/
/*.leftBtns span #olu{*/
/*    color: #ffffff;*/
/*    background-image: url('../assets/up-arrow-svgrepo-com.svg');*/
/*}*/

/*.leftBtns span #new-folder {*/
/*    background-image: url('../assets/add-folder.png');*/
/*}*/

/*.buttons span #minimize{*/
/*    background-image: url('../assets/substract.svg');*/
/*}*/
/*.buttons span #rectangle{*/
/*    background-image: url('../assets/rectangle.svg');*/
/*}*/
/*.buttons span #restore{*/
/*    background-image: url('../assets/multi-tab.svg');*/
/*}*/
/*.buttons span #close{*/
/*    background-image: url('../assets/cancel.svg');*/
/*}*/
/*.leftBtns span #list{*/
/*    background-image: url('../assets/list.svg');*/
/*}*/

select {
  -webkit-appearance: none;
  -moz-appearance: none;
  text-indent: 1px;
  text-overflow: '';
}
</style>