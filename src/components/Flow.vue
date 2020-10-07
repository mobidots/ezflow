<template>
  <div id="container" class="svg-container"></div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "Flow",
  props: {
    flowData: Array
  },
  data() {
    return {
      selectedStep: null
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
    }
  },
  methods: {
    generateFlow() {
      const width = document.getElementById("container").clientWidth;
      const height = document.getElementById("container").clientHeight;

      const steps = this.flowData.map(d => Object.create(d));
      const links = steps
        .map(s => {
          return s.output.map(o => {
            let variable = Object.create(o);
            variable.sourceStep = s.step;
            variable.source = s.step;
            variable.target = o.step;
            return variable;
          });
        })
        .flat();

      const blockers = steps
        .map(s => {
          return s.output_control_transfer.map(o => {
            return {
              sourceStep: s.step,
              source: s.step,
              target: o.step
            };
          });
        })
        .flat();

      const radius = 25;

      let svg = d3
        .select("div#container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%")
        .call(
          d3.zoom().on("zoom", function(e) {
            svg.attr("transform", e.transform);
          })
        )
        .on("dblclick.zoom", null)
        .append("g");

      svg
        .append("defs")
        .append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 13)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("refX", "31")
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#999")
        .attr("opacity", "0.8")
        .style("stroke", "none");

      svg
        .select("defs")
        .append("marker")
        .attr("id", "arrowhead2")
        .attr("viewBox", "-0 -5 10 10")
        .attr("refX", 13)
        .attr("refY", 0)
        .attr("orient", "auto")
        .attr("markerWidth", 4)
        .attr("markerHeight", 4)
        .attr("refX", "30")
        .attr("xoverflow", "visible")
        .append("svg:path")
        .attr("d", "M 0,-5 L 10 ,0 L 0,5")
        .attr("fill", "#ef5350")
        .attr("opacity", "0.8")
        .style("stroke", "none");

      const collisionForce = d3.forceCollide(radius).strength(1);

      const simulation = d3
        .forceSimulation(steps)
        .force(
          "link",
          d3
            .forceLink(links)
            .id(d => d.step)
            .distance(250)
            .strength(0.4)
        )
        .force(
          "link",
          d3
            .forceLink(blockers)
            .id(d => d.step)
            .distance(250)
            .strength(0.4)
        )
        .force("charge", d3.forceManyBody().strength(-200))
        // .force("center", d3.forceCenter(width / 2, height / 2))
        .force("y", d3.forceY(height / 2))
        .force("x", d3.forceX(width / 2))
        .force(
          "xPosition",
          d3
            .forceX(function(d) {
              console.log(d);
              if (d.step === "input") return 100;
              if (d.step === "output") return 1000;
              return Math.abs(d.y * 10) + 500;
            })
            .strength(2)
        )
        .force("collisionForce", collisionForce);

      const scale = d3.scaleOrdinal(d3.schemeCategory10);
      const color = d => {
        if (d.step == "input" || d.step == "output") return scale(0);
        return scale(1);
      };

      const link = svg
        .selectAll(".link")
        .data(links)
        .enter()
        .append("line")
        .attr("class", "links")
        .attr("marker-end", "url(#arrowhead)");

      const linkBlocks = svg
        .selectAll(".link-blocks")
        .data(blockers)
        .enter()
        .append("line")
        .attr("class", "blockers")
        .attr("marker-end", "url(#arrowhead2)");

      const edgepaths = svg
        .selectAll(".edgepath")
        .data(blockers)
        .enter()
        .append("path")
        .attr("class", "edgepath")
        .attr("fill-opacity", 0)
        .attr("stroke-opacity", 0)
        .attr("id", function(d, i) {
          return "edgepath" + i;
        })
        .style("pointer-events", "none");

      const edgelabels = svg
        .selectAll(".edgelabel")
        .data(blockers)
        .enter()
        .append("text")
        .style("pointer-events", "none")
        .attr("class", "edgelabel")
        .attr("id", function(d, i) {
          return "edgelabel" + i;
        })
        .attr("font-size", 8)
        .attr("font-weight", "bold")
        .attr("y", -3)
        .attr("fill", "#666");

      edgelabels
        .append("textPath")
        .attr("xlink:href", function(d, i) {
          return "#edgepath" + i;
        })
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("startOffset", "50%")
        .text(function() {
          return "BLOCKS";
        });

      const step = svg
        .selectAll(".node")
        .data(steps)
        .enter()
        .append("g")
        .attr("class", "step")
        .call(this.drag(simulation))
        .on("dblclick", (e, d) => {
          e.preventDefault();
          if (d.step == "output") return;
          this.$emit("show-step-details", d.__proto__);
        })
        .on("contextmenu", (e, d) => {
          e.preventDefault();
          d.fx = null;
          d.fy = null;
        });

      step
        .append("circle")
        .attr("r", radius)
        .style("fill", color);

      step
        .append("text")
        .attr("text-anchor", "middle")
        .attr("y", 35)
        .text(function(d) {
          return d.step;
        });

      step.append("title").text(d => d.step);

      simulation.on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        linkBlocks
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);

        step.attr("transform", function(d) {
          return "translate(" + d.x + "," + d.y + ")";
        });

        edgepaths.attr("d", function(d) {
          return (
            "M " +
            d.source.x +
            " " +
            d.source.y +
            " L " +
            d.target.x +
            " " +
            d.target.y
          );
        });

        edgelabels.attr("transform", function(d) {
          if (d.target.x < d.source.x) {
            var bbox = this.getBBox();

            let rx = bbox.x + bbox.width / 2;
            let ry = bbox.y + bbox.height / 2;
            return "rotate(180 " + rx + " " + ry + ")";
          } else {
            return "rotate(0)";
          }
        });
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
line.links {
  stroke: #999;
  stroke-opacity: 0.8;
  stroke-width: 3px;
}

line.blockers {
  stroke: #ef5350;
  stroke-opacity: 0.8;
  stroke-width: 3px;
}

.step circle {
  stroke: #fff;
  stroke-width: 1.5px;
}

.step text {
  font-weight: bold;
  font-size: 9px;
  stroke-width: 1px;
}

#container {
  height: calc(100vh - 60px);
  width: 100vw;
  display: block;
}
</style>
