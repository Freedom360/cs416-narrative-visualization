var currentScene = 1;
var data;

// Load data and initialize the first scene
d3.csv("https://raw.githubusercontent.com/Freedom360/cs416-narrative-visualization/main/data/Unicorn_Clean.csv").then(function(data) {
    data.forEach(function(d) {
        d.valuation = +d["Valuation ($B)"];
    });
    data = data;
    console.log(data[0]);
  });


document.getElementById("prevButton").addEventListener("click", function() {
    if (currentScene > 1) currentScene--;
    updateScene();
});

document.getElementById("nextButton").addEventListener("click", function() {
    if (currentScene < 4) currentScene++;
    updateScene();
});

function updateScene() {
    console.log("Updating to scene:", currentScene);
    if (currentScene === 1) drawScene1();
    // else if (currentScene === 2) drawScene2();
    // else if (currentScene === 3) drawScene3();
    // else if (currentScene === 4) drawScene4();
}



function drawScene1() {
    d3.select("#visualization").html("");

    const width = 960;
    const height = 600;

    const svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoMercator()
        .scale(150)
        .translate([width / 2, height / 1.5]);

    const path = d3.geoPath().projection(projection);

    const color = d3.scaleQuantize([0, d3.max(data, d => d.count)], d3.schemeBlues[9]);

    const countryCounts = d3.rollup(data, v => v.length, d => d.country);

    d3.json("data/world-110m.json").then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;

        svg.append("g")
            .selectAll("path")
            .data(countries)
            .enter().append("path")
            .attr("fill", d => {
                const count = countryCounts.get(d.properties.name) || 0;
                return color(count);
            })
            .attr("d", path)
            .append("title")
            .text(d => `${d.properties.name}: ${countryCounts.get(d.properties.name) || 0} unicorns`);

        svg.append("path")
            .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
            .attr("class", "mesh")
            .attr("d", path);
    }).catch(error => {
        console.error("Error loading the TopoJSON file:", error);
    });
}
