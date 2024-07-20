var currentScene = 1;
var unicornData = [];

// Load data and initialize the first scene
d3.csv("/data/Unicorn_Clean.csv").then(function(data) {
    data.forEach(function(d) {
        d.valuation = +d["Valuation ($B)"];
    });
    console.log(data[0]);
  });


// document.getElementById("prevButton").addEventListener("click", function() {
//     if (currentScene > 1) currentScene--;
//     updateScene();
// });

// document.getElementById("nextButton").addEventListener("click", function() {
//     if (currentScene < 4) currentScene++;
//     updateScene();
// });

// function updateScene() {
//     console.log("Updating to scene:", currentScene);
//     if (currentScene === 1) drawScene1();
//     else if (currentScene === 2) drawScene2();
//     else if (currentScene === 3) drawScene3();
//     else if (currentScene === 4) drawScene4();
// }

// function drawScene1() {

// }