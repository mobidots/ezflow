<template>
  <v-container>
    <v-form>
      <v-container class="pb-0">
        <v-row>
          <v-col class="my-n5">
            <h2>{{ newData.step }}</h2>
          </v-col>
        </v-row>
      </v-container>
      <v-container
        class="pb-0"
        v-if="newData.step != 'input' && newData.step != 'output'"
      >
        <v-row>
          <v-col>
            <h4>Resources</h4>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="stagingResource"
              label="Staging"
              clearable
              required
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row>
          <v-col>
            <v-text-field
              v-model="productionResource"
              label="Production"
              clearable
              required
            ></v-text-field>
          </v-col>
        </v-row>
      </v-container>
      <v-container class="pb-0">
        <v-row>
          <v-col>
            <h4>Properties</h4>
          </v-col>
        </v-row>
        <v-row>
          <v-simple-table dense class="mt-3">
            <template v-slot:default>
              <tbody>
                <tr v-for="(v, k) in newData.properties" :key="k">
                  <td>
                    <v-text-field label="Key" v-bind:value="k"> </v-text-field>
                  </td>
                  <td>
                    <v-text-field label="Value" v-bind:value="v">
                    </v-text-field>
                  </td>
                </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-row>
      </v-container>
      <v-container class="pb-0">
        <v-row>
          <v-col>
            <h4>Output Variables</h4>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            class="col-md-12"
            v-for="output in newData.output"
            :key="output.step"
          >
            <v-icon large color="blue lighten-1" class="mr-3">
              mdi-ray-start-arrow
            </v-icon>
            ({{ output.step }})
            <v-card
              v-for="variable in output.variables"
              :key="variable.variable"
              class="mt-3"
            >
              <v-card-text>
                <v-simple-table dense class="mt-3">
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th colspan="2" class="text-left">
                          <v-text-field
                            label="Variable Name"
                            v-model="variable.variable"
                          >
                          </v-text-field>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="(v, k) in variable.relationship" :key="k">
                        <td>
                          <v-text-field label="Key" v-bind:value="k">
                          </v-text-field>
                        </td>
                        <td>
                          <v-text-field label="Value" v-bind:value="v">
                          </v-text-field>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <v-container class="pb-0">
        <v-row>
          <v-col>
            <h4>Blockers</h4>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            class="col-md-12"
            v-for="output in newData.output_control_transfer"
            :key="output.step"
          >
            <v-card
              v-for="relationship in output.relationships"
              :key="relationship.path"
            >
              <v-card-title class="subtitle-2">
                <v-icon large color="red lighten-2" class="mr-3">
                  mdi-ray-start-arrow
                </v-icon>
                ({{ output.step }})
              </v-card-title>
              <v-card-text>
                <v-simple-table dense class="mt-3">
                  <template v-slot:default>
                    <tbody>
                      <tr v-for="(v, k) in relationship" :key="k">
                        <td>
                          <v-text-field label="Key" v-bind:value="k">
                          </v-text-field>
                        </td>
                        <td>
                          <v-text-field label="Value" v-bind:value="v">
                          </v-text-field>
                        </td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
      <v-row justify="end">
        <v-col md="6">
          <v-btn color="secondary" text @click="save(false)">Close</v-btn>
          <v-btn color="blue darken-1 white--text" text @click="save(true)"
            >Save</v-btn
          >
        </v-col>
      </v-row>
    </v-form>
  </v-container>
</template>

<script>
export default {
  name: "Details",
  props: {
    data: Object,
  },
  data() {
    return {
      newData: {},
    };
  },
  created() {
    this.newData = this._.cloneDeep(this.data);
  },
  computed: {
    stepName: {
      get() {
        return this.newData.step;
      },
      set(newVal) {
        this.newData.step = newVal;
        this.newData.properties.uuid = newVal;
      },
    },
    stagingResource: {
      get() {
        let resource = this._.find(this.newData.resources, function (r) {
          return r.relationship.environment == "staging";
        });
        return resource.arn;
      },
      set(newVal) {
        this._.find(this.newData.resources, function (r) {
          if (r.relationship.environment == "staging") {
            r.arn = newVal;
            return;
          }
        });
      },
    },
    productionResource: {
      get() {
        let resource = this._.find(this.newData.resources, function (r) {
          return r.relationship.environment == "production";
        });
        return resource.arn;
      },
      set(newVal) {
        this._.find(this.newData.resources, function (r) {
          if (r.relationship.environment == "production") {
            r.arn = newVal;
            return;
          }
        });
      },
    },
  },
  methods: {
    save(saved) {
      console.log("saving...", saved);
      this.$emit("save-step-details", saved, this.newData);
    },
  },
};
</script>

<style></style>
