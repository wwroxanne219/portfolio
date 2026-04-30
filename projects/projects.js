import { fetchJSON, renderProjects } from '../global.js';

console.log(d3);

const projects = await fetchJSON('../lib/projects.json');

const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

const projectYears = projects.map(project => project.year);
console.log(projectYears);

const yearCounts = d3.rollups(
  projects,
  v => v.length,
  d => d.year
);

console.log(yearCounts);



const width = 600;
const height = 430;
const margin = { top: 20, right: 20, bottom: 40, left: 40 };

const svg = d3.select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

const xScale = d3.scaleBand()
  .domain(yearCounts.map(d => d[0]))
  .range([200, 400])
  .padding(0.2);

const yScale = d3.scaleLinear()
  .domain([0, d3.max(yearCounts, d => d[1])])
  .range([height - margin.bottom, margin.top]);

svg.selectAll("rect")
  .data(yearCounts)
  .enter()
  .append("rect")
  .attr("x", d => xScale(d[0]))
  .attr("y", d => yScale(d[1]))
  .attr("width", xScale.bandwidth())
  .attr("height", d => height - margin.bottom - yScale(d[1]))
  .attr("fill", "steelblue");

svg.selectAll(".label")
  .data(yearCounts)
  .enter()
  .append("text")
  .attr("class", "label")
  .text(d => d[1])
  .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
  .attr("y", d => yScale(d[1]) - 5)
  .attr("text-anchor", "middle");

svg.selectAll(".year")
  .data(yearCounts)
  .enter()
  .append("text")
  .attr("class", "year")
  .text(d => d[0])
  .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2)
  .attr("y", height - 10)
  .attr("text-anchor", "middle");