// import Cell from "./cell";

// import dijkstrasAlgo from "../algorithms/dijkstras";

class Cell {
    constructor(id, status) {
        this.id = id;
        this.status = status;

        this.distance = Infinity;
        this.weight = 0;

        this.previousCell = null;
        this.direction = null;
        this.path = null;
    }
}

function Grids(height, width) {
    this.height = height;
    this.width = width;

    this.startId = null;
    this.finishId = null;

    this.cells = {};
    this.gridsArray = [];

    // Cells in order of their Animation
    this.cellsInOrder = [];

    this.isProcessing = false;

    this.isMouseClickedAndHold = false;

    this.pressedCellStatus = "normal";
    this.previousPressedCellStatus = null;

    this.previousSwitchedCell = null;
    this.previousSwitchedCellWeight = null;

    // this.storedPreviousStatus = null;

    this.shortestPathCells = [];

    this.areGridsCleared = true;

    this.ctrlActivated = false;

    this.selectedAlgo = "dijkstras";

}

/* Prototype property is basically an object (also known as Prototype object), where we can attach methods and properties in a prototype object, which enables all the other objects to inherit these methods and properties. */

Grids.prototype.initialise = function () {
    this.createGrid();
    this.gridsEventListeners();
    this.buttonActions();
};

Grids.prototype.createGrid = function () {

    let tableHTML = "";
    let h = Math.floor(this.height / 2);
    let w = Math.floor(this.width / 4);

    for (let row = 0; row < this.height; row++) {

        let currentArrayRow = [];
        let currentHTMLRow = `<tr id="row ${row}">`;

        for (let column = 0; column < this.width; column++) {

            let currentCellId = `${row}x${column}`;
            let currentCell, currentCellStatus;

            if (row === h && column === w) {
                currentCellStatus = "start";
                this.startId = `${currentCellId}`;
            } else if (row === h && column === 3 * w) {
                currentCellStatus = "finish";
                this.finishId = `${currentCellId}`;
            } else {
                currentCellStatus = "unvisited";
            }

            currentCell = new Cell(currentCellId, currentCellStatus);
            currentArrayRow.push(currentCell);
            currentHTMLRow += `<td id="${currentCellId}" class="${currentCellStatus}"></td>`;
            this.cells[`${currentCellId}`] = currentCell;
        }

        this.gridsArray.push(currentArrayRow);
        tableHTML += `${currentHTMLRow}</tr>`;
    }
    document.getElementById("grids").innerHTML = tableHTML;
};


Grids.prototype.gridsEventListeners = function () {
    let grids = this;

    for (let row = 0; row < grids.height; row++) {

        for (let column = 0; column < grids.width; column++) {

            let currentCellId = `${row}x${column}`;
            let currentElement = document.getElementById(currentCellId);
            let currentCell = grids.gridsArray[row][column];

            currentElement.onmousedown = (e) => {
                e.preventDefault();
                if (!this.isProcessing && !grids.isMouseClickedAndHold) {
                    grids.isMouseClickedAndHold = true;
                    if (currentCell.status === "start" || currentCell.status === "finish") {
                        grids.pressedCellStatus = currentCell.status;
                    } else {
                        grids.pressedCellStatus = "normal";
                        grids.changeNormalCell(currentCell);
                    }
                }
            }

            currentElement.onmouseup = () => {
                if (!this.isProcessing && grids.isMouseClickedAndHold) {
                    grids.isMouseClickedAndHold = false
                    if (grids.pressedCellStatus === "start") {
                        grids.startId = currentCellId;
                    } else if (grids.pressedCellStatus === "finish") {
                        grids.finishId = currentCellId;
                    }
                    grids.pressedCellStatus = "normal";
                }
            }

            currentElement.onmouseenter = () => {
                if (!this.isProcessing && grids.isMouseClickedAndHold) {
                    if (grids.isMouseClickedAndHold && grids.pressedCellStatus !== "normal") {
                        grids.changeSpecialCell(currentCell);
                        if (grids.pressedCellStatus === "start" && currentCellId !== this.finishId) {
                            grids.startId = currentCellId;
                            document.getElementById(grids.startId).className = "start";
                            // document.getElementById(grids.finishId).className = "finish";
                            if (!this.areGridsCleared) {
                                this.plotInstantly();
                            }
                        } else if (grids.pressedCellStatus === "finish" && currentCellId != this.startId) {
                            grids.finishId = currentCellId;
                            document.getElementById(grids.finishId).className = "finish";
                            // document.getElementById(grids.startId).className = "start";
                            if (!this.areGridsCleared) {
                                this.plotInstantly();
                            }
                        }
                    } else {
                        grids.changeNormalCell(currentCell);
                    }
                }
            }

            currentElement.onmouseleave = function () {
                if (grids.isMouseClickedAndHold && !this.isProcessing && grids.pressedCellStatus !== "normal") {
                    grids.changeSpecialCell(currentCell);
                }
            }
        }
    }
};

Grids.prototype.changeNormalCell = function (currentCell) {
    if (currentCell.status === "start" || currentCell.status === "finish") return;
    if (!this.ctrlActivated) {
        if (currentCell.status !== "wall") {
            currentCell.status = "wall";
            document.getElementById(currentCell.id).className = "wall";
        } else {
            currentCell.status = "unvisited";
            document.getElementById(currentCell.id).className = "unvisited";
        }
        currentCell.weight = 0;
    } else if (this.ctrlActivated && this.selectedAlgo != "bfs" && this.selectedAlgo != "dfs") {
        if (currentCell.weight === 0) {
            currentCell.status = "weighted";
            currentCell.weight = 10;
            document.getElementById(currentCell.id).className = "weighted unvisited";
        } else {
            currentCell.status = "unvisited";
            currentCell.weight = 0;
            document.getElementById(currentCell.id).className = "unvisited";
        }
    }
};

Grids.prototype.changeSpecialCell = function (currentCell) {
    let currentElement = document.getElementById(currentCell.id),
        previousElement;
    if (this.previousSwitchedCell) previousElement = document.getElementById(this.previousSwitchedCell.id);
    if (currentCell.status !== "start" && currentCell.status !== "finish") {
        if (this.previousSwitchedCell) {

            this.previousSwitchedCell.status = this.previousPressedCellStatus;

            if (!this.previousSwitchedCellWeight) {
                this.previousSwitchedCell.weight = 0;
                previousElement.className = this.previousPressedCellStatus;
            }
            else {
                previousElement.className = "weighted unvisited";
                this.previousSwitchedCell.weight = 10;
            }

            this.previousSwitchedCell = null;
            this.previousSwitchedCellWeight = currentCell.weight;

            this.previousPressedCellStatus = currentCell.status;
            currentElement.className = this.pressedCellStatus;
            currentCell.status = this.pressedCellStatus;

            currentCell.weight = 0;
        }
    } else if (!this.isProcessing && currentCell.status !== this.pressedCellStatus) {
        // if (!this.previousSwitchedCell) {
        //     this.previousPressedCellStatus = "unvisited";
        //     this.previousSwitchedCell = currentCell;
        //     currentCell.status = this.pressedCellStatus;
        //     currentElement.className=this.pressedCellStatus;
        // } else {
        //     previousElement.className=this.previousSwitchedCell.status;
        //     this.previousPressedCellStatus=currentCell.status;
        //     this.previousSwitchedCell=currentCell;
        //     currentCell.status = this.pressedCellStatus;
        //     currentElement.className = this.pressedCellStatus;
        // }
        this.previousSwitchedCell.status = this.pressedCellStatus;
        previousElement.className = this.pressedCellStatus;

    } else if (currentCell.status === this.pressedCellStatus) {
        this.previousSwitchedCell = currentCell;
        currentElement.className = this.previousPressedCellStatus;
        currentCell.status = this.previousPressedCellStatus;
    }
};



Grids.prototype.buttonActions = function () {
    document.getElementById("visualizeButton").onclick = () => {
        if (!this.isProcessing) {

            this.clearPath();

            this.isProcessing = true;
            this.cellsInOrder = [];
            let done;
            if (this.selectedAlgo === "dijkstras")
                done = dijkstrasAlgo(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);
            else if (this.selectedAlgo === "dfs") {
                done = dfs(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);
                this.cells[this.startId].status = "start";
                this.cells[this.finishId].status = "finish";
            }
            else if (this.selectedAlgo === "bfs") {
                done = bfs(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);
                this.cells[this.startId].status = "start";
                this.cells[this.finishId].status = "finish";
            }
            else done = aStar(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);

            let temp = this.cellsInOrder;
            let i = 0;
            for (const it of temp) {
                i++;
                if (it.status === "wall") break;
                // if (it.id !== this.startId && it.id !== this.finishId)
                setTimeout(() => {
                    let temp = document.getElementById(it.id);
                    if (it.id === this.startId) {
                        it.status = "start";
                        temp.className = "start visited";
                    } else if (it.id === this.finishId) {
                        it.status = "finish";
                        temp.className = "finish visited";
                    } else if (it.status === "weighted") {
                        temp.className = "visited weighted";
                    }
                    else {
                        temp.className = it.status;
                    }
                }, 10 * i);
            }
            i += 2;
            setTimeout(() => {
                if (done === "success") this.plotShortestPath();
                else {
                    if (this.startId !== this.finishId) {
                        document.getElementById("audio").play();
                        alert("Target cell cannot be reached!");
                    }
                }
                this.isProcessing = false;
                this.areGridsCleared = false;
            }, 10 * i);
        }
    }

    document.getElementById("AlgoButtonDijkstra").onclick = () => {
        this.selectedAlgo = "dijkstras";
        document.getElementById("aboutChoosenAlgo").innerHTML = `<b>DIJKSTRA'S ALGORITHM</b> ->
        <img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/e22162be85d06b346f3b7f7aad9746da0c1019c9"
        aria-hidden="true" style="vertical-align: -0.838ex; width:19.435ex; height:2.843ex;"
        alt="{\displaystyle \Theta (|E|+|V|\log |V|)}">`;
        this.clearPath();
    }

    document.getElementById("AlgoButtonDFS").onclick = () => {
        this.selectedAlgo = "dfs";
        document.getElementById("aboutChoosenAlgo").innerHTML = `<b>DEPTH-FIRST SEARCH ALGORITHM (Un-Weighted Algo)</b> (<i>No guaranteed shortest path</i>) ->
        <img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/a7cf317fbe3965ae3164f28c1f6858696adb23f4" class="mwe-math-fallback-image-inline" aria-hidden="true" style="vertical-align: -0.838ex; width:12.573ex; height:2.843ex;" alt="O(|V| + |E|)">`;
        this.clearPath();
    }

    document.getElementById("AlgoButtonBFS").onclick = () => {
        this.selectedAlgo = "bfs";
        document.getElementById("aboutChoosenAlgo").innerHTML = `<b>BREADTH-FIRST SEARCH ALGORITHM (Un-Weighted Algo)</b> ->
        <img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/3723b61a52380fbdf4c6892af96ebbfe8fb76a22" class="mwe-math-fallback-image-inline" aria-hidden="true" style="vertical-align: -0.838ex; width:21.344ex; height:3.176ex;" alt="O(|V|+|E|)=O(b^{d})">`;
        this.clearPath();
    }

    // document.getElementById("AlgoButtonA*").onclick = () => {
    //     this.selectedAlgo = "aStar";
    //     document.getElementById("aboutChoosenAlgo").innerHTML = `<b>A-STAR ALGORITHM</b> ->
    //     <img src="https://wikimedia.org/api/rest_v1/media/math/render/svg/393f923dec17cb0b4ef211b01b2fe2ab2578c7a8" class="mwe-math-fallback-image-inline" aria-hidden="true" style="vertical-align: -0.838ex; width:15.423ex; height:3.176ex;" alt="O(|E|)=O(b^{d})">`;
    // }

    document.getElementById("ButtonClearPath").onclick = () => {
        if (!this.isProcessing)
            this.clearPath();
    }

    document.getElementById("ButtonClearGrids").onclick = () => {
        if (!this.isProcessing)
            this.clearGrids();
    }
};



Grids.prototype.plotShortestPath = function () {
    this.shortestPathCells = [];

    // this.shortestPathCells.unshift(this.cells[this.cells[this.finishId]]);
    document.getElementById(this.startId).className = "start shortestPath";
    let currentCell = this.cells[this.cells[this.finishId].previousCell];
    while (currentCell.id !== this.startId) {
        this.shortestPathCells.push(currentCell);
        if (currentCell.status === "weighted")
            document.getElementById(currentCell.id).className = "weighted shortestPath";
        else document.getElementById(currentCell.id).className = "shortestPath";
        currentCell = this.cells[currentCell.previousCell];
    }
    document.getElementById(this.finishId).className = "finish shortestPath";
    // this.shortestPathCells.unshift(this.cells[this.cells[this.startId]]);

};


Grids.prototype.plotInstantly = function () {
    this.cellsInOrder = [];
    this.clearPath("From Instant Plot");
    let done;

    if (this.selectedAlgo === "dijkstras")
        done = dijkstrasAlgo(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);
    else if (this.selectedAlgo === "dfs") {
        done = dfs(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);
        this.cells[this.startId].status = "start";
        this.cells[this.finishId].status = "finish";
    }
    else if (this.selectedAlgo === "bfs") {
        done = bfs(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);
        this.cells[this.startId].status = "start";
        this.cells[this.finishId].status = "finish";
    }
    else done = aStar(this.cells, this.startId, this.finishId, this.gridsArray, this.cellsInOrder);

    let temp = this.cellsInOrder;
    for (const it of temp) {
        if (it.status === "wall") break;
        let temp = document.getElementById(it.id);
        if (it.id === this.startId) {
            it.status = "start";
            temp.className = "start visited";
        } else if (it.id === this.finishId) {
            it.status = "finish";
            temp.className = "finish visited";
        } else if (it.status === "weighted")
            temp.className = "visited weighted";
        else
            temp.className = it.status;
    }
    this.areGridsCleared = false;
    if (done === "success") this.plotShortestPath();
    else {
        if (this.startId !== this.finishId)
            document.getElementById("audio").play();
        // alert("Target cell cannot be reached!");
    }
};

Grids.prototype.clearPath = function (fromAddress) {
    let start = this.cells[this.startId],
        finish = this.cells[this.finishId];
    start.status = "start";
    finish.status = "finish";
    document.getElementById(start.id).className = "start";
    document.getElementById(finish.id).className = "finish";

    if (fromAddress !== "From Instant Plot") this.areGridsCleared = true;

    Object.keys(this.cells).forEach(id => {
        let currentCell = this.cells[id];
        let relevantStatuses = ["wall", "start", "finish"];
        if (!relevantStatuses.includes(currentCell.status)) {
            let temp = document.getElementById(id);
            if (this.selectedAlgo !== "dfs" && this.selectedAlgo !== "bfs" && currentCell.status === "weighted") temp.className = "weighted";
            else {
                currentCell.status = "unvisited";
                temp.className = "unvisited";
            }
        }
        currentCell.distance = Infinity;
        currentCell.direction = null;
    });
};

Grids.prototype.clearGrids = function () {
    let start = this.cells[this.startId],
        finish = this.cells[this.finishId];
    start.status = "start";
    finish.status = "finish";
    document.getElementById(start.id).className = "start";
    document.getElementById(finish.id).className = "finish";

    this.areGridsCleared = true;

    Object.keys(this.cells).forEach(id => {
        let currentCell = this.cells[id];
        if (currentCell.id != this.startId && currentCell.id != this.finishId) {
            currentCell.status = "unvisited";
            document.getElementById(id).className = "unvisited";
        }
        currentCell.distance = Infinity;
        currentCell.direction = null;
        currentCell.weight = 0;
    });
    this.previousSwitchedCell = null;
    this.previousPressedCellStatus = null;
    this.pressedCellStatus = "normal";
};



let navbarHeight = document.getElementById("navBarDivId").clientHeight;
let textHeight = document.getElementById("aboutChoosenAlgo").clientHeight;

let height = Math.floor((document.documentElement.clientHeight - navbarHeight - textHeight) / 25);
let width = Math.floor(document.documentElement.clientWidth / 25);

let newGrids = new Grids(height, width)
newGrids.initialise();

window.onkeydown = (e) => {
    newGrids.ctrlActivated = e.ctrlKey;
}

window.onkeyup = (e) => {
    newGrids.ctrlActivated = false;
}










































function bfs(cells, startId, finishId, gridsArray, cellsInOrder) {
    console.log("came to bfs");
    if (!startId || !finishId || startId === finishId)
        return "failed";

    let bfsQueue = [cells[startId]];
    let checked = {};
    checked[startId] = true;

    while (bfsQueue.length) {
        let currentCell = bfsQueue.shift();
        currentCell.status = "visited";
        cellsInOrder.push(currentCell);
        if (currentCell.id === finishId) return "success";
        let availableNeighbours = getNeighbors(currentCell.id, cells, gridsArray);
        availableNeighbours.forEach(cellId => {
            if (!checked[cellId]) {
                cells[cellId].previousCell = currentCell.id;
                bfsQueue.push(cells[cellId]);
                checked[cellId] = true;
            }
        });
    }

    return "failed";
}







function dfs(cells, startId, finishId, gridsArray, cellsInOrder) {
    console.log("came to dfs");
    if (!startId || !finishId || startId === finishId)
        return "failed";

    let dfsQueue = [cells[startId]];
    let checked = {};
    checked[startId] = true;

    while (dfsQueue.length) {
        let currentCell = dfsQueue.pop();
        currentCell.status = "visited";
        cellsInOrder.push(currentCell);
        checked[currentCell.id] = true;
        if (currentCell.id === finishId) return "success";
        let availableNeighbours = getNeighborsD(currentCell.id, cells, gridsArray);
        availableNeighbours.forEach(cellId => {
            if (!checked[cellId]) {
                cells[cellId].previousCell = currentCell.id;
                dfsQueue.push(cells[cellId]);
            }
        });
    }

    return "failed";
}

function getNeighborsD(cellId, cells, gridsArray) {
    let coordinates = cellId.split('x');
    let x = parseInt(coordinates[0]),
        y = parseInt(coordinates[1]);
    let neighbors = [], tempNeighborId;

    if (gridsArray[x - 1] && gridsArray[x - 1][y]) {
        tempNeighborId = `${(x - 1).toString()}x${y.toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.unshift(tempNeighborId);
    }

    if (gridsArray[x][y + 1]) {
        tempNeighborId = `${x.toString()}x${(y + 1).toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.unshift(tempNeighborId);
    }

    if (gridsArray[x + 1] && gridsArray[x + 1][y]) {
        tempNeighborId = `${(x + 1).toString()}x${y.toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.unshift(tempNeighborId);
    }

    if (gridsArray[x][y - 1]) {
        tempNeighborId = `${x.toString()}x${(y - 1).toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.unshift(tempNeighborId);
    }

    return neighbors;
}







function dijkstrasAlgo(cells, startId, finishId, gridsArray, cellsInOrder) {
    console.log("came to dijkstras");
    if (!startId || !finishId || startId === finishId)
        return "failed";

    cells[startId].distance = 0;
    cells[startId].direction = "right";

    let unVisitedCells = Object.keys(cells);


    while (unVisitedCells.length) {
        let currentCell = closestCell(cells, unVisitedCells);
        if (currentCell.status === "wall") continue;
        while (currentCell.status === "wall" && unVisitedCells.length) {
            currentCell = closestCell(cells, unVisitedCells);
        }
        if (currentCell.distance === Infinity)
            return "failed";
        if (currentCell.status === "wall") continue;
        // if (currentCell.status !== "start" && currentCell.status !== "finish" && currentCell.status !== "wall") {
        //     if (currentCell.status === "weighted")
        //         currentCell.status = "weighted";
        //     else 
        //     currentCell.status = "visited";
        // }
        cellsInOrder.push(currentCell);
        // currentCell.status = "visited";
        if (currentCell.status !== "weighted")
            currentCell.status = "visited";
        if (currentCell.id === finishId)
            return "success";
        updateNeighbors(cells, currentCell, gridsArray);
    }
}

function closestCell(cells, unVisitedCells) {
    let closest_cell, closest_index;
    for (let i = 0; i < unVisitedCells.length; i++) {
        if (!closest_cell || closest_cell.distance > cells[unVisitedCells[i]].distance) {
            closest_cell = cells[unVisitedCells[i]];
            closest_index = i;
        }
    }
    // The splice() method adds / removes items to / from an array, and returns the removed item(s).
    unVisitedCells.splice(closest_index, 1);
    return closest_cell;
}

function updateNeighbors(cells, currentCell, gridsArray) {
    let neighbors = getNeighbors(currentCell.id, cells, gridsArray);
    for (const neighborId of neighbors) {
        updateCell(currentCell, cells[neighborId]);
    }
}

function getNeighbors(cellId, cells, gridsArray) {
    let coordinates = cellId.split('x');
    let x = parseInt(coordinates[0]),
        y = parseInt(coordinates[1]);
    let neighbors = [], tempNeighborId;

    if (gridsArray[x - 1] && gridsArray[x - 1][y]) {
        tempNeighborId = `${(x - 1).toString()}x${y.toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.push(tempNeighborId);
    }

    if (gridsArray[x + 1] && gridsArray[x + 1][y]) {
        tempNeighborId = `${(x + 1).toString()}x${y.toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.push(tempNeighborId);
    }

    if (gridsArray[x][y - 1]) {
        tempNeighborId = `${x.toString()}x${(y - 1).toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.push(tempNeighborId);
    }

    if (gridsArray[x][y + 1]) {
        tempNeighborId = `${x.toString()}x${(y + 1).toString()}`;
        if (cells[tempNeighborId].status !== "wall")
            neighbors.push(tempNeighborId);
    }

    return neighbors;
}

function updateCell(currentCell, finishCell) {
    let distance = getDistance(currentCell, finishCell);
    let distanceToCompare = currentCell.distance + finishCell.weight + distance[0];
    if (distanceToCompare < finishCell.distance) {
        finishCell.distance = distanceToCompare;
        finishCell.previousCell = currentCell.id;
        finishCell.path = distance[1];
        finishCell.direction = distance[2];
    }
}

function getDistance(cell1, cell2) {
    let cell1Coord = cell1.id.split('x'),
        cell2Coord = cell2.id.split('x');
    let x1, x2, y1, y2;
    x1 = parseInt(cell1Coord[0]);
    x2 = parseInt(cell2Coord[0]);
    y1 = parseInt(cell1Coord[1]);
    y2 = parseInt(cell2Coord[1]);

    // distance = [no.of moves,path,direction]

    if (x1 > x2) {
        if (cell1.direction === "up")
            return [1, ["front"], "up"];
        else if (cell1.direction === "down")
            return [3, ["left", "left", "front"], "up"];
        else if (cell1.direction === "left")
            return [2, ["right", "front"], "up"];
        else
            return [2, ["left", "front"], "up"];
    } else if (x1 < x2) {
        if (cell1.direction === "down")
            return [1, ["front"], "down"];
        else if (cell1.direction === "up")
            return [3, ["left", "left", "front"], "down"];
        else if (cell1.direction === "right")
            return [2, ["right", "front"], "down"];
        else
            return [2, ["left", "front"], "down"];
    }
    if (y1 > y2) {
        if (cell1.direction === "left")
            return [1, ["front"], "left"];
        else if (cell1.direction === "right")
            return [3, ["left", "left", "front"], "left"];
        else if (cell1.direction === "down")
            return [2, ["right", "front"], "left"];
        else
            return [2, ["left", "front"], "left"];
    } else if (y1 < y2) {
        if (cell1.direction === "right")
            return [1, ["front"], "right"];
        else if (cell1.direction === "left")
            return [3, ["left", "left", "front"], "right"];
        else if (cell1.direction === "up")
            return [2, ["right", "front"], "right"];
        else
            return [2, ["left", "front"], "right"];
    }
}
