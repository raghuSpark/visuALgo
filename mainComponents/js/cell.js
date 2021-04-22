class Cell {
    constructor(id, status) {
        this.id = id;
        this.status = status;

        this.distance = Infinity;
        this.weight = 0;

        this.previousNode = null;
        this.direction = null;
        this.path=null;
    }
}

export default Cell;