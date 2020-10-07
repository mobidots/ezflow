<template>
  <div>
    <v-row class="pa-2" no-gutters justify="space-between">
      <v-col md="2">
        <LoadJson @load-json="loadJson" />
      </v-col>
      <v-col md="2">
        <v-switch
          class="pa-2 mt-0"
          v-model="nodeLayout"
          color="primary"
          label="Node Layout"
          hide-details
        ></v-switch>
      </v-col>
    </v-row>
    <SankeyFlow
      :flowData="flowData"
      @show-step-details="showStepDetails"
      v-if="!nodeLayout"
    />
    <Flow
      :flowData="flowData"
      @show-step-details="showStepDetails"
      v-if="nodeLayout"
    />
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
import SankeyFlow from "./SankeyFlow";
import Details from "./Details";
import data from "../data/testFlow2.json";

export default {
  name: "ManageFlow",
  components: { LoadJson, Flow, SankeyFlow, Details },
  data() {
    return {
      drawer: false,
      flowData: data,
      stepDetails: null,
      nodeLayout: false
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
    }
  }
};
</script>

<style></style>
