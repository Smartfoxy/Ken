"use strict"

class Cell {
    constructor(row, col) {
        this.row = row;
        this.col = col;
        this.fill = false;
        this.union = false;
        this.border = '';
    }
    fillNum(num) {
        this.num = num;
        this.fill = true;
    }
    unionCells(unionIndex) {
        this.unionIndex = unionIndex;
        this.union = true;
    }
    addBorder(type) {
        this.border += type + ' ';
    }
    addOperatorAttr(oper_res) {
        this.oper_resAttr = oper_res;
    }
    addTheOneAttr() {
        this.oneAttr = true;
    }
}

class Union {
    constructor(index) {
        this.index = index;
        this.cellsInUnion = [];
        this.oper = '';
        this.result = '';
    }
    addCellToUnion(cell) {
        this.cellsInUnion.push(cell);
    }
    setSortRowsNumbers(rows) {
        this.sortRowsNums = rows;
    }
    setOperator(oper) {
        this.oper = oper;
    }
    setResult(result) {
        this.result = result;
    }
    setOperatorAndResult() {
        this.oper_result = this.result + this.oper;
    }
}

class Moove {
    constructor(index, row, col, num, prev) {
        this.index = index;
        this.row = row;
        this.col = col;
        this.num = num;
        this.numPrev = prev;
    }
}

const $kenOptionsForm = document.forms.kenOptions;

let kenArr = [];
let indexOfUnion = 0;
let arrOfUnions = [];
let mooves = [];
let moovesInStack = -1;
let currentMooveIndex = -1;
let num = 4;
let tab = 1;
process(num);

function process(num) {
    kenArr = createKen(num);
    fillKen(kenArr);
    unionCells(kenArr);

    arrOfUnions.forEach(union => {
        drawBordersOfUnion(union);
        setOperatorAndResult(union);
        setAttrToCell(union);
    })

    drawTableForResolve(kenArr);

    $kenOptionsForm.redo.disabled = true;
    $kenOptionsForm.undo.disabled = true;
}

$kenOptionsForm.size.addEventListener('change', function (ev) {
    ev.preventDefault();
    num = $kenOptionsForm.size.value;
    mooves = [];
    moovesInStack = -1;
    currentMooveIndex = -1;

    process(num);
})

$kenOptionsForm.new.addEventListener('click', function (ev) {
    ev.preventDefault();
    num = $kenOptionsForm.size.value;
    mooves = [];
    moovesInStack = -1;
    currentMooveIndex = -1;
    process(num);
})

$kenOptionsForm.reload.addEventListener('click', function (ev) {
    ev.preventDefault();
    mooves = [];
    moovesInStack = -1;
    currentMooveIndex = -1;
    $kenOptionsForm.redo.disabled = true;
    $kenOptionsForm.undo.disabled = true;
    drawTableForResolve(kenArr);
})

$kenOptionsForm.resolve.addEventListener('click', function (ev) {
    ev.preventDefault();
    drawResolvedTable(kenArr);
    $kenOptionsForm.redo.disabled = true;
    $kenOptionsForm.undo.disabled = true;
})

$kenOptionsForm.undo.addEventListener('click', function (ev) {
    ev.preventDefault();
    const $table = document.querySelector('table');
    undoMoove($table);
})

$kenOptionsForm.redo.addEventListener('click', function (ev) {
    ev.preventDefault();
    const $table = document.querySelector('table');
    redoMoove($table);
})

function createKen(num) {
    let kenArr = [];
    for (let i = 0; i < num; i++) {
        let rowArr = [];
        for (let j = 0; j < num; j++) {
            rowArr.push(new Cell(i, j));
        }
        kenArr.push(rowArr);
    }
    return kenArr;
}

function fillKen(kenArr) {
    const length = kenArr.length;
    for (let i = 1; i <= length; i++) {
        for (let j = 0; j < length; j++) {
            let emptyCellInRow = kenArr[j].filter(function (cell) {
                return !cell.fill;
            })
            let restCellForFill = emptyCellInRow.filter(function (el) {
                let result = true;
                for (let z = 0; z < j; z++) {
                    if (kenArr[z][el.col].num === i) result = false;
                }
                return result;
            })

            if (!restCellForFill.length) {
                for (let z = 0; z < j; z++) {
                    kenArr[z].forEach(el => {
                        if (el.num === i) {
                            el.num = null;
                            el.fill = false;
                        }
                    });
                }

                j = -1;
                continue;
            }

            let col = Math.round(Math.random() * (restCellForFill.length - 1));
            let currentCell = restCellForFill[col];
            currentCell.fillNum(i);
        }
    }
}

function unionCells(arrOfCells) {
    let countUnionWithFour = 0;
    const maxCountUnionWithFour = (num - 4);
    for (let i = 0; i < arrOfCells.length; i++) {
        for (let j = 0; j < arrOfCells[i].length; j++) {
            let x = i;
            let y = j;
            if (arrOfCells[x][y].union) {
                continue;
            }
            let countCell = 2;

            if (num === 4) {
                countCell = Math.round(Math.random() * (3 - 2) + 2);
            } else {
                if (countUnionWithFour < maxCountUnionWithFour) {
                    countCell = Math.round(Math.random() * (4 - 2) + 2);
                    if (countCell === 4) countUnionWithFour++;
                } else {
                    countCell = Math.round(Math.random() * (3 - 2) + 2);
                }
            }

            let currentUnion = new Union(indexOfUnion);
            for (let z = 0; z < countCell; z++) {

                if (z !== 0) {
                    let x1;
                    let y1;
                    let freeDirections = [1, 2, 3, 4];
                    let dir;
                    do {
                        //let [x1, y1, dir] = getNextCellcoordinates(x, y, freeDirections); что не так?
                        let arr = getNextCellcoordinates(x, y, freeDirections);
                        x1 = arr[0];
                        y1 = arr[1];
                        dir = arr[2];

                        freeDirections = freeDirections.filter(el => {
                            return (el !== dir);
                        });
                    } while (!isCellExistAndFree(arrOfCells, x1, y1));

                    x = x1;
                    y = y1;
                }
                arrOfCells[x][y].unionCells(indexOfUnion);
                currentUnion.addCellToUnion(arrOfCells[x][y]);

                if (!isFreeNeighborCellExist(arrOfCells, x, y)) {
                    break;
                }

            }
            arrOfUnions.push(currentUnion);
            indexOfUnion++;
        }
    }

}

function isCellExist(arrOfCells, x, y) {
    return (x >= 0 && x < arrOfCells.length) && (y >= 0 && y < arrOfCells.length);
}
function isCellFree(arrOfCells, x, y) {
    return !arrOfCells[x][y].union;
}
function isCellExistAndFree(arrOfCells, x, y) {
    return isCellExist(arrOfCells, x, y) && isCellFree(arrOfCells, x, y);
}
function isFreeNeighborCellExist(arrOfCells, x, y) {
    return isCellExistAndFree(arrOfCells, x + 1, y) || isCellExistAndFree(arrOfCells, x - 1, y) || isCellExistAndFree(arrOfCells, x, y + 1) || isCellExistAndFree(arrOfCells, x, y - 1);
}
function getAllExistNeighbors(arrOfCells, x, y) {
    let neighbors = [];
    if (isCellExist(arrOfCells, x + 1, y)) {
        neighbors.push(arrOfCells[x + 1][y]);
    }
    if (isCellExist(arrOfCells, x - 1, y)) {
        neighbors.push(arrOfCells[x - 1][y]);
    }
    if (isCellExist(arrOfCells, x, y + 1)) {
        neighbors.push(arrOfCells[x][y + 1]);
    }
    if (isCellExist(arrOfCells, x, y - 1)) {
        neighbors.push(arrOfCells[x][y - 1]);
    }
    return neighbors;
}

function getNextCellcoordinates(x, y, freeDirections) {
    let arrCoordinates = [];
    const index = Math.round(Math.random() * (freeDirections.length - 1));
    const direction = freeDirections[index];
    switch (direction) {
        case 1:
            y++;
            break;
        case 2:
            x++;
            break;
        case 3:
            y--;
            break;
        case 4:
            x--;
            break;
        default:
            alert('упс!');
    }
    arrCoordinates[0] = x;
    arrCoordinates[1] = y;
    arrCoordinates[2] = direction;
    return arrCoordinates;
}

function drawBordersOfUnion(union) {
    const cells = union.cellsInUnion;

    let arrOfRowsNum = [];

    for (let i = 0; i < cells.length; i++) {
        if (arrOfRowsNum.indexOf(cells[i].row) === -1) {
            arrOfRowsNum.push(cells[i].row);
        }
    }

    union.setSortRowsNumbers(arrOfRowsNum.sort());

    arrOfRowsNum.forEach(rowNum => {
        let currentRowCells = cells.filter(el => {
            return el.row === rowNum;
        }).sort(compareCellsByCol);

        currentRowCells[currentRowCells.length - 1].addBorder('right');
    })

    let arrOfColsNum = [];
    for (let i = 0; i < cells.length; i++) {
        if (arrOfColsNum.indexOf(cells[i].col) === -1) {
            arrOfColsNum.push(cells[i].col);
        }
    }

    arrOfColsNum.forEach(colNum => {
        let currentColCells = cells.filter(el => {
            return el.col === colNum;
        }).sort(compareCellsByRow);
        currentColCells[currentColCells.length - 1].addBorder('bottom');
    })

}

function setOperatorAndResult(union) {
    let operator = '';
    let result = 0;
    if (union.cellsInUnion.length === 1) {
        result = union.cellsInUnion[0].num;
    } else if (union.cellsInUnion.length === 2) {
        if (divide(union.cellsInUnion[0].num, union.cellsInUnion[1].num) % 1 === 0) {
            if (union.cellsInUnion[0].num !== 1 && union.cellsInUnion[1].num !== 1) {
                operator = String.fromCharCode(247);
                result = divide(union.cellsInUnion[0].num, union.cellsInUnion[1].num);
            } else {
                operator = selectOperator(4);
                result = getResultOfOperationInObject(union, operator);
            }
        } else {
            operator = selectOperator(3);
            result = getResultOfOperationInObject(union, operator);
        }
    } else {
        operator = selectOperator(2);
        result = getResultOfOperationInObject(union, operator);
    }
    union.setOperator(operator);
    union.setResult(result);
    union.setOperatorAndResult();
}

function selectOperator(num) {
    const operatorIndex = Math.round(Math.random() * (num - 1) + 1);
    let operator = '';
    switch (operatorIndex) {
        case 1:
            operator = '+';
            break;
        case 2:
            operator = String.fromCharCode(215);
            break;
        case 3:
            operator = '-';
            break;
        case 4:
            operator = String.fromCharCode(247);
            break;
        default:
            alert('упс!')
    }
    return operator;
}
function getResultOfOperationInObject(union, operator) {
    let result = 0;

    switch (operator) {
        case '+':
            result = union.cellsInUnion.reduce(function (acc, current) {
                return acc + current.num;
            }, 0);
            break;
        case String.fromCharCode(215):
            result = union.cellsInUnion.reduce(function (acc, current) {
                return acc * current.num;
            }, 1);
            break;
        case '-':
            result = Math.abs(union.cellsInUnion[0].num - union.cellsInUnion[1].num);
            break;
        case String.fromCharCode(247):
            result = divide(union.cellsInUnion[0].num, union.cellsInUnion[1].num);
            break;
        default:
            alert('упс!')
    }
    return result;
}

function getResultOfOperationInNode(union, operator) {
    let result = 0;

    switch (operator) {
        case '+':
            result = union.reduce(function (acc, current) {
                return acc + +current.textContent;
            }, 0);
            break;
        case String.fromCharCode(215):
            result = union.reduce(function (acc, current) {
                return acc * current.textContent;
            }, 1);
            break;
        case '-':
            result = Math.abs(union[0].textContent - union[1].textContent);
            break;
        case String.fromCharCode(247):
            result = divide(union[0].textContent, union[1].textContent);
            break;
        default:
            alert('упс!');
    }
    return result;
}

function divide(num1, num2) {
    const result = num1 > num2 ? num1 / num2 : num2 / num1;
    return result;
}

function setAttrToCell(union) {
    if (union.cellsInUnion.length === 1) {
        union.cellsInUnion[0].addTheOneAttr();
        union.cellsInUnion[0].addOperatorAttr(union.oper_result);
    } else {
        let cellsInTopRowSort = union.cellsInUnion.filter(cell => {
            return cell.row === union.sortRowsNums[0];
        }).sort(compareCellsByCol);
        cellsInTopRowSort[0].addOperatorAttr(union.oper_result);
    }
}

function compareCellsByRow(cell1, cell2) {
    return cell1.row - cell2.row;
}

function compareCellsByCol(cell1, cell2) {
    return cell1.col - cell2.col;
}

function drawResolvedTable(arrObj) {
    const $table = document.querySelector('table');
    drawTable(arrObj, $table, true);
}

function drawTable(arrObj, $table, isresolved) {
    let inner = '';
    for (let i = 0; i < arrObj.length; i++) {
        let row = '<tr>';
        for (let j = 0; j < arrObj[i].length; j++) {
            let tdInner = '';
            const border = arrObj[i][j].border ? arrObj[i][j].border : '';
            const attr_oper_res = arrObj[i][j].oper_resAttr ? `data-oper_res = ${arrObj[i][j].oper_resAttr}` : '';
            const attr_union = `data-union = ${arrObj[i][j].unionIndex}`;
            if (isresolved || arrObj[i][j].oneAttr) {
                tdInner = arrObj[i][j].num;
            }
            row += `<td class = 'cell ${border}' ${attr_oper_res} ${attr_union} currentValue = '${tdInner}' tabindex = '1'>${tdInner}</td>`;
        }
        row += '</tr>';
        inner += row;
    }
    $table.innerHTML = inner;
}

function celebrateUserResolvedCorrect() {
    document.querySelector('.tableContainer').classList.add('winner');
}

function hasEmptyCell(cells) {
    let hasEmpty = false;
    if (Array.from(cells).find(cell => {
        return !cell.textContent;
    })) hasEmpty = true;
    return hasEmpty;
}

function drawTableForResolve(arrObj) {
    const $table = document.querySelector('table');
    drawTable(arrObj, $table, false);

    const $cells = $table.querySelectorAll('.cell');

    $cells.forEach(cell => {
        cell.addEventListener('click', () => {
            cell.focus();
        })
        cell.addEventListener('keydown', event => {
            let keyCode = event.keyCode;

            if (event.key >= 1 && event.key <= num) {
                cell.textContent = event.key;
            }
            if (keyCode === 46 || keyCode === 8) {
                cell.textContent = null;
            }
            if (keyCode >= 37 && keyCode <= 40) {
                arrowNavigation($table, cell, keyCode);
            }

            markRedIfRepeatInRowOrCol($table, cell);

            markRedIfWrongResultOfOperation($table, cell, arrOfUnions);

            const prevValue = cell.getAttribute('currentValue');

            cell.setAttribute('currentValue', cell.textContent);

            $kenOptionsForm.redo.disabled = true;

            if (event.key >= 1 && event.key <= num || keyCode === 46 || keyCode === 8) {
                if (currentMooveIndex !== moovesInStack) {
                    mooves = mooves.slice(0, currentMooveIndex + 1);
                    moovesInStack = currentMooveIndex;
                }
                saveMoove(cell, prevValue);
            }
        })

        cell.addEventListener('keyup', () => {
            const emptyCell = hasEmptyCell($cells);
            if (!emptyCell) {
                const isAnyMistake = Array.from($cells).find(node => {
                    return node.classList.contains('red') || node.classList.contains('wrongResult');
                })
                if (!isAnyMistake) {
                    celebrateUserResolvedCorrect();
                }
            }
        })
    })

}

function markRedIfRepeatInRowOrCol(table, cell) {
    const cells = table.querySelectorAll('td');
    const row = cell.parentElement.rowIndex;
    const col = cell.cellIndex;
    const cellsInCurrentRowArray = Array.from(table.rows[row].cells);
    const cellsInCurrentColArray = Array.from(cells).filter(el => {
        return el.cellIndex === col;
    });

    cellsInCurrentRowArray.forEach(current => {
        markCellIfRepeat(table, current);
    });

    cellsInCurrentColArray.forEach(current => {
        markCellIfRepeat(table, current);
    });
}

function getCellsInUnion(table, index) {
    const cells = table.querySelectorAll('td');
    const cellsInUnion = Array.from(cells).filter(cell => {
        return cell.dataset.union === index;
    })
    return cellsInUnion;
}

function getUnionbyIndex(index, unionsArr) {
    return unionsArr.find(un => {
        return un.index === +index;
    })
}

function getUserResultInUnion(table, cell, unionsArr) {
    const unionIndex = cell.dataset.union;
    const currentUnion = getUnionbyIndex(unionIndex, unionsArr);
    const cellsInUnion = getCellsInUnion(table, unionIndex);
    let result = 0;

    if (cellsInUnion.length === 1) {
        result = +cell.textContent;
    } else {
        result = getResultOfOperationInNode(cellsInUnion, currentUnion.oper);
    }

    return result;
}

function markRedIfWrongResultOfOperation(table, cell, unionsArr) {
    const currentUnionIndex = cell.dataset.union;

    const currentUnion = getUnionbyIndex(currentUnionIndex, unionsArr);
    const cellsInCurrentUnion = getCellsInUnion(table, currentUnionIndex);

    const emptyCell = hasEmptyCell(cellsInCurrentUnion);
    const resultUser = getUserResultInUnion(table, cell, unionsArr);

    if (!emptyCell && resultUser !== currentUnion.result) {

        cellsInCurrentUnion.forEach(cell => {
            cell.classList.add('wrongResult');
        })
    } else {
        cellsInCurrentUnion.forEach(cell => {
            if (cell.classList.contains('wrongResult')) {
                cell.classList.remove('wrongResult');
            }
        })
    }
}

function arrowNavigation($table, cell, keyCode) {
    let row = cell.parentElement.rowIndex;
    let col = cell.cellIndex;
    const num = $table.rows.length;
    switch (keyCode) {
        case 37:
            if (col === 0) {
                col = col + num;
            }
            setFocus($table, row, col - 1);
            break;
        case 38:
            if (row === 0) {
                row = row + num;
            }
            setFocus($table, row - 1, col);
            break;
        case 39:
            if (col === num - 1) {
                col = col - num;
            }
            setFocus($table, row, col + 1);
            break;
        case 40:
            if (row === num - 1) {
                row = row - num;
            }
            setFocus($table, row + 1, col);
            break;
    }
}

function setFocus(table, row, col) {
    const cells = table.querySelectorAll('td');
    Array.from(cells).find(td => {
        return (td.parentElement.rowIndex === row) && (td.cellIndex === col);
    }).focus();
}

function isNumberRepeatInLine(line, cell) {
    const isRepeat = line.filter(el => {
        return el !== cell;
    }).find(rest => {
        return cell.textContent && rest.textContent === cell.textContent;
    })
    return isRepeat;
}

function isNumberRepeatInRowOrCol(table, cell) {
    const cells = table.querySelectorAll('td');
    const cellsInCurrentRow = Array.from(table.rows[cell.parentElement.rowIndex].cells);
    const cellsInCurrentCol = Array.from(cells).filter(el => {
        return el.cellIndex === cell.cellIndex;
    });
    return isNumberRepeatInLine(cellsInCurrentRow, cell) || isNumberRepeatInLine(cellsInCurrentCol, cell);
}

function markCellIfRepeat(table, cell) {
    if (isNumberRepeatInRowOrCol(table, cell)) {
        cell.classList.add('red');
    } else {
        if (cell.classList.contains('red')) {
            cell.classList.remove('red');
        }
    }
}

function saveMoove(cell, prev) {
    const row = cell.parentElement.rowIndex;
    const col = cell.cellIndex;
    const num = cell.textContent;
    currentMooveIndex++;
    moovesInStack++;
    const moove = new Moove(moovesInStack, row, col, num, prev);
    mooves.push(moove);
    if (moovesInStack === 0) {
        $kenOptionsForm.undo.disabled = false;
    }
}

function redoMoove(table) {
    const moove = mooves.find(moove => {
        return moove.index === currentMooveIndex + 1;
    })
    const targetCell = table.rows[moove.row].cells[moove.col];
    targetCell.textContent = moove.num;
    targetCell.setAttribute('currentValue', targetCell.textContent);
    currentMooveIndex++;
    if (currentMooveIndex === moovesInStack) {
        $kenOptionsForm.redo.disabled = true;
    }
    targetCell.focus();
    if ($kenOptionsForm.undo.disabled) {
        $kenOptionsForm.undo.disabled = false;
    }
    markRedIfRepeatInRowOrCol(table, targetCell);
    markRedIfWrongResultOfOperation(table, targetCell, arrOfUnions);
}

function undoMoove(table) {

    const moove = mooves.find(moove => {
        return moove.index === currentMooveIndex;
    })
    const targetCell = table.rows[moove.row].cells[moove.col];
    targetCell.textContent = moove.numPrev;

    targetCell.setAttribute('currentValue', targetCell.textContent);

    targetCell.focus();

    if (currentMooveIndex === 0) {
        $kenOptionsForm.undo.disabled = true;
    }
    if ($kenOptionsForm.redo.disabled) {
        $kenOptionsForm.redo.disabled = false;
    }

    currentMooveIndex--;
    markRedIfRepeatInRowOrCol(table, targetCell);
    markRedIfWrongResultOfOperation(table, targetCell, arrOfUnions);
}
