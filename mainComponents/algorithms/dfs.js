function dfs(cells, startId, finishId, gridsArray, cellsInOrder) {
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
        let availableNeighbours = getNeighbors(currentCell.id, cells, gridsArray);
        availableNeighbours.forEach(cellId => {
            if (!checked[cellId]) {
                cells[cellId].previousCell = currentCell.id;
                dfsQueue.push(cells[cellId]);
            }
        });
    }

    return "failed";
}

function getNeighbors(cellId, cells, gridsArray) {
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

export default dfs;