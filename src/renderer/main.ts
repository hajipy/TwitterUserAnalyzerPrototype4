import { ipcRenderer } from "electron";
import Vue from "vue";

import ipcMessage from "../ipcMessage";

/* tslint:disable:object-literal-sort-keys */
Vue.component("user-list", {
    template: `
<div>
    <h1 v-on:click="show = !show">
        {{ name }}
        <span v-if="!show">▼</span>
    </h1>
    <transition name="fade">
        <div v-if="show" class="flex-container">
            <div v-for="item in list">
                <a v-bind:href="item.twitterHomeUrl" target="_blank"></a>
                <img v-bind:src="item.profileImageUrl">
                <p>{{ item.screenName }}</p>
            </div>
        </div>
    </transition>
</div>
`,
    data() {
        return {
           show: false
        };
    },
    props: ["name", "list"]
});
/* tslint:enable:object-literal-sort-keys */

/* tslint:disable:object-literal-sort-keys */
const app = new Vue({
    el: "#app",
    data: {
        state: "un-analyazed",
        analyzeScreenName: "",
        analyzeProgresses: [],
        followEachOther: [],
        followedOnly: [],
        followOnly: [],
    },
    methods: {
        analyze() {
            if (this.analyzeScreenName.length === 0) {
                return;
            }

            ipcRenderer.send(ipcMessage.analyze, this.$data.analyzeScreenName);
        },
    }
});
/* tslint:enable:object-literal-sort-keys */

ipcRenderer.on(ipcMessage.analyzeStart, (event) => {
    app.$data.state = "analyzing";
    app.$data.analyzeProgresses.splice(0, app.$data.analyzeProgresses.length);
    app.$data.followEachOther.splice(0, app.$data.followEachOther.length);
    app.$data.followedOnly.splice(0, app.$data.followedOnly.length);
    app.$data.followOnly.splice(0, app.$data.followOnly.length);
});

ipcRenderer.on(ipcMessage.analyzeProgress, (event, newProgress) => {
    app.$data.analyzeProgresses.push(newProgress);
});

ipcRenderer.on(ipcMessage.analyzeFinish, (event, result) => {
    app.$data.state = "analyzed";

    app.$data.followEachOther.push(...result.followEachOther);
    app.$data.followedOnly.push(...result.followedOnly);
    app.$data.followOnly.push(...result.followOnly);
});
