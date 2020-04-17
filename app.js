var files = ["https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json", "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"];

Promise.all([
        d3.json(files[0]),
        d3.json(files[1])
    ])
    .then(([education, county]) => {
        // Uncomment to check data

        //document.getElementById('data').innerHTML = JSON.stringify(education);
        //document.getElementById('data').innerHTML = JSON.stringify(county);

        // Project Configuration
        var width = 960,
            height = 700;

        var path = d3.geoPath();

        var svg = d3.select("#data").append("svg")
            .attr("width", width)
            .attr("height", height);

        var tooltip = d3.select("#data").append("div")
            .attr("id", "tooltip")
            .style("opacity", 0);

        // Color Generator
        var color = d3.scaleThreshold()
            .domain(d3.range(2.6, 75.1, (75.1 - 2.6) / 8))
            .range(d3.schemeBlues[9]);

        // Legend
        var x = d3.scaleLinear()
            .domain([2.6, 75.1])
            .rangeRound([600, 860]);

        var g = svg.append("g")
            .attr("class", "key")
            .attr("id", "legend")
            .attr("transform", "translate(0,40)");

        g.selectAll("rect")
            .data(color.range().map(function(d) {
                d = color.invertExtent(d);
                if (d[0] == null) d[0] = x.domain()[0];
                if (d[1] == null) d[1] = x.domain()[1];
                return d;
            }))
            .enter().append("rect")
            .attr("height", 8)
            .attr("x", function(d) {
                return x(d[0]);
            })
            .attr("width", function(d) {
                return x(d[1]) - x(d[0]);
            })
            .attr("fill", function(d) {
                return color(d[0]);
            });

        g.append("text")
            .attr("class", "caption")
            .attr("x", x.range()[0])
            .attr("y", -6)
            .attr("fill", "#000")
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")

        g.call(d3.axisBottom(x)
                .tickSize(13)
                .tickFormat(function(x) {
                    return Math.round(x) + '%'
                })
                .tickValues(color.domain()))
            .select(".domain")
            .remove();

        // DATA
        svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(county, county.objects.counties).features)
            .enter().append("path")
            .attr("class", "county")
            .attr("data-fips", function(d) {
                return d.id
            })
            .attr("data-education", function(d) {
                var result = education.filter(function(obj) {
                    return obj.fips == d.id;
                });
                if (result[0]) {
                    return result[0].bachelorsOrHigher
                }
                //could not find a matching fips id in the data

                console.log('could find data for: ', d.id);
                return 0
            })
            .attr("fill", function(d) {
                var result = education.filter(function(obj) {
                    return obj.fips == d.id;
                });
                if (result[0]) {
                    return color(result[0].bachelorsOrHigher)
                }
                //could not find a matching fips id in the data
                console.log(result)
                return color(0)
            })
            .attr("d", path)
            .on("mouseover", function(d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(function() {
                        var result = education.filter(function(obj) {
                            return obj.fips == d.id;
                        });
                        if (result[0]) {
                            return result[0]['area_name'] + ', ' + result[0]['state'] + ': ' + result[0].bachelorsOrHigher + '%'
                        }
                        //could not find a matching fips id in the data
                        return 0
                    })
                    .attr("data-education", function() {
                        var result = education.filter(function(obj) {
                            return obj.fips == d.id;
                        });
                        if (result[0]) {
                            return result[0].bachelorsOrHigher
                        }
                        //could not find a matching fips id in the data
                        return 0
                    })
                    .style("left", (d3.event.pageX + 10) + "px")
                    .style("top", (d3.event.pageY - 40) + "px");
            })

            .on('mouseout', function(d) {
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0);
            });

    })