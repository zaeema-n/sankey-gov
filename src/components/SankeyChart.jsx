import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useEffect, useRef } from "react";

export default function SankeyChart({ data, width = 700, height = 400 }) {
  const containerRef = useRef();
    const svgRef = useRef();

  useEffect(() => {
    if (!data) return;

    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove();

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    const { nodes, links } = sankey()
      .nodeWidth(20)
      .nodePadding(15)
      .extent([
        [1, 1],
        [width - 1, height - 6],
      ])({
      nodes: data.nodes.map((d) => Object.assign({}, d)),
      links: data.links.map((d) => Object.assign({}, d)),
    });

    // Defines a color scale.
    const color = d3.scaleOrdinal(d3.schemeCategory10);

    // Create gradient defs
    const defs = svg.append("defs");
    const linkGradients = defs
      .selectAll("linearGradient")
      .data(links)
      .join("linearGradient")
      .attr("id", (d, i) => `gradient-${i}`)
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", (d) => d.source.x1)
      .attr("x2", (d) => d.target.x0);

    linkGradients
      .append("stop")
      .attr("offset", "0%")
      .attr("stop-color", (d) => color(d.source.name));

    linkGradients
      .append("stop")
      .attr("offset", "100%")
      .attr("stop-color", (d) => color(d.target.name));

    // Create tooltip appended to containerRef
    const tooltip = d3
      .select(containerRef.current)
      .append("div")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.7)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("opacity", 0);

    // Draw links
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.4)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", (d, i) => `url(#gradient-${i})`)
      .attr("stroke-width", (d) => Math.max(1, d.width))
      .on("mouseover", (event, d) => {
        d3.select(event.target)
          .transition()
          .duration(300)
          .attr("stroke-opacity", 0.8);
      
        tooltip
          .style("opacity", 0)
          .html(`
            <strong>${d.source.name}</strong> → <strong>${d.target.name}</strong><br/>
            Departments moved: ${d.value}
          `)
          .transition()
          .duration(200)
          .style("opacity", 1);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 20 + "px");
      })
      .on("mouseout", (event) => {
        d3.select(event.target)
          .transition()
          .duration(300)
          .attr("stroke-opacity", 0.4);
      
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 0);
      });
    //   .append("title")
    //   .text((d) => `${d.source.name} → ${d.target.name}\n${d.value} depts`);

    // Draw nodes
    svg
      .append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", (d) => d.x0)
      .attr("y", (d) => d.y0)
      .attr("height", (d) => d.y1 - d.y0)
      .attr("width", (d) => d.x1 - d.x0)
      .attr("fill", (d) => color(d.name))
      .append("title")
      .text((d) => `${d.name}\n${d.value} total`);

    // Add node labels
    svg
      .append("g")
      .style("font", "12px sans-serif")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", (d) => (d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6))
      .attr("y", (d) => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", (d) => (d.x0 < width / 2 ? "start" : "end"))
      .text((d) => d.name);
  }, [data, width, height]);

  // Wrap SVG inside a div for tooltip positioning
  return (
    <div ref={containerRef} style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
    </div>
  );
}
