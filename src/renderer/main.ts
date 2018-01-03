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
        state: "un-analyazed",
        analyzeScreenName: "",
        analyzeProgresses: [],
        followEachOther: [],
        followedOnly: [],
        followOnly: [],
    },
    methods: {
        analyze() {
            this.$data.state = "analyzing";
            this.$data.analyzeProgresses.splice(0, this.$data.analyzeProgresses.length);

            setTimeout(() => {
                this.$data.analyzeProgresses.push(`Analyzing (1/3) ...`);
            }, 1000);

            setTimeout(() => {
                this.$data.analyzeProgresses.push(`Analyzing (2/3) ...`);
            }, 2000);

            setTimeout(() => {
                this.$data.analyzeProgresses.push(`Analyzing (3/3) ...`);
            }, 3000);

            setTimeout(() => {
                this.$data.analyzeProgresses.push(`Analyzing finish!!`);
            }, 4000);

            setTimeout(() => {
                this.$data.state = "analyzed";
            }, 4500);
        },
    }
});
/* tslint:enable:object-literal-sort-keys */
