import * as d3 from "d3";
import { sankey, sankeyLinkHorizontal } from "d3-sankey";
import { useEffect, useRef } from "react";

export default function SankeyChart({ data, width = 700, height = 400 }) {
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
        nodes: data.nodes.map(d => Object.assign({}, d)),
        links: data.links.map(d => Object.assign({}, d)),
      });

    // Draw links
    svg
      .append("g")
      .attr("fill", "none")
      .attr("stroke-opacity", 0.4)
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("d", sankeyLinkHorizontal())
      .attr("stroke", d => d.color || "#999")
      .attr("stroke-width", d => Math.max(1, d.width))
      .on("mouseover", (event, d) => {
        d3.select(event.target).attr("stroke-opacity", 0.8);
      })
      .on("mouseout", (event, d) => {
        d3.select(event.target).attr("stroke-opacity", 0.4);
      })
      .append("title")
      .text(d => `${d.source.name} → ${d.target.name}\n${d.value} depts`);

    // Draw nodes
    svg
      .append("g")
      .selectAll("rect")
      .data(nodes)
      .join("rect")
      .attr("x", d => d.x0)
      .attr("y", d => d.y0)
      .attr("height", d => d.y1 - d.y0)
      .attr("width", d => d.x1 - d.x0)
      .attr("fill", d => d.color || "#4682b4")
      .append("title")
      .text(d => `${d.name}\n${d.value} total`);

    // Add node labels
    svg
      .append("g")
      .style("font", "12px sans-serif")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
      .attr("y", d => (d.y1 + d.y0) / 2)
      .attr("dy", "0.35em")
      .attr("text-anchor", d => (d.x0 < width / 2 ? "start" : "end"))
      .text(d => d.name);
  }, [data, width, height]);

  return <svg ref={svgRef}></svg>;
}
