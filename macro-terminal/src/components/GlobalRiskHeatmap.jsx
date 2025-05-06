import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';

const GlobalRiskHeatmap = () => {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  // Mock country risk data - in production this would come from an API
  const countryRiskData = {
    USA: { riskLevel: 2, alertLevel: "Medium", details: "Trade tensions, inflation concerns" },
    CHN: { riskLevel: 4, alertLevel: "High", details: "Property sector stress, slowing growth" },
    JPN: { riskLevel: 3, alertLevel: "Medium", details: "Currency volatility, debt levels" },
    GBR: { riskLevel: 3, alertLevel: "Medium", details: "Post-Brexit adjustments, inflation" },
    DEU: { riskLevel: 3, alertLevel: "Medium", details: "Energy dependency, manufacturing slowdown" },
    FRA: { riskLevel: 2, alertLevel: "Medium", details: "Political uncertainty, budget deficits" },
    ITA: { riskLevel: 4, alertLevel: "High", details: "Debt sustainability concerns" },
    RUS: { riskLevel: 5, alertLevel: "Critical", details: "Sanctions, geopolitical isolation" },
    IND: { riskLevel: 2, alertLevel: "Low", details: "Strong growth, vulnerable to inflation shocks" },
    BRA: { riskLevel: 3, alertLevel: "Medium", details: "Policy uncertainty, fiscal challenges" },
    ZAF: { riskLevel: 4, alertLevel: "High", details: "Infrastructure challenges, political risks" },
    AUS: { riskLevel: 1, alertLevel: "Low", details: "Commodity export dependency" },
    CAN: { riskLevel: 2, alertLevel: "Low", details: "Housing market concerns, US trade dependency" },
    // Add more countries as needed
  };

  // Color scale for risk levels (1-5)
  const riskColorScale = d3.scaleLinear()
    .domain([1, 5])
    .range(["#4daf4a", "#e41a1c"]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select(tooltipRef.current);
    const width = 900;
    const height = 500;

    // Clear previous rendering
    svg.selectAll("*").remove();

    // Create a projection
    const projection = d3.geoNaturalEarth1()
      .scale(width / 2 / Math.PI)
      .translate([width / 2, height / 2]);

    // Create a path generator
    const path = d3.geoPath()
      .projection(projection);

    // Set up the map
    svg
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");
    
    // Load world map data (using example URL, replace with your actual data source)
    // In a real application, you would load your own geoJSON data
    d3.json("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json")
      .then(world => {
        // Convert TopoJSON to GeoJSON
        const countries = topojson.feature(world, world.objects.countries);
        
        // Function to get country risk level
        const getCountryRisk = (country) => {
          const iso = country.properties.iso_a3;
          return countryRiskData[iso]?.riskLevel || 0;
        };

        // Function to get country details
        const getCountryDetails = (country) => {
          const iso = country.properties.iso_a3;
          return countryRiskData[iso];
        };

        // Draw the map
        svg.selectAll("path")
          .data(countries.features)
          .join("path")
          .attr("d", path)
          .attr("fill", d => {
            const risk = getCountryRisk(d);
            return risk ? riskColorScale(risk) : "#ccc";
          })
          .attr("stroke", "#fff")
          .attr("stroke-width", 0.5)
          .on("mouseover", (event, d) => {
            const countryData = getCountryDetails(d);
            if (countryData) {
              tooltip
                .style("opacity", 1)
                .html(`
                  <strong>${d.properties.name}</strong><br>
                  Risk Level: ${countryData.riskLevel}/5 (${countryData.alertLevel})<br>
                  ${countryData.details}
                `)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
            }
          })
          .on("mouseout", () => {
            tooltip.style("opacity", 0);
          })
          .on("click", (event, d) => {
            const countryData = getCountryDetails(d);
            if (countryData) {
              alert(`Country Detail View: ${d.properties.name}\nRisk: ${countryData.alertLevel}\n${countryData.details}`);
              // In a real app, this would open a detailed view for the country
            }
          });

        // Add high alert markers
        svg.selectAll("circle")
          .data(countries.features.filter(d => getCountryRisk(d) >= 4))
          .join("circle")
          .attr("cx", d => projection(d3.geoCentroid(d))[0])
          .attr("cy", d => projection(d3.geoCentroid(d))[1])
          .attr("r", 5)
          .attr("fill", "yellow")
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("class", "alert-marker");
      })
      .catch(error => console.error("Error loading or processing the map data:", error));

    // Add legend
    const legend = svg.append("g")
      .attr("transform", `translate(20, ${height - 110})`);

    const legendTitle = legend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .attr("font-weight", "bold")
      .text("Risk Level");

    const legendItems = [
      { level: 1, label: "Low" },
      { level: 2, label: "Medium-Low" },
      { level: 3, label: "Medium" },
      { level: 4, label: "High" },
      { level: 5, label: "Critical" }
    ];

    legendItems.forEach((item, i) => {
      legend.append("rect")
        .attr("x", 0)
        .attr("y", 10 + i * 20)
        .attr("width", 15)
        .attr("height", 15)
        .attr("fill", riskColorScale(item.level));

      legend.append("text")
        .attr("x", 20)
        .attr("y", 22 + i * 20)
        .text(`${item.level}: ${item.label}`);
    });

    // Add alert marker to legend
    legend.append("circle")
      .attr("cx", 7.5)
      .attr("cy", 10 + legendItems.length * 20 + 7.5)
      .attr("r", 5)
      .attr("fill", "yellow")
      .attr("stroke", "black")
      .attr("stroke-width", 1);

    legend.append("text")
      .attr("x", 20)
      .attr("y", 22 + legendItems.length * 20)
      .text("High Alert");

  }, []);

  return (
    <div className="risk-heatmap">
      <svg ref={svgRef}></svg>
      <div
        ref={tooltipRef}
        style={{
          position: "absolute",
          opacity: 0,
          backgroundColor: "white",
          border: "1px solid #ddd",
          borderRadius: "4px",
          padding: "10px",
          pointerEvents: "none",
          fontSize: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
        }}
      ></div>
    </div>
  );
};

export default GlobalRiskHeatmap;
