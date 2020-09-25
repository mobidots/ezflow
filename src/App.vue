<template>
  <v-app>
    <v-main>
      <ManageFlow />
    </v-main>
  </v-app>
</template>

<script>
import ManageFlow from "./components/ManageFlow";

export default {
  name: "App",

  components: {
    ManageFlow,
  },

  data: () => ({
    //
  }),
};
</script>
