var currentScene = 0;
var unicornData; // global variable

// Load data
d3.csv(
  'https://raw.githubusercontent.com/Freedom360/cs416-narrative-visualization/main/data/Unicorn_Clean.csv'
)
  .then(function (data) {
    data.forEach(function (d) {
      d.valuation = +d['Valuation ($B)'];
      d.year = new Date(d['Date Joined']).getFullYear();
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
  if (currentScene > 0) currentScene--;
  updateScene();
});

document.getElementById('nextButton').addEventListener('click', function () {
  if (currentScene < 4) currentScene++;
  updateScene();
});

// function that changes the scene
function updateScene() {
  console.log('Updating to scene:', currentScene);
  if (currentScene === 0) {
    drawScene0();
    document.getElementById('dropdownContainer').style.display = 'none';
    document.getElementById('prevButton').style.display = 'none'; 
  }
  else if (currentScene === 1) {
  drawScene1();
  document.getElementById('dropdownContainer').style.display = 'none';
  document.getElementById('prevButton').style.display = 'block';
  }

  else if (currentScene === 2) {
    drawScene2();
    document.getElementById('dropdownContainer').style.display = 'block';
    document.getElementById('prevButton').style.display = 'block';
  }
  else if (currentScene === 3) {
    drawScene3();
    document.getElementById('dropdownContainer').style.display = 'block';
    document.getElementById('nextButton').style.display = 'none';
  }

}

function drawScene0() {
  d3.select('#visualization').html(`
  <header>
    <h1>Welcome to Our Data Visualization Platform</h1>
    <p>Explore insightful charts and analytics to understand data better. Our platform provides interactive visualizations to help you analyze trends and patterns in the data. Whether you're interested in geographical distributions, industry valuations, or temporal changes, you'll find the tools you need to gain valuable insights.</p>
  </header>
`);
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



function initializeDropdown() {
  const dropdownContainer = d3.select('#dropdownContainer').html('');
  const dropdown = dropdownContainer.append('select').attr('id', 'countryDropdown');

  dropdown.append('option').attr('value', 'all').text('All Countries');

  const countries = Array.from(new Set(unicornData.map(d => d.Country)));

  countries.forEach(country => {
    dropdown.append('option').attr('value', country).text(country);
  });

  dropdown.on('change', function() {
    const selectedCountry = d3.select(this).property('value');
    if (currentScene === 2)
      updateBarChart(selectedCountry);
      console.log('bar chart updated')
    if (currentScene === 3)
      updateLineChart(selectedCountry);
      console.log('line chart updated')
  });

  dropdown.property('value', 'all');
}

// Create the initial visualization
function drawScene2() {
  initializeDropdown();
  updateBarChart('all');
}

function updateBarChart(selectedCountry) {
  const filteredData = selectedCountry === 'all' ? unicornData : unicornData.filter(d => d.Country === selectedCountry);

  const industryValuation = d3.rollup(filteredData, v => d3.sum(v, d => d.valuation), d => d.Industry);
  const industryValuationArray = Array.from(industryValuation, ([industry, valuation]) => ({ industry, valuation }));

  d3.select('#visualization').html('');

  const margin = { top: 40, right: 40, bottom: 200, left: 60 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select('#visualization')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(industryValuationArray.map(d => d.industry))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(industryValuationArray, d => d.valuation)])
    .nice()
    .range([height, 0]);

  svg.append('g')
    .selectAll('.bar')
    .data(industryValuationArray)
    .enter().append('rect')
    .attr('class', 'bar')
    .attr('x', d => x(d.industry))
    .attr('y', d => y(d.valuation))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.valuation))
    .attr('fill', '#1f77b4')
    .on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', .9);
      tooltip.html(`Valuation: $${d.valuation.toLocaleString()}B`)
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY - 28}px`)
        .style('visibility', 'visible');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0)
      .style('visibility', 'hidden');
    });

    const tooltip = d3.select('#tooltip')
    .style('position', 'absolute')
    .style('background', 'lightgray')
    .style('padding', '5px')
    .style('border-radius', '3px')
    .style('pointer-events', 'none')
    .style('visibility', 'hidden');


  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('dy', '.35em')
    .attr('dx', '-.8em')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y));

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', -20 + height + margin.bottom)
    .attr('text-anchor', 'middle')
    .text('Industry');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 15 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('text-anchor', 'middle')
    .text('Valuation ($B)');
}

function drawScene3() {
  // Initialize the dropdown only if it's not already initialized
  if (d3.select('#countryDropdown').empty()) {
    initializeDropdown();
  }
  updateLineChart(selectedCountry = 'all');

}



function updateLineChart(selectedCountry) {
  const filteredData = selectedCountry === 'all' ? unicornData : unicornData.filter(d => d.Country === selectedCountry);

  const yearlyValuation = d3.rollup(filteredData, v => d3.sum(v, d => d.valuation), d => d.year);
  const yearlyValuationArray = Array.from(yearlyValuation, ([year, valuation]) => ({ year, valuation }));
  yearlyValuationArray.sort((a, b) => a.year - b.year);

  const countryAverage = d3.mean(yearlyValuationArray, d => d.valuation);
  d3.select('#visualization').html('');

  const margin = { top: 40, right: 40, bottom: 60, left: 60 };
  const width = 960 - margin.left - margin.right;
  const height = 500 - margin.top - margin.bottom;

  const svg = d3.select('#visualization')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand()
    .domain(yearlyValuationArray.map(d => d.year))
    .range([0, width])
    .padding(0.1);

  const y = d3.scaleLinear()
    .domain([0, d3.max(yearlyValuationArray, d => d.valuation)])
    .nice()
    .range([height, 0]);

  // Line generator
  const line = d3.line()
    .x(d => x(d.year) + x.bandwidth() / 2)
    .y(d => y(d.valuation))

  // Add the line path
  svg.append('path')
    .datum(yearlyValuationArray)
    .attr('class', 'line')
    .attr('d', line)
    .attr('fill', 'none')
    .attr('stroke', '#1f77b4')
    .attr('stroke-width', 2);

  // Add circles for data points
  svg.selectAll('.dot')
    .data(yearlyValuationArray)
    .enter().append('circle')
    .attr('class', 'dot')
    .attr('cx', d => x(d.year) + x.bandwidth() / 2)
    .attr('cy', d => y(d.valuation))
    .attr('r', 4)
    .attr('fill', '#1f77b4')
    .on('mouseover', function(event, d) {
      tooltip.transition().duration(200).style('opacity', .9);
      tooltip.html(`Valuation: $${d.valuation.toLocaleString()}B`)
        .style('left', `${event.pageX + 5}px`)
        .style('top', `${event.pageY - 28}px`)
        .style('visibility', 'visible');
    })
    .on('mouseout', function() {
      tooltip.transition().duration(500).style('opacity', 0)
      .style('visibility', 'hidden');
    });

    const tooltip = d3.select('#tooltip')
    .style('position', 'absolute')
    .style('background', 'lightgray')
    .style('padding', '5px')
    .style('border-radius', '3px')
    .style('pointer-events', 'none')
    .style('visibility', 'hidden');

  svg.append('g')
    .attr('class', 'x-axis')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .selectAll('text')
    .attr('dy', '.35em')
    .attr('dx', '-.8em')
    .attr('transform', 'rotate(-45)')
    .style('text-anchor', 'end');

  svg.append('g')
    .attr('class', 'y-axis')
    .call(d3.axisLeft(y));

  svg.append('text')
    .attr('x', width / 2)
    .attr('y', height + margin.bottom - 0)
    .attr('text-anchor', 'middle')
    .text('Year');

  svg.append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 15 - margin.left)
    .attr('x', 0 - (height / 2))
    .attr('text-anchor', 'middle')
    .text('Valuation ($B)');


      // Draw the global average line
  svg.append('line')
  .attr('x1', 0)
  .attr('y1', y(countryAverage))
  .attr('x2', width)
  .attr('y2', y(countryAverage))
  .attr('stroke', 'red')
  .attr('stroke-width', 2)
  .attr('stroke-dasharray', '4,4');


  // Add annotation for the global average line
  const annotations = [{
    note: {
      title: "Average Valuation:",
      label: `$${countryAverage.toFixed(2)}B`,
      wrap: 0
    },
    type: d3.annotationLabel,
    x: width - 10,  // Position at the end of the chart
    y: y(countryAverage) - 10,  // Position slightly above the line
    dx: 10,  // Offset for annotation
    dy: -10,
    subject: {
      radius: 5,  // Radius of the dot at the end of the annotation line
      radiusPadding: 5
    }
  }];

  const makeAnnotations = d3.annotation()
    .annotations(annotations);

  svg.append('g')
    .attr('class', 'annotations')
    .call(makeAnnotations);
    ;
  }