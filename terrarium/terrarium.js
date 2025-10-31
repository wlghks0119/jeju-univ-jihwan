const plants = document.querySelectorAll(".plant");

let highestZIndex = 10;
let terrarium = document.getElementById("terrarium");

plants.forEach(plant => {
    plant.setAttribute("draggable", true);
    plant.addEventListener("dragstart", dragStart);
    plant.addEventListener("dblclick", bringToFront);
});

terrarium.addEventListener("dragover", dragOver);
terrarium.addEventListener("drop", drop);

let draggedPlant = null;

function dragStart(e) {
    draggedPlant = e.target;
    e.dataTransfer.setData("text/plain", e.target.id);
    e.dataTransfer.effectAllowed = "move";
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

function drop(e) {
    e.preventDefault();
    const plantId = e.dataTransfer.getData("text/plain");
    const plant = document.getElementById(plantId);

    const rect = terrarium.getBoundingClientRect();
    const x = e.clientX - rect.left - plant.width / 2;
    const y = e.clientY - rect.top - plant.height / 2;

    plant.style.position = "absolute";
    plant.style.left = `${x}px`;
    plant.style.top = `${y}px`;

    terrarium.appendChild(plant);


    highestZIndex++;
    plant.style.zIndex = highestZIndex;
}

function bringToFront(e) {
    highestZIndex++;
    e.target.style.zIndex = highestZIndex;
}
