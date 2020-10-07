<template>
  <div id="container" class="svg-container"></div>
</template>

<script>
import * as d3 from "d3";
import {
  sankey as d3Sankey,
  sankeyLinkHorizontal as d3SankeyLinkHorizontal,
  sankeyLeft as d3SankeyLeft,
} from "d3-sankey";

export default {
  name: "SankeyFlow",
  props: {
    flowData: Array,
  },
  data() {
    return {
      selectedStep: null,
    };
  },
  mounted() {
    this.generateFlow();
  },
  watch: {
    flowData: function(newVal) {
      console.log("changed!", newVal);
      d3.select("div#container svg").remove();
      this.generateFlow();
    },
  },
  methods: {
    generateFlow() {
      const width = document.getElementById("container").clientWidth - 20;
      const height = document.getElementById("container").clientHeight;
      const svg = d3
        .select("div#container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

      const scale = d3.scaleOrdinal(d3.schemeCategory10);
      const color = (d) => {
        return scale(d.step);
      };

      const sankey = d3Sankey()
        .nodeId((d) => d.step)
        .nodeWidth(36)
        .nodePadding(40)
        .nodeAlign(d3SankeyLeft)
        .size([width, height]);

      const steps = this.flowData.map((d) => Object.create(d));

      const links = steps
        .map((s) => {
          return s.output.map((o) => {
            let variable = Object.create(o);
            variable.sourceStep = s.step;
            variable.source = s.step;
            variable.target = o.step;
            variable.value = o.variables.length;
            return variable;
          });
        })
        .flat();

      let graph = sankey({ nodes: steps, links: links });

      // add in the links
      let link = svg
        .append("g")
        .attr("class", "links")
        .attr("fill", "none")
        .attr("stroke", "#000")
        .attr("stroke-opacity", 0.2)
        .selectAll("g")
        .data(graph.links)
        .join("g")
        .style("mix-blend-mode", "multiply");

      let gradient = link
        .append("linearGradient")
        .attr("id", (d) => `${d.sourceStep}.${d.step}`)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", (d) => d.source.x1)
        .attr("x2", (d) => d.target.x0);

      gradient
        .append("stop")
        .attr("offset", "0%")
        .attr("stop-color", (d) => color(d.source));

      gradient
        .append("stop")
        .attr("offset", "100%")
        .attr("stop-color", (d) => color(d.target));

      link
        .append("path")
        .attr("class", "link")
        .attr("d", d3SankeyLinkHorizontal())
        .attr("stroke", (d) => `url(#${d.sourceStep}.${d.step})`)
        .attr("stroke-width", function(d) {
          return Math.max(1, d.width);
        });

      // add the link titles
      link.append("title").text(function(d) {
        return d.source.step + " → " + d.target.step;
      });

      // add in the nodes
      var node = svg
        .append("g")
        .selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", function(d) {
          return "translate(" + d.x0 + "," + d.y0 + ")";
        })
        .call(
          d3
            .drag()
            .subject(function(d) {
              return d;
            })
            .on("drag", dragmove)
        );

      node
        .append("rect")
        // .attr("x", function(d) {
        //   return d.x0;
        // })
        // .attr("y", function(d) {
        //   return d.y0;
        // })
        .attr("height", function(d) {
          return d.y1 - d.y0;
        })
        .attr("width", function(d) {
          return d.x1 - d.x0;
        })
        .attr("fill", color)
        .attr("stroke", "#000");

      node
        .append("text")
        .attr("x", function() {
          return -6;
        })
        .attr("y", function(d) {
          return (d.y1 - d.y0) / 2;
        })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .attr("transform", null)
        .text(function(d) {
          return d.step;
        })
        .filter(function(d) {
          return d.x0 < width / 2;
        })
        .attr("x", 6 + sankey.nodeWidth())
        .attr("text-anchor", "start");

      node.append("title").text(function(d) {
        return d.step;
      });

      function dragmove(d) {
        this.x = this.x || 0; //reset if not there
        this.y = this.y || 0;
        this.x += d.dx;
        this.y += d.dy;

        // const x = this.x
        // const y = this.y;

        // d3.select(this).attr("transform", function(d1) {
        //   console.log(d, d1);
        //   return (
        //     "translate(0," +
        //     Math.max(-d1.y0, Math.min(this.y, height - d1.y1)) +
        //     ")"
        //   );
        // });

        let vert = 0;
        d3.select(this).attr("transform", function(d1) {
          // console.log(d, d1);
          vert = Math.max(0, Math.min(d1.y0 + this.y, height - d1.y1 + d1.y0));
          return (
            "translate(" +
            d1.x0 +
            "," +
            Math.max(0, Math.min(d1.y0 + this.y, height - d1.y1 + d1.y0)) +
            ")"
          );
        });

        if (vert > 0 || vert < height)
          d3.select(this).attr("", function(d2) {
            let v0 = d2.v0 || 0,
              v1 = d2.v1 || 0;

            v0 += d.dy;
            v1 += d.dy;

            d2.v0 = Math.max(-d2.y0, Math.min(v0, height - d2.y1 + d2.y0));
            d2.v1 = Math.max(-d2.y0, Math.min(v1, height - d2.y1 + d2.y1));
          });
        // .attr("transform", "translate(-" + 0 + ",-" + this.y + ")");

        // d3.select(this)
        //   .selectAll("rect")
        //   .attr("y", function(d1) {
        //     d1.y0 += d.dy;
        //     d1.y1 += d.dy;
        //     return d1.y0;
        //   });

        sankey.update(graph);
        // console.log("updated", sankey.update(graph));
        // console.log("after", Object.assign(graph, {}));

        // link.attr("d", d3SankeyLinkHorizontal());
        // var t = d3
        //   .transition()
        //   .duration(750)
        //   .ease(d3.easeLinear);

        // link.exit().remove();
        link.select("path").attr("d", d3SankeyLinkHorizontal());
      }
    },
  },
};
</script>

<style>
.node rect {
  cursor: move;
  fill-opacity: 0.9;
  shape-rendering: crispEdges;
}

.node text {
  pointer-events: none;
  text-shadow: 0 1px 0 #fff;
}

.link:hover {
  stroke-opacity: 0.5;
}

#container {
  height: calc(100vh - 60px);
  width: 100vw;
  display: block;
}
</style>
