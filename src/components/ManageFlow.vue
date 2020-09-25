<template>
  <div>
    <LoadJson @load-json="loadJson" />
    <Flow :flowData="flowData" @show-step-details="showStepDetails" />
    <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
      right
      disable-resize-watcher
      width="400"
    >
      <Details
        v-if="stepDetails"
        :data="stepDetails"
        @save-step-details="saveStepDetails"
      />
    </v-navigation-drawer>
  </div>
</template>

<script>
import LoadJson from "./LoadJson";
import Flow from "./Flow";
import Details from "./Details";
import data from "../data/testFlow2.json";

export default {
  name: "ManageFlow",
  components: { LoadJson, Flow, Details },
  data() {
    return {
      drawer: false,
      flowData: data,
      stepDetails: null,
    };
  },
  methods: {
    showStepDetails(step) {
      this.stepDetails = step;
      this.drawer = true;
    },
    saveStepDetails(saved, details) {
      this.drawer = false;
      if (saved) {
        console.log("saved?!", details);
      }
      this.stepDetails = null;
    },
    loadJson(json) {
      this.flowData = JSON.parse(json);
    },
  },
};
</script>

<style>
</style>
