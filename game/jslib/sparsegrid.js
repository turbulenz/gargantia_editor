// Copyright (c) 2014 Turbulenz Limited
//
// SparseGridNode
//
var SparseGridNode = (function () {
    function SparseGridNode(extents, cellExtents, id, externalNode) {
        this.extents = extents;
        this.cellExtents = cellExtents;
        this.queryIndex = -1;
        this.id = id;
        this.externalNode = externalNode;
        return this;
    }
    SparseGridNode.prototype.clear = function () {
        this.queryIndex = -1;
        this.externalNode = undefined;
    };

    SparseGridNode.compare = function (a, b) {
        return (a.extents[1] - b.extents[1]);
    };

    SparseGridNode.create = // Constructor function
    function (extents, cellExtents, id, externalNode) {
        return new SparseGridNode(extents, cellExtents, id, externalNode);
    };
    SparseGridNode.version = 1;
    return SparseGridNode;
})();

//
// SparseGridCell
//
var SparseGridCell = (function () {
    function SparseGridCell(x, z, node) {
        var extents = node.extents;
        this.dirty = false;
        this.minX = x;
        this.minY = extents[1];
        this.minZ = z;
        this.maxY = extents[4];
        this.nodes = [node];
    }
    SparseGridCell.prototype.reset = function (x, z, node) {
        var extents = node.extents;
        debug.assert(this.nodes.length === 0);
        this.dirty = false;
        this.minX = x;
        this.minY = extents[1];
        this.minZ = z;
        this.maxY = extents[4];
        this.nodes[0] = node;
    };

    SparseGridCell.prototype.addNode = function (node) {
        this.dirty = true;
        var nodes = this.nodes;
        var numNodes = nodes.length;
        nodes[numNodes] = node;
        numNodes += 1;
        return numNodes;
    };

    SparseGridCell.prototype.removeNode = function (node) {
        var nodes = this.nodes;
        var numNodes = nodes.length;
        var found = false;
        var n;
        for (n = 0; n < numNodes; n += 1) {
            if (nodes[n] === node) {
                numNodes -= 1;
                nodes[n] = nodes[numNodes];
                nodes.length = numNodes;
                found = true;
                break;
            }
        }
        debug.assert(found, "Node was not found on the cell.");
        if (1 === numNodes) {
            var extents = this.nodes[0].extents;
            this.dirty = false;
            this.minY = extents[1];
            this.maxY = extents[4];
        } else {
            this.dirty = true;
        }
        return numNodes;
    };

    SparseGridCell.prototype.update = function () {
        this.dirty = false;

        var nodes = this.nodes;
        var numNodes = nodes.length;
        debug.assert(0 < numNodes);

        var maxY = nodes[numNodes - 1].extents[4];
        if (1 < numNodes) {
            // Sort nodes based on min Y
            nodes.sort(SparseGridNode.compare);

            var n = 0;
            do {
                var y = nodes[n].extents[4];
                if (maxY < y) {
                    maxY = y;
                }
                n += 1;
            } while(n < numNodes);
        }

        this.minY = nodes[0].extents[1];
        this.maxY = maxY;
    };

    SparseGridCell.create = // Constructor function
    function (x, z, node) {
        return new SparseGridCell(x, z, node);
    };
    SparseGridCell.version = 1;
    return SparseGridCell;
})();

//
// SparseGrid
//
var SparseGrid = (function () {
    function SparseGrid(cellSize) {
        this.invCellSize = (1.0 / cellSize);
        this.cellSize = cellSize;

        this.numCells = 0;
        this.cells = [];
        this.cellsMap = {};

        this.nodes = [];
        this.numNodes = 0;

        this.queryIndex = -1;
        this.queryCellPlanes = [];

        this.extents = new Float32Array(6);
        this.dirtyExtents = false;
    }
    SparseGrid.prototype.hash = function (x, z) {
        var hash;
        var byteToHex = this.byteToHex;
        if (-129 < x && x < 128 && -129 < z && z < 128) {
            /* tslint:disable:no-bitwise */
            hash = byteToHex[x & 0xff] + byteToHex[z & 0xff];
            /* tslint:enable:no-bitwise */
        } else {
            var ints = this.tempIntArray;
            var bytes = this.tempByteArray;
            ints[0] = x;
            ints[1] = z;
            if (-32769 < x && x < 32768 && -32769 < z && z < 32768) {
                hash = byteToHex[bytes[0]] + byteToHex[bytes[1]] + byteToHex[bytes[4]] + byteToHex[bytes[5]];
            } else {
                hash = byteToHex[bytes[0]];
                var n;
                for (n = 1; n < (2 * 4); n += 1) {
                    hash += byteToHex[bytes[n]];
                }
            }
        }
        return hash;
    };

    SparseGrid.prototype.add = function (externalNode, extents) {
        var numNodes = this.numNodes;

        /* tslint:disable:no-string-literal */
        externalNode['spatialIndex'] = numNodes;

        /* tslint:enable:no-string-literal */
        var node = this.nodes[numNodes];
        var nodeExtents, cellExtents;
        if (node) {
            nodeExtents = node.extents;
            cellExtents = node.cellExtents;

            node.externalNode = externalNode;
        } else {
            var buffer = new ArrayBuffer((6 + 4) * 4);
            nodeExtents = new Float32Array(buffer, 0, 6);
            cellExtents = new Int32Array(buffer, (6 * 4), 4);

            node = new SparseGridNode(nodeExtents, cellExtents, numNodes, externalNode);
            this.nodes[numNodes] = node;
        }
        debug.assert(node.id === numNodes);

        var min0 = extents[0];
        var min2 = extents[2];
        var max0 = extents[3];
        var max2 = extents[5];

        nodeExtents[0] = min0;
        nodeExtents[1] = extents[1];
        nodeExtents[2] = min2;
        nodeExtents[3] = max0;
        nodeExtents[4] = extents[4];
        nodeExtents[5] = max2;

        var invCellSize = this.invCellSize;

        var minX = Math.floor(min0 * invCellSize);
        var minZ = Math.floor(min2 * invCellSize);
        var maxX = Math.floor(max0 * invCellSize);
        var maxZ = Math.floor(max2 * invCellSize);

        debug.assert(-2147483648 <= minX && maxX <= 2147483647 && -2147483648 <= minZ && maxZ <= 2147483647, "Node is out of bounds.");

        cellExtents[0] = minX;
        cellExtents[1] = minZ;
        cellExtents[2] = maxX;
        cellExtents[3] = maxZ;

        this.numNodes = (numNodes + 1);
        this.dirtyExtents = true;

        this._addToCells(node, minX, minZ, maxX, maxZ);
    };

    SparseGrid.prototype.update = function (externalNode, extents) {
        /* tslint:disable:no-string-literal */
        var index = externalNode['spatialIndex'];

        if (index !== undefined) {
            this.dirtyExtents = true;

            var node = this.nodes[index];
            var nodeExtents = node.extents;
            var cellExtents = node.cellExtents;

            var min0 = extents[0];
            var min1 = extents[1];
            var min2 = extents[2];
            var max0 = extents[3];
            var max1 = extents[4];
            var max2 = extents[5];

            if (nodeExtents[0] !== min0 || nodeExtents[2] !== min2 || nodeExtents[3] !== max0 || nodeExtents[5] !== max2) {
                nodeExtents[0] = min0;
                nodeExtents[2] = min2;
                nodeExtents[3] = max0;
                nodeExtents[5] = max2;

                var invCellSize = this.invCellSize;
                var newMinX = Math.floor(min0 * invCellSize);
                var newMinZ = Math.floor(min2 * invCellSize);
                var newMaxX = Math.floor(max0 * invCellSize);
                var newMaxZ = Math.floor(max2 * invCellSize);

                var oldMinX = cellExtents[0];
                var oldMinZ = cellExtents[1];
                var oldMaxX = cellExtents[2];
                var oldMaxZ = cellExtents[3];

                if (oldMinX !== newMinX || oldMinZ !== newMinZ || oldMaxX !== newMaxX || oldMaxZ !== newMaxZ) {
                    debug.assert(-2147483648 <= newMinX && newMaxX <= 2147483647 && -2147483648 <= newMinZ && newMaxZ <= 2147483647, "Node is out of bounds.");

                    cellExtents[0] = newMinX;
                    cellExtents[1] = newMinZ;
                    cellExtents[2] = newMaxX;
                    cellExtents[3] = newMaxZ;

                    nodeExtents[1] = min1;
                    nodeExtents[4] = max1;

                    if (newMinX > oldMaxX || newMinZ > oldMaxZ || newMaxX < oldMinX || newMaxZ < oldMinZ) {
                        this._removeFromCells(node, oldMinX, oldMinZ, oldMaxX, oldMaxZ);
                        this._addToCells(node, newMinX, newMinZ, newMaxX, newMaxZ);
                    } else {
                        this._updateCells(node, oldMinX, oldMinZ, oldMaxX, oldMaxZ, newMinX, newMinZ, newMaxX, newMaxZ);
                    }
                } else {
                    if (nodeExtents[1] !== min1 || nodeExtents[4] !== max1) {
                        nodeExtents[1] = min1;
                        nodeExtents[4] = max1;

                        this._flagCells(node, oldMinX, oldMinZ, oldMaxX, oldMaxZ);
                    }
                }
            } else {
                if (nodeExtents[1] !== min1 || nodeExtents[4] !== max1) {
                    nodeExtents[1] = min1;
                    nodeExtents[4] = max1;

                    this._flagCells(node, cellExtents[0], cellExtents[1], cellExtents[2], cellExtents[3]);
                }
            }
        } else {
            this.add(externalNode, extents);
        }
    };

    SparseGrid.prototype.remove = function (externalNode) {
        /* tslint:disable:no-string-literal */
        var index = externalNode['spatialIndex'];
        if (index !== undefined) {
            externalNode['spatialIndex'] = undefined;

            /* tslint:enable:no-string-literal */
            var numNodes = this.numNodes;
            if (1 < numNodes) {
                numNodes -= 1;
                this.numNodes = numNodes;
                this.dirtyExtents = true;

                var nodes = this.nodes;
                var node = nodes[index];
                var cellExtents = node.cellExtents;

                this._removeFromCells(node, cellExtents[0], cellExtents[1], cellExtents[2], cellExtents[3]);

                node.clear();

                if (index < numNodes) {
                    var lastNode = nodes[numNodes];
                    nodes[index] = lastNode;
                    nodes[numNodes] = node;
                    node.id = numNodes;
                    lastNode.id = index;

                    /* tslint:disable:no-string-literal */
                    lastNode.externalNode['spatialIndex'] = index;
                    /* tslint:enable:no-string-literal */
                }
            } else {
                this.clear();
            }
        }
    };

    SparseGrid.prototype._addToCells = function (node, minX, minZ, maxX, maxZ) {
        var cellSize = this.cellSize;
        var numCells = this.numCells;
        var cells = this.cells;
        var cellsMap = this.cellsMap;
        var z = minZ;
        do {
            var x = minX;
            do {
                var hash = this.hash(x, z);
                var cell = cellsMap[hash];
                if (cell) {
                    cell.addNode(node);
                } else {
                    if (numCells < cells.length) {
                        cell = cells[numCells];
                        cell.reset(x * cellSize, z * cellSize, node);
                    } else {
                        debug.assert(numCells === cells.length);
                        cell = new SparseGridCell(x * cellSize, z * cellSize, node);
                        cells.push(cell);
                    }
                    numCells += 1;
                    this.numCells = numCells;
                    cellsMap[hash] = cell;
                }

                x += 1;
            } while(x <= maxX);

            z += 1;
        } while(z <= maxZ);
    };

    SparseGrid.prototype._removeFromCells = function (node, minX, minZ, maxX, maxZ) {
        var numCells = this.numCells;
        var cells = this.cells;
        var cellsMap = this.cellsMap;
        var z = minZ;
        do {
            var x = minX;
            do {
                var hash = this.hash(x, z);
                var cell = cellsMap[hash];
                if (0 === cell.removeNode(node)) {
                    numCells -= 1;
                    this.numCells = numCells;
                    var cellIndex = cells.indexOf(cell);
                    debug.assert(cellIndex !== -1);
                    cells[cellIndex] = cells[numCells];
                    cells[numCells] = cell;
                    if (cells.length > (numCells + 32)) {
                        cells.length = (numCells + 16);
                    }
                    delete cellsMap[hash];
                }

                x += 1;
            } while(x <= maxX);

            z += 1;
        } while(z <= maxZ);
    };

    SparseGrid.prototype._updateCells = function (node, oldMinX, oldMinZ, oldMaxX, oldMaxZ, newMinX, newMinZ, newMaxX, newMaxZ) {
        var extents = node.extents;
        var minX = Math.min(oldMinX, newMinX);
        var minZ = Math.min(oldMinZ, newMinZ);
        var maxX = Math.max(oldMaxX, newMaxX);
        var maxZ = Math.max(oldMaxZ, newMaxZ);

        var cellSize = this.cellSize;
        var numCells = this.numCells;
        var cells = this.cells;
        var cellsMap = this.cellsMap;
        var z = minZ;
        do {
            var newZ = (newMinZ <= z && z <= newMaxZ);
            var oldZ = (oldMinZ <= z && z <= oldMaxZ);

            var x = minX;
            do {
                var newCell = (newZ && newMinX <= x && x <= newMaxX);
                var oldCell = (oldZ && oldMinX <= x && x <= oldMaxX);

                var hash = this.hash(x, z);
                var cell = cellsMap[hash];
                if (cell) {
                    if (debug) {
                        var cellNodes = cell.nodes;
                        var numNodes = cellNodes.length;
                        var n;
                        for (n = 0; n < numNodes; n += 1) {
                            if (cellNodes[n] === node) {
                                break;
                            }
                        }
                        if (oldCell) {
                            // The node should already be on this cell
                            debug.assert(n < numNodes, "Node missing from cell.");
                        } else {
                            // The node should not already be on this cell
                            debug.assert(n >= numNodes, "Node found in wrong cell.");
                        }
                    }

                    if (newCell) {
                        if (oldCell) {
                            if (1 === cell.nodes.length) {
                                cell.minY = extents[1];
                                cell.maxY = extents[4];
                            } else {
                                cell.dirty = true;
                            }
                        } else {
                            cell.addNode(node);
                        }
                    } else {
                        if (oldCell) {
                            if (0 === cell.removeNode(node)) {
                                numCells -= 1;
                                this.numCells = numCells;
                                var cellIndex = cells.indexOf(cell);
                                debug.assert(cellIndex !== -1);
                                cells[cellIndex] = cells[numCells];
                                cells[numCells] = cell;
                                if (cells.length > (numCells + 32)) {
                                    cells.length = (numCells + 16);
                                }
                                delete cellsMap[hash];
                            }
                        }
                    }
                } else {
                    debug.assert(!oldCell, "Node missing from cell.");

                    if (newCell) {
                        if (numCells < cells.length) {
                            cell = cells[numCells];
                            cell.reset(x * cellSize, z * cellSize, node);
                        } else {
                            debug.assert(numCells === cells.length);
                            cell = new SparseGridCell(x * cellSize, z * cellSize, node);
                            cells.push(cell);
                        }
                        numCells += 1;
                        this.numCells = numCells;
                        cellsMap[hash] = cell;
                    }
                }

                x += 1;
            } while(x <= maxX);

            z += 1;
        } while(z <= maxZ);
    };

    SparseGrid.prototype._flagCells = function (node, minX, minZ, maxX, maxZ) {
        var extents = node.extents;
        var cellsMap = this.cellsMap;
        var z = minZ;
        do {
            var x = minX;
            do {
                var cell = cellsMap[this.hash(x, z)];
                if (1 === cell.nodes.length) {
                    cell.minY = extents[1];
                    cell.maxY = extents[4];
                } else {
                    cell.dirty = true;
                }
                x += 1;
            } while(x <= maxX);

            z += 1;
        } while(z <= maxZ);
    };

    /* tslint:disable:no-empty */
    SparseGrid.prototype.finalize = function () {
    };

    /* tslint:enable:no-empty */
    SparseGrid.prototype.getOverlappingNodes = function (queryExtents, overlappingNodes, startIndex) {
        var numOverlappingNodes = 0;
        if (0 < this.numNodes) {
            var queryMinX = queryExtents[0];
            var queryMinY = queryExtents[1];
            var queryMinZ = queryExtents[2];
            var queryMaxX = queryExtents[3];
            var queryMaxY = queryExtents[4];
            var queryMaxZ = queryExtents[5];

            var invCellSize = this.invCellSize;
            var cellsMap = this.cellsMap;

            var minX = Math.floor(queryMinX * invCellSize);
            var minZ = Math.floor(queryMinZ * invCellSize);
            var maxX = Math.floor(queryMaxX * invCellSize);
            var maxZ = Math.floor(queryMaxZ * invCellSize);

            var queryIndex = (this.queryIndex + 1);
            this.queryIndex = queryIndex;

            var storageIndex = (startIndex === undefined ? overlappingNodes.length : startIndex);
            var cell, cellNodes, numCellNodes, n, node, nodeExtents;
            var z = minZ;
            do {
                var x = minX;
                do {
                    var hash = this.hash(x, z);
                    cell = cellsMap[hash];
                    if (cell) {
                        if (cell.dirty) {
                            cell.update();
                        }

                        if (queryMinY <= cell.maxY && queryMaxY >= cell.minY) {
                            cellNodes = cell.nodes;
                            numCellNodes = cellNodes.length;
                            n = 0;
                            do {
                                node = cellNodes[n];
                                if (node.queryIndex !== queryIndex) {
                                    node.queryIndex = queryIndex;

                                    nodeExtents = node.extents;

                                    if (queryMaxY < nodeExtents[1]) {
                                        // cell nodes are sorted by min Y
                                        n += 1;
                                        while (n < numCellNodes) {
                                            node.queryIndex = queryIndex;
                                            n += 1;
                                        }
                                        break;
                                    }

                                    if (queryMinX <= nodeExtents[3] && queryMinY <= nodeExtents[4] && queryMinZ <= nodeExtents[5] && queryMaxX >= nodeExtents[0] && queryMaxZ >= nodeExtents[2]) {
                                        overlappingNodes[storageIndex] = node.externalNode;
                                        storageIndex += 1;
                                        numOverlappingNodes += 1;
                                    }
                                }
                                n += 1;
                            } while(n < numCellNodes);
                        }
                    }

                    x += 1;
                } while(x <= maxX);

                z += 1;
            } while(z <= maxZ);
        }
        return numOverlappingNodes;
    };

    SparseGrid.prototype.getSphereOverlappingNodes = function (center, radius, overlappingNodes) {
        if (0 < this.numNodes) {
            var centerX = center[0];
            var centerY = center[1];
            var centerZ = center[2];
            var radiusSquared = (radius * radius);

            var queryMinY = (centerY - radius);
            var queryMaxY = (centerY + radius);

            var invCellSize = this.invCellSize;
            var cellsMap = this.cellsMap;

            var minX = Math.floor((centerX - radius) * invCellSize);
            var minZ = Math.floor((centerZ - radius) * invCellSize);
            var maxX = Math.floor((centerX + radius) * invCellSize);
            var maxZ = Math.floor((centerZ + radius) * invCellSize);

            var queryIndex = (this.queryIndex + 1);
            this.queryIndex = queryIndex;

            var storageIndex = overlappingNodes.length;
            var cell, cellNodes, numCellNodes, n, node;
            var z = minZ;
            do {
                var x = minX;
                do {
                    var hash = this.hash(x, z);
                    cell = cellsMap[hash];
                    if (cell) {
                        if (cell.dirty) {
                            cell.update();
                        }

                        if (queryMinY <= cell.maxY && queryMaxY >= cell.minY) {
                            cellNodes = cell.nodes;
                            numCellNodes = cellNodes.length;
                            n = 0;
                            do {
                                node = cellNodes[n];
                                if (node.queryIndex !== queryIndex) {
                                    node.queryIndex = queryIndex;

                                    var nodeExtents = node.extents;

                                    var minNodeY = nodeExtents[1];
                                    if (queryMaxY < minNodeY) {
                                        // cell nodes are sorted by min Y
                                        n += 1;
                                        while (n < numCellNodes) {
                                            node.queryIndex = queryIndex;
                                            n += 1;
                                        }
                                        break;
                                    }

                                    var minNodeX = nodeExtents[0];
                                    var minNodeZ = nodeExtents[2];
                                    var maxNodeX = nodeExtents[3];
                                    var maxNodeY = nodeExtents[4];
                                    var maxNodeZ = nodeExtents[5];

                                    var totalDistance = 0, sideDistance;
                                    if (centerX < minNodeX) {
                                        sideDistance = (minNodeX - centerX);
                                        totalDistance += (sideDistance * sideDistance);
                                    } else if (centerX > maxNodeX) {
                                        sideDistance = (centerX - maxNodeX);
                                        totalDistance += (sideDistance * sideDistance);
                                    }
                                    if (centerY < minNodeY) {
                                        sideDistance = (minNodeY - centerY);
                                        totalDistance += (sideDistance * sideDistance);
                                    } else if (centerY > maxNodeY) {
                                        sideDistance = (centerY - maxNodeY);
                                        totalDistance += (sideDistance * sideDistance);
                                    }
                                    if (centerZ < minNodeZ) {
                                        sideDistance = (minNodeZ - centerZ);
                                        totalDistance += (sideDistance * sideDistance);
                                    } else if (centerZ > maxNodeZ) {
                                        sideDistance = (centerZ - maxNodeZ);
                                        totalDistance += (sideDistance * sideDistance);
                                    }
                                    if (totalDistance <= radiusSquared) {
                                        overlappingNodes[storageIndex] = node.externalNode;
                                        storageIndex += 1;
                                    }
                                }
                                n += 1;
                            } while(n < numCellNodes);
                        }
                    }

                    x += 1;
                } while(x <= maxX);

                z += 1;
            } while(z <= maxZ);
        }
    };

    SparseGrid.prototype.getOverlappingPairs = function (overlappingPairs, startIndex) {
        var numInsertions = 0;
        if (0 < this.numNodes) {
            var storageIndex = (startIndex === undefined) ? overlappingPairs.length : startIndex;
            var numCells = this.numCells;
            var cells = this.cells;
            var pairsMap = {};
            var c, i, maxI, j, numNodes, cell, cellNodes, nodeI, idI, nodeJ, idJ, extents, pairId;
            for (c = 0; c < numCells; c += 1) {
                cell = cells[c];
                if (cell.dirty) {
                    cell.update();
                }

                cellNodes = cell.nodes;
                numNodes = cellNodes.length;
                maxI = (numNodes - 1);
                for (i = 0; i < maxI; i += 1) {
                    nodeI = cellNodes[i];
                    idI = nodeI.id;
                    extents = nodeI.extents;
                    var minX = extents[0];

                    //var minY = extents[1];
                    var minZ = extents[2];
                    var maxX = extents[3];
                    var maxY = extents[4];
                    var maxZ = extents[5];

                    for (j = (i + 1); j < numNodes; j += 1) {
                        nodeJ = cellNodes[j];

                        extents = nodeJ.extents;
                        if (maxY < extents[1]) {
                            break;
                        }

                        if (minX <= extents[3] && minZ <= extents[5] && maxX >= extents[0] && maxZ >= extents[2]) {
                            idJ = nodeJ.id;

                            if (idI < idJ) {
                                pairId = ((idJ << 16) | idI);
                            } else {
                                pairId = ((idI << 16) | idJ);
                            }

                            if (!pairsMap[pairId]) {
                                pairsMap[pairId] = true;
                                overlappingPairs[storageIndex] = nodeI.externalNode;
                                overlappingPairs[storageIndex + 1] = nodeJ.externalNode;
                                storageIndex += 2;
                                numInsertions += 2;
                            }
                        }
                    }
                }
            }
        }
        return numInsertions;
    };

    SparseGrid.prototype.getVisibleNodes = function (planes, visibleNodes, startIndex) {
        var numVisibleNodes = 0;
        if (0 < this.numNodes) {
            var numPlanes = planes.length;
            var storageIndex = (startIndex === undefined) ? visibleNodes.length : startIndex;
            var cellSize = this.cellSize;
            var numCells = this.numCells;
            var cells = this.cells;

            var queryIndex = (this.queryIndex + 1);
            this.queryIndex = queryIndex;

            var queryCellPlanes = this.queryCellPlanes;
            var numQueryCellPlanes = 0;

            var c, isInside, n, plane, d0, d1, d2;
            for (c = 0; c < numCells; c += 1) {
                var cell = cells[c];
                if (cell.dirty) {
                    cell.update();
                }

                var minCellX = cell.minX;
                var minCellY = cell.minY;
                var minCellZ = cell.minZ;
                var maxCellX = (minCellX + cellSize);
                var maxCellY = cell.maxY;
                var maxCellZ = (minCellZ + cellSize);

                // check if cell is visible
                isInside = true;
                for (n = 0; n < numPlanes; n += 1) {
                    plane = planes[n];
                    d0 = plane[0];
                    d1 = plane[1];
                    d2 = plane[2];
                    if ((d0 * (d0 < 0 ? minCellX : maxCellX) + d1 * (d1 < 0 ? minCellY : maxCellY) + d2 * (d2 < 0 ? minCellZ : maxCellZ)) < plane[3]) {
                        isInside = false;
                        break;
                    }
                }

                if (isInside) {
                    var cellNodes = cell.nodes;
                    var numNodes = cellNodes.length;

                    // Remove those planes on which the cell is fully inside
                    numQueryCellPlanes = 0;
                    for (n = 0; n < numPlanes; n += 1) {
                        plane = planes[n];
                        d0 = plane[0];
                        d1 = plane[1];
                        d2 = plane[2];
                        if ((d0 * (d0 > 0 ? minCellX : maxCellX) + d1 * (d1 > 0 ? minCellY : maxCellY) + d2 * (d2 > 0 ? minCellZ : maxCellZ)) < plane[3]) {
                            queryCellPlanes[numQueryCellPlanes] = plane;
                            numQueryCellPlanes += 1;
                        }
                    }

                    var node, k;
                    if (numQueryCellPlanes === 0) {
                        for (k = 0; k < numNodes; k += 1) {
                            node = cellNodes[k];
                            if (node.queryIndex !== queryIndex) {
                                node.queryIndex = queryIndex;
                                visibleNodes[storageIndex] = node.externalNode;
                                storageIndex += 1;
                                numVisibleNodes += 1;
                            }
                        }
                    } else {
                        for (k = 0; k < numNodes; k += 1) {
                            // check if node is visible
                            node = cellNodes[k];
                            if (node.queryIndex !== queryIndex) {
                                node.queryIndex = queryIndex;

                                var extents = node.extents;
                                var n0 = extents[0];
                                var n1 = extents[1];
                                var n2 = extents[2];
                                var p0 = extents[3];
                                var p1 = extents[4];
                                var p2 = extents[5];

                                isInside = true;
                                n = 0;
                                do {
                                    plane = queryCellPlanes[n];
                                    d0 = plane[0];
                                    d1 = plane[1];
                                    d2 = plane[2];
                                    if ((d0 * (d0 < 0 ? n0 : p0) + d1 * (d1 < 0 ? n1 : p1) + d2 * (d2 < 0 ? n2 : p2)) < plane[3]) {
                                        isInside = false;
                                        break;
                                    }
                                    n += 1;
                                } while(n < numQueryCellPlanes);

                                if (isInside) {
                                    visibleNodes[storageIndex] = node.externalNode;
                                    storageIndex += 1;
                                    numVisibleNodes += 1;
                                }
                            }
                        }
                    }
                }
            }
        }
        return numVisibleNodes;
    };

    SparseGrid.prototype._recalculateExtents = function () {
        var numCells = this.numCells;
        var cells = this.cells;

        var minX = Number.MAX_VALUE;
        var minY = minX;
        var minZ = minX;
        var maxX = -minX;
        var maxY = -minX;
        var maxZ = -minX;

        var c;
        for (c = 0; c < numCells; c += 1) {
            var cell = cells[c];
            if (cell.dirty) {
                cell.update();
            }

            var cellMinX = cell.minX;
            var cellMinY = cell.minY;
            var cellMinZ = cell.minZ;
            var cellMaxY = cell.maxY;
            if (minX > cellMinX) {
                minX = cellMinX;
            }
            if (maxX < cellMinX) {
                maxX = cellMinX;
            }
            if (minY > cellMinY) {
                minY = cellMinY;
            }
            if (maxY < cellMaxY) {
                maxY = cellMaxY;
            }
            if (minZ > cellMinZ) {
                minZ = cellMinZ;
            }
            if (maxZ < cellMinZ) {
                maxZ = cellMinZ;
            }
        }

        var cellSize = this.cellSize;
        var extents = this.extents;
        extents[0] = minX;
        extents[1] = minY;
        extents[2] = minZ;
        extents[3] = (maxX + cellSize);
        extents[4] = maxY;
        extents[5] = (maxZ + cellSize);
    };

    SparseGrid.prototype.getExtents = function () {
        if (this.dirtyExtents) {
            this.dirtyExtents = false;
            this._recalculateExtents();
        }
        return this.extents;
    };

    SparseGrid.prototype.getCells = function () {
        return this.cells;
    };

    SparseGrid.prototype.getCellSize = function () {
        return this.cellSize;
    };

    SparseGrid.prototype.clear = function () {
        this.numCells = 0;
        this.cells.length = 0;
        this.cellsMap = {};
        this.nodes.length = 0;
        this.numNodes = 0;
        this.queryIndex = -1;
    };

    SparseGrid.create = function (cellSize) {
        return new SparseGrid(cellSize);
    };
    SparseGrid.version = 1;
    return SparseGrid;
})();
;

((function () {
    var buffer = new ArrayBuffer(2 * 4);
    var byteToHex = [];
    byteToHex.length = 256;
    var n;
    for (n = 0; n < 256; n += 1) {
        byteToHex[n] = ('0' + n.toString(16)).slice(-2);
    }
    SparseGrid.prototype.tempIntArray = new Int32Array(buffer);
    SparseGrid.prototype.tempByteArray = new Uint8Array(buffer);
    SparseGrid.prototype.byteToHex = byteToHex;
})());
