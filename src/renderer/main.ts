import Vue from "vue";

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
        state: "no-analyazed",
        analyzeScreenName: "",
        analyzeId: "",
        analyzeProgresses: [],
        followEachOther: [],
        followedOnly: [],
        followOnly: [],
    },
    methods: {
        analyze() {
            /* tslint:disable-next-line:no-empty */
        },
        updateAnalyazeStatus() {
            /* tslint:disable-next-line:no-empty */
        },
    }
});
/* tslint:enable:object-literal-sort-keys */
