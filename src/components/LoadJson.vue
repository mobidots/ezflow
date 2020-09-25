<template>
  <div class="pa-2">
    <v-dialog v-model="dialog" max-width="600">
      <template v-slot:activator="{ on, attrs }">
        <v-btn color="primary" dark v-bind="attrs" v-on="on"> Load JSON </v-btn>
      </template>
      <v-card>
        <v-card-title></v-card-title>
        <v-card-text>
          <v-textarea rows="10" v-model="json"></v-textarea>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary lighten-1" text @click="dialog = false">
            Cancel
          </v-btn>

          <v-btn color="primary lighten-1" text @click="loadJson()">
            Load
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import data from "../data/testFlow2.json";

export default {
  name: "LoadJson",
  data() {
    return {
      dialog: false,
      json: JSON.stringify(data, undefined, 2),
    };
  },
  methods: {
    loadJson() {
      this.$emit("load-json", this.json);
      this.dialog = false;
    },
  },
};
</script>

<style>
</style>
