const scatterData =  d3.csv("../datasets/merged_data.json");

const width = 800;
const height = 500;
const margin = { top: 20, right: 30, bottom: 50, left: 50 };

const svg = d3.select("body")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

const xScale = d3.scaleLinear()
    .domain(d3.extent(scatterData, d => d.year))
    .range([margin.left, width - margin.right]);

const yScale = d3.scaleLinear()
    .domain([0, 10])
    .range([height - margin.bottom, margin.top]);

svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(xScale).tickFormat(d3.format("d")))
    .append("text")
    .attr("x", width / 2)
    .attr("y", 40)
    .attr("fill", "black")
    .text("Year");

svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale))
    .append("text")
    .attr("x", -margin.left)
    .attr("y", 10)
    .attr("fill", "black")
    .text("Average IMDb Rating");

svg.selectAll("circle")
    .data(scatterData)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.year))
    .attr("cy", d => yScale(d.avg_score))
    .attr("r", d => d.count * 2)
    .attr("fill", "rgba(75, 192, 192, 0.6)");
