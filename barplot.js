// Load the data
const agedata = d3.csv("age_data.csv");

// Once the data is loaded, create the bar plot
agedata.then(function(data) {
    // Convert IMDb votes to numeric
    data.forEach(d => {
        d.imdb_votes = +d.imdb_votes;
    });

    // Group IMDb votes by age rating
    const groupedData = d3.rollups(
        data,
        v => d3.sum(v, d => d.imdb_votes),
        d => d.rating
    ).map(([rating, imdb_votes]) => ({ rating, imdb_votes }));

    // Sort ratings in standard order
    const ratingOrder = ["G", "PG", "PG-13", "R", "NC-17", "NR", "TV-Y", "TV-Y7", "TV-G", "TV-PG", "TV-14", "TV-MA"];
    groupedData.sort((a, b) => ratingOrder.indexOf(a.rating) - ratingOrder.indexOf(b.rating));

    // Define the dimensions and margins of the SVG
    const margin = { top: 50, right: 30, bottom: 50, left: 100 },
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select("#barplot")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

    // Define X scale (categorical for age rating)
    const x = d3.scaleBand()
                .domain(groupedData.map(d => d.rating))
                .range([0, width])
                .padding(0.2);

    // Define Y scale (linear for IMDb votes)
    const y = d3.scaleLinear()
                .domain([0, d3.max(groupedData, d => d.imdb_votes)])
                .nice()
                .range([height, 0]);

    // Add X-axis
    svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("text-anchor", "middle");

    // Add Y-axis
    svg.append("g")
        .call(d3.axisLeft(y));

    // Draw the bars
    svg.selectAll(".bar")
        .data(groupedData)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.rating))
        .attr("y", d => y(d.imdb_votes))
        .attr("width", x.bandwidth())
        .attr("height", d => height - y(d.imdb_votes))
        .attr("fill", "seagreen")
        .style("stroke", "black")
        .style("stroke-width", "1px")
        .on("mouseover", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "cyan");
        })
        .on("mouseout", function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr("fill", "seagreen");
        });

    // Add x-axis label
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom - 10)
        .style("text-anchor", "middle")
        .text("Age Rating");

    // Add y-axis label
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 20)
        .attr("x", -height / 2)
        .style("text-anchor", "middle")
        .text("Total IMDb Votes");

    // Add title
    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .text("IMDb Votes by Age Rating");
});
