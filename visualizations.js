var currentScene = 1;
var unicornData = [];

d3.csv("data/Unicorn_Clean.csv").then(data => {
    unicornData = data;
    console.log('data loaded:', unicornData)
    updateScene();
});

document.getElementById("prevButton").addEventListener("click", () => {
    if (currentScene > 1) currentScene--;
    updateScene();
});

document.getElementById("nextButton").addEventListener("click", () => {
    if (currentScene < 4) currentScene++;
    updateScene();
});

function updateScene() {
    if (currentScene === 1) drawScene1();
    else if (currentScene === 2) drawScene2();
    else if (currentScene === 3) drawScene3();
    else if (currentScene === 4) drawScene4();
}

// function drawScene1() {
//     d3.select("#visualization").html("");
//     // Your D3.js code for the first scene
// }

function drawScene1() {
    console.log('scene 1 start')
    d3.select("#visualization").html("");

    const svg = d3.select("#visualization").append("svg")
        .attr("width", 800)
        .attr("height", 600);
    
    console.log('data aggregated')
    // Aggregate data by country
    const countryData = d3.group(unicornData, d => d.country);
    const countries = Array.from(countryData, ([country, startups]) => ({ country, count: startups.length }));

    const x = d3.scaleBand().domain(countries.map(d => d.country)).range([0, 800]).padding(0.1);
    const y = d3.scaleLinear().domain([0, d3.max(countries, d => d.count)]).nice().range([600, 0]);
    
    console.log('making visual')
    svg.append("g")
        .selectAll("rect")
        .data(countries)
        .enter().append("rect")
        .attr("x", d => x(d.country))
        .attr("y", d => y(d.count))
        .attr("height", d => 600 - y(d.count))
        .attr("width", x.bandwidth())
        // .attr("fill", "steelblue");

    svg.append("g").call(d3.axisLeft(y));
    svg.append("g").attr("transform", "translate(0,600)").call(d3.axisBottom(x));
    console.log('visual created')
    // Add annotations
    addAnnotations(svg, [
        { note: { label: "Highest count", title: "Country with most unicorns" }, x: x(countries[0].country), y: y(countries[0].count), dy: -30, dx: 30 }
    ]);
    console.log('annotated')
}
console.log('viz 1 done')


function drawScene2() {
    d3.select("#visualization").html("");
    // Your D3.js code for the second scene
}

function drawScene3() {
    d3.select("#visualization").html("");
    // Your D3.js code for the third scene
}

function drawScene4() {
    d3.select("#visualization").html("");
    // Your D3.js code for the fourth scene
}

// Initialize the first scene
updateScene();
