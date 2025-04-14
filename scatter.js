d3.json("merged_data.json").then(function(data) {
    const width = 900,
        height = 500,
        margin = { top: 50, right: 180, bottom: 80, left: 60 };

    const types = ["MOVIE", "SHOW"];

    const xScale = d3.scaleBand()
        .domain(data.map(d => d.release_year))
        .range([margin.left, width - margin.right])
        .padding(0.1);

    const yExtent = d3.extent(data, d => d.avg_rating);
    const yScale = d3.scaleLinear()
        .domain([yExtent[0] - 0.5, yExtent[1] + 0.5])
        .range([height - margin.bottom, margin.top]);

    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.num_releases)])
        .range([10, 30]);

    const colorScale = d3.scaleOrdinal()
        .domain(types)
        .range(["blue", "red"]);

    const svg = d3.select("#scatter").append("svg")
        .attr("width", width)
        .attr("height", height);

    const tooltip = d3.select("body").append("div")
        .style("position", "absolute")
        .style("background", "lightgray")
        .style("padding", "5px")
        .style("border-radius", "5px")
        .style("display", "none");

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.release_year) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.avg_rating))
        .attr("r", d => sizeScale(d.num_releases))
        .attr("fill", d => colorScale(d.type))
        .attr("opacity", 0.7)
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`
                    <strong>Year:</strong> ${d.release_year}<br>
                    <strong>Type:</strong> ${d.type}<br>
                    <strong>Releases:</strong> ${d.num_releases}<br>
                    <strong>Avg Rating:</strong> ${d.avg_rating.toFixed(2)}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", () => tooltip.style("display", "none"));

    // Axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickValues(xScale.domain().filter((d, i) => i % 5 === 0)))
        .selectAll("text")
        .attr("transform", "rotate(-30)")
        .style("text-anchor", "end");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale));

    // Axis labels
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height - 30)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Release Year");

    svg.append("text")
        .attr("x", -height / 2)
        .attr("y", 15)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .text("Average IMDb Rating");

    // Title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("Number of Releases vs. Average Rating by Year (Movies & TV Shows)");

    // REGRESSION LINES
    types.forEach(type => {
        const typeData = data
            .filter(d => d.type === type)
            .map(d => [parseInt(d.release_year), d.avg_rating])
            .sort((a, b) => a[0] - b[0]);

        const result = regression.linear(typeData);

        const lineData = typeData.map(d => ({
            release_year: d[0],
            predicted: result.predict(d[0])[1]
        }));

        const line = d3.line()
            .x(d => xScale(d.release_year) + xScale.bandwidth() / 2)
            .y(d => yScale(d.predicted));

        svg.append("path")
            .datum(lineData)
            .attr("fill", "none")
            .attr("stroke", colorScale(type))
            .attr("stroke-width", 3)
            .attr("opacity", 0.5)
            .attr("d", line);
    });
});
