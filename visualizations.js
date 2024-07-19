let currentScene = 1;

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

function drawScene1() {
    d3.select("#visualization").html("");
    // Your D3.js code for the first scene
}

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
