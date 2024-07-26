var currentScene = 1;
var unicornData; // global variable

// Load data
d3.csv(
  'https://raw.githubusercontent.com/Freedom360/cs416-narrative-visualization/main/data/Unicorn_Clean.csv'
)
  .then(function (data) {
    data.forEach(function (d) {
      d.valuation = +d['Valuation ($B)'];
    });
    unicornData = data;
    console.log(unicornData[0]);
    updateScene(); // Initialize the first scene after data is loaded
  })
  .catch(function (error) {
    console.error('Error loading the CSV file:', error);
  });

  // creating buttons and updating scene 
document.getElementById('prevButton').addEventListener('click', function () {
  if (currentScene > 1) currentScene--;
  updateScene();
});

document.getElementById('nextButton').addEventListener('click', function () {
  if (currentScene < 4) currentScene++;
  updateScene();
});

// function that changes the scene
function updateScene() {
  console.log('Updating to scene:', currentScene);
  if (currentScene === 1) drawScene1();
  // else if (currentScene === 2) drawScene2();
  // else if (currentScene === 3) drawScene3();
  // else if (currentScene === 4) drawScene4();
}

// map unicorndata country to topojson country name
const countryMapping = {
  "United States of America": "United States",
};

// creating visualization for scene 1
function drawScene1() {
  console.log('draw 1');
  d3.select('#visualization').html('');

  const width = 960;
  const height = 600;

  const svg = d3
    .select('#visualization')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

// creating geographic projection for map
  const projection = d3
    .geoMercator()
    .scale(150)
    .translate([width / 2, height / 1.5]);

// translates coordinates into svg format
  const path = d3.geoPath().projection(projection);

  // Check unicorndata exists and is loaded
  if (!unicornData) {
    console.error('unicornData is not defined');
    return;
  }

  // Getting the count of unicorns for each country
  const countryCounts = d3.rollup(unicornData, v => v.length, d => d.Country);

  // convert to array
  const countryCountsArray = Array.from(countryCounts, ([country, count]) => ({ country, count }));

  // mapping unicorndata countries to topojson countries and their counts
  const countryCountsMap = new Map(
    countryCountsArray.map(d => [countryMapping[d.country] || d.country, d.count])
  );
// topojson to create the map
  d3.json('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
    .then(world => {
      const countries = topojson.feature(
        world,
        world.objects.countries
      ).features;

      // tooltip info
      const tooltip = d3.select('#tooltip')
        .style('position', 'absolute')
        .style('background', 'lightgray')
        .style('padding', '5px')
        .style('border-radius', '3px')
        .style('pointer-events', 'none')
        .style('visibility', 'hidden');
    
      // map viz created 
      svg.append("g")
        .selectAll("path")
        .data(countries)
        .enter().append("path")
		.attr('fill', d => {
			const countryName = d.properties.name; // getting country name from topojson
			const mappedCountryName = countryMapping[countryName] || countryName; 
			const countData = countryCountsArray.find(c => c.country === mappedCountryName); // getting counts for mapped countries
			return countData ? '#1f77b4' : '#ddd'; // blue for count > 0, otherwise grey
		})
        .attr("d", path)
        // tooltip functionality on map when you hover over country
        .on("mouseover", function(event, d) {
          const countryName = countryMapping[d.properties.name] || d.properties.name;
          const count = countryCountsMap.get(countryName) || 0;
          tooltip
            .html(`${countryName}: ${count} Unicorns`)
            .style("visibility", "visible");
        })
        .on("mousemove", function(event) {
          tooltip
            .style("top", (event.pageY + 5) + "px")
            .style("left", (event.pageX + 5) + "px");
        })
        .on("mouseout", function() {
          tooltip.style("visibility", "hidden");
        });

      svg
        .append('path')
        .datum(topojson.mesh(world, world.objects.countries, (a, b) => a !== b))
        .attr('class', 'mesh')
        .attr('d', path);
    })
        // map annotation for us count
        const annotations = [{
          note: {
              title: "Most Unicorns:",
              label: "United States has 478 unicorns.",
              wrap: 120
          },
          type: d3.annotationLabel,
          x: projection([-120, 20])[0],
          y: projection([-30,40])[1],
          dx: -50,
          dy: 50
      }];

      const makeAnnotations = d3.annotation()
          .annotations(annotations);

      svg.append('g')
          .attr('class', 'annotations')
          .call(makeAnnotations);
  ;

}

