<template>
  <v-app>
    <div id="container" class="svg-container"></div>
  </v-app>
</template>

<script>
import * as d3 from "d3";
// import data from "../data/miserables.json";
import data from "../data/testFlow.json";

export default {
  name: "Flow",

  mounted() {
    this.generateArc();
  },
  methods: {
    generateArc() {
      const radius = 30;

      const svg = d3
          .select("div#container")
          .append("svg")
          .attr("preserveAspectRatio", "xMinYMin meet")
          .attr("viewBox", "0 0 1200 1200")
          .classed("svg-content", true),
        width = 1000,
        height = 600;

      // const links = data.links.map(d => Object.create(d));
      // const nodes = data.nodes.map(d => Object.create(d));
      const steps = data.map(d => Object.create(d));
      const variables = steps.map(s => s.output.map(o => Object.create(o)));
      console.log(variables.flat());

      const collisionForce = d3.forceCollide(radius).strength(1);

      const simulation = d3
        .forceSimulation(steps)
        // .force(
        //   "link",
        //   d3
        //     .forceLink(links)
        //     .id(d => d.id)
        //     .distance(100)
        // )
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collisionForce", collisionForce);

      const scale = d3.scaleOrdinal(d3.schemeCategory10);
      const color = d => {
        return scale(d.group);
      };

      // const link = svg
      //   .append("g")
      //   .attr("stroke", "#999")
      //   .attr("stroke-opacity", 0.6)
      //   .selectAll("line")
      //   .data(links)
      //   .join("line")
      //   .attr("stroke-width", 1);

      const step = svg
        .append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("circle")
        .data(steps)
        .join("circle")
        .attr("r", radius)
        .attr("fill", color)
        .call(this.drag(simulation))
        .on("dblclick", (_, d) => {
          d.fx = null;
          d.fy = null;
        });

      step.append("title").text(d => d.id);

      simulation.on("tick", () => {
        // link
        //   .attr("x1", d => d.source.x)
        //   .attr("y1", d => d.source.y)
        //   .attr("x2", d => d.target.x)
        //   .attr("y2", d => d.target.y);

        step.attr("cx", d => d.x).attr("cy", d => d.y);
      });
    },
    drag(simulation) {
      function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      }

      function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      }

      return d3
        .drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended);
    }
  }
};
</script>

<style>
.links line {
  stroke: #999;
  stroke-opacity: 0.6;
}

.nodes circle {
  stroke: #fff;
  stroke-width: 1.5px;
}

text {
  font-family: sans-serif;
  font-size: 10px;
}

.svg-container {
  display: inline-block;
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  vertical-align: top;
  overflow: hidden;
}
.svg-content {
  display: inline-block;
  position: absolute;
  top: 0;
  left: 0;
}
</style>
