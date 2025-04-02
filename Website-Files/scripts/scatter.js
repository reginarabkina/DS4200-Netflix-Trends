d3.json("merged_data.json").then(function(data) {
    // Parse data and group by release_year and type
    let groupedData = d3.rollups(
        data,
        v => ({
            num_releases: v.length,
            avg_rating: d3.mean(v, d => +d.imdb_score)
        }),
        d => d.release_year,
        d => d.type
    );

    let processedData = [];
    groupedData.forEach(([year, types]) => {
        types.forEach(([type, values]) => {
            processedData.push({
                release_year: year,
                type: type,
                num_releases: values.num_releases,
                avg_rating: values.avg_rating
            });
        });
    });

    // Set up dimensions
    const width = 800, height = 500, margin = { top: 50, right: 30, bottom: 50, left: 60 };

    // Create scales
    const xScale = d3.scaleBand()
        .domain(processedData.map(d => d.release_year))
        .range([margin.left, width - margin.right])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([d3.min(processedData, d => d.avg_rating) - 0.5, d3.max(processedData, d => d.avg_rating) + 0.5])
        .range([height - margin.bottom, margin.top]);

    const sizeScale = d3.scaleLinear()
        .domain([d3.min(processedData, d => d.num_releases), d3.max(processedData, d => d.num_releases)])
        .range([10, 300]);

    const colorScale = d3.scaleOrdinal()
        .domain(["MOVIE", "SHOW"])
        .range(["blue", "red"]);

    // Create SVG container
    const svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);

    // Add circles
    svg.selectAll("circle")
        .data(processedData)
        .enter().append("circle")
        .attr("cx", d => xScale(d.release_year) + xScale.bandwidth() / 2)
        .attr("cy", d => yScale(d.avg_rating))
        .attr("r", d => sizeScale(d.num_releases) / 10)
        .attr("fill", d => colorScale(d.type))
        .attr("opacity", 0.7);

    // Add axes
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(xAxis)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(yAxis);
    
    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", margin.top / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Number of Releases vs. Average Rating by Year (Movies & TV Shows)");
});