/* @flow */

import type {
    CellType
} from './Cell';

import {
    DataCell,
    ExpandCell,
    EmptyCell,
    AnimatedDataCell,
    AnimatedExpandCell,
    AnimatedReplaceCell
} from './Cell';

import type {
    DataTableType
} from './DataTable';

class RenderTable {
    _renderTable: Array<Array<CellType>>;
    _needPackup: bool;
    _isExpanding: bool;
    _dataTable: DataTableType;
    _maxRowForBrief: number;
    _updateView: () => Promise<any>;

    constructor (dataTable: DataTableType, needPackup: bool, isExpanding: bool,
                maxRowForBrief: number, updateView: () => Promise<any>) {
        if (maxRowForBrief <= 0) {
            throw new Error('maxRowForBrief should bigger than 0');
        }

        this._dataTable = dataTable;
        this._needPackup = needPackup;
        this._isExpanding = isExpanding;
        this._maxRowForBrief = maxRowForBrief;
        this._updateView = updateView;

        this._generateRenderTable();
    }

    getMaxRowForBrief () {
        return this._maxRowForBrief;
    }

    setIsExpanding (isExpanding: bool) {
        this._isExpanding = isExpanding;
    }

    setNeedPackup (needPackup: bool) {
        this._needPackup = needPackup;
    }

    getExpandCellTwoDimCoord (): {
        rowIndex: number,
        columnIndex: number
    } {
        for (let i = 0 ; i < this._renderTable.length ; i++) {
            let renderRow = this._renderTable[i];
            for (let j = 0 ; j < renderRow.length ; j++) {
                let renderCell = renderRow[j];

                if (ExpandCell.isExpandCell(renderCell) || AnimatedExpandCell.isAnimatedExpandCell(renderCell)) {
                    return {
                        rowIndex: i,
                        columnIndex: j
                    };
                }
            }
        }

        throw new Error('there is no expand cell in renderTable');
    }

    getTable (): Array<Array<CellType>> {
        return this._renderTable;
    }

    _generateRenderRow (rowIndex: number, _isAnimated: ?bool, _isShow: ?bool): Array<CellType> {
        // 不这么写，flow会认为isAnimated类型为？bool，之后的代码如果用到的是bool，就会报错。
        let isAnimated = _isAnimated || false;
        let isShow = _isShow || false;

        let isLastRow = (rowIndex, twoDimArray) => rowIndex === twoDimArray.length - 1;
        let isListLongEnough = (array, targetLength) => array.length === targetLength;
        let dataTable = this._dataTable.getTable();
        let needPackup = this._needPackup;
        let isExpanding = this._isExpanding;
        let dataRow = dataTable[rowIndex];
        let tableWidth = this._dataTable.getTableWidth();

        let getDataCell = (): CellType => {
            if (isAnimated) {
                return new AnimatedDataCell(isShow);
            } else {
                return new DataCell();
            }
        }
        let getExpandCell = (): CellType => {
            if (isAnimated) {
                return new AnimatedExpandCell(isShow);
            } else {
                return new ExpandCell();
            }
        }

        if (needPackup && isExpanding) {
            if (isLastRow(rowIndex, dataTable)) {
                if (isListLongEnough(dataRow, tableWidth)) {
                    return dataRow.map(dataItem => getDataCell());
                } else {
                    let row = dataRow.map(dataItem => getDataCell());
                    row.push(getExpandCell());
                    row = this._paddingRowWithEmptyCell(row, tableWidth);
                    return row;
                }
            } else {
                return dataRow.map(dataItem => getDataCell());
            }
        } else if (needPackup && !isExpanding) {
            if (rowIndex === this._maxRowForBrief - 1) {
                let row = dataRow.map(dataItem => getDataCell());
                row.pop();
                row.push(getExpandCell());
                return row;
            } else {
                return dataRow.map(dataItem => getDataCell());
            }
        } else {
            let row = dataRow.map(dataItem => getDataCell());
            if (isLastRow(rowIndex, dataTable) && !isListLongEnough(dataRow, tableWidth)) {
                row = this._paddingRowWithEmptyCell(row, tableWidth);
            }
            return row;
        }
    }

    _needAppendRowForExpandCell (): bool {
        let isListLongEnough = (array, targetLength) => array.length === targetLength;
        let dataTable = this._dataTable.getTable();
        let lastDataRow = dataTable[dataTable.length - 1];
        let tableWidth = this._dataTable.getTableWidth();
        let needPackup = this._needPackup;
        let isExpanding = this._isExpanding;

        if (needPackup && isExpanding) {
            if (isListLongEnough(lastDataRow, tableWidth)) {
                return true;
            }
        }

        return false;
    }

    _generateRowForExpandCell (_isAnimated: ?bool, _isShow: ?bool): Array<CellType> {
        let isAnimated = _isAnimated || false;
        let isShow = _isShow || false;
        let getExpandCell = (): CellType => {
            if (isAnimated) {
                return new AnimatedExpandCell(isShow);
            } else {
                return new ExpandCell();
            }
        }

        let row = [getExpandCell()];
        let tableWidth = this._dataTable.getTableWidth();

        return this._paddingRowWithEmptyCell(row, tableWidth);
    }

    _shouldGenerateRow (rowIndex: number): bool {
        let needPackup = this._needPackup;
        let isExpanding = this._isExpanding;
        let maxRowForBrief = this._maxRowForBrief;

        if (needPackup && !isExpanding && rowIndex >= maxRowForBrief) {
            return false;
        }

        return true;
    }

    // 根据dataTable完整生成renderTable。
    _generateRenderTable () {
        let rowList: Array<Array<CellType>> = [];
        let dataTable: Array<Array<any>> = this._dataTable.getTable();

        dataTable.forEach((dataRow, rowIndex) => {
            if (this._shouldGenerateRow(rowIndex)) {
                let renderRow = this._generateRenderRow(rowIndex);
                rowList.push(renderRow);
            }
        });

        if (this._needAppendRowForExpandCell()) {
            rowList.push(this._generateRowForExpandCell());
        }

        this._renderTable = rowList;
    }

    replaceCell (rowIndex: number, columnIndex: number, next: () => void) {
        let currentCell = this._renderTable[rowIndex][columnIndex];
        let renderRow = this._generateRenderRow(rowIndex, true, false);
        let replaceCell = renderRow[columnIndex];

        this._renderTable[rowIndex][columnIndex] = new AnimatedReplaceCell(currentCell, replaceCell);
        this._updateView().then(next);
    }

    replaceCellFinish (rowIndex: number, columnIndex: number, next: () => void) {
        let currentCell = this._renderTable[rowIndex][columnIndex];
        let replaceCell = currentCell.getReplaceCell();

        if (AnimatedDataCell.isAnimatedDataCell(replaceCell)) {
            replaceCell = new DataCell();
        } else {
            replaceCell = new ExpandCell();
        }

        this._renderTable[rowIndex][columnIndex] = replaceCell;
        this._updateView().then(next);
    }

    appendRowWithAnimatedCell (next: () => void) {
        let dataTable = this._dataTable.getTable();
        let tableWidth = this._dataTable.getTableWidth();
        let dataTableLength = dataTable.length;
        let renderTable = this._renderTable;
        let renderTableLength = renderTable.length;
        let needPackup = this._needPackup;
        let isExpanding = this._isExpanding;

        let equalTableLength = dataTableLength === renderTableLength;
        let renderRow;

        if (equalTableLength) {
            if (this._needAppendRowForExpandCell()) {
                renderRow = this._generateRowForExpandCell(true, false);
            } else {
                throw new Error('there is no render row to append');
            }
        } else {
            renderRow = this._generateRenderRow(renderTableLength, true, false);
        }

        renderTable.push(renderRow);
        this._updateView().then(next);
    }

    preRemoveRow (next: () => void) {
        let lastRowIndex = this._renderTable.length - 1;
        let lastRenderRow = this._renderTable[lastRowIndex];

        lastRenderRow.forEach((renderCell, columnIndex) => {
            if (DataCell.isDataCell(renderCell) || AnimatedDataCell.isAnimatedDataCell(renderCell)) {
                this._renderTable[lastRowIndex][columnIndex] = new AnimatedDataCell(true);
            } else if (ExpandCell.isExpandCell(renderCell) || AnimatedExpandCell.isAnimatedExpandCell(renderCell)) {
                this._renderTable[lastRowIndex][columnIndex] = new AnimatedExpandCell(true);
            }
        });

        this._updateView().then(next);
    }

    removeRow (next: () => void) {
        this._renderTable = this._renderTable.slice(0, -1);
        this._updateView().then(next);
    }

    animateCell (rowIndex: number, columnIndex: number, next: () => void) {
        let renderCell = this._renderTable[rowIndex][columnIndex];

        if (AnimatedDataCell.isAnimatedDataCell(renderCell) ||
            AnimatedExpandCell.isAnimatedExpandCell(renderCell) ||
            AnimatedReplaceCell.isAnimatedReplaceCell(renderCell)) {
            renderCell.animate(next);
        } else {
            throw new Error('only animated data cell could animate');
        }
    }

    _paddingRowWithEmptyCell (row: Array<CellType>, targetLength: number): Array<CellType> {
        while (row.length < targetLength) {
            row.push(new EmptyCell());
        }

        return row;
    }
}

export type RenderTableType = RenderTable;
export {
    RenderTable
};
