<template>
  <v-app>
    <v-main>
      <Flow />
    </v-main>
  </v-app>
</template>

<script>
import Flow from "./components/Flow";

export default {
  name: "App",

  components: {
    Flow,
  },

  data: () => ({
    //
  }),
};
</script>
