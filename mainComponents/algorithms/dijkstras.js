function dijkstrasAlgo(cells, startId, finishId, gridsArray, cellsInOrder) {

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
        cellsInOrder.push(currentCell);
        if (currentCell.status !== "start" && currentCell.status !== "finish" && currentCell.status != "wall") {
            currentCell.status = "visited";
        }
        if (currentCell.id === finishId)
            return "success";
        updateNeighbors(cells, currentCell, gridsArray);
    }

    return "failed";
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

export default dijkstrasAlgo;