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

        this._renderTable = this.generateRenderTable(this._isExpanding);
    }

    // 根据dataTable完整生成renderTable。
    generateRenderTable (isExpanding: bool) {
        let rowList: Array<Array<CellType>> = [];
        let dataTable: Array<Array<any>> = this._dataTable.getTable();

        dataTable.forEach((dataRow, rowIndex) => {
            if (this._shouldGenerateRow(isExpanding, rowIndex)) {
                let renderRow = this._generateRenderRow(rowIndex, false, true, isExpanding);
                rowList.push(renderRow);
            }
        });

        if (this._needAppendRowForExpandCell(isExpanding)) {
            rowList.push(this._generateRowForExpandCell());
        }

        return rowList;
    }

    _shouldGenerateRow (isExpanding: bool, rowIndex: number): bool {
        let needPackup = this._needPackup;
        let maxRowForBrief = this._maxRowForBrief;

        if (needPackup && !isExpanding && rowIndex >= maxRowForBrief) {
            return false;
        }

        return true;
    }

    _generateRenderRow (rowIndex: number, isAnimated: ?bool, isShow: ?bool, isExpanding: ?bool): Array<CellType> {
        isAnimated = isAnimated || false;
        isShow = isShow || false;
        isExpanding = isExpanding || false;

        let isLastRow = (rowIndex, twoDimArray) => rowIndex === twoDimArray.length - 1;
        let isListLongEnough = (array, targetLength) => array.length === targetLength;
        let dataTable = this._dataTable.getTable();
        let needPackup = this._needPackup;
        let dataRow = dataTable[rowIndex];
        let tableWidth = this._dataTable.getTableWidth();

        let getDataCell = (rowIndex: number, columnIndex: number): CellType => {
            if (isAnimated) {
                return new AnimatedDataCell(isShow, new DataCell(rowIndex, columnIndex));
            } else {
                return new DataCell(rowIndex, columnIndex);
            }
        }
        let getExpandCell = (isExpanding: bool): CellType => {
            if (isAnimated) {
                return new AnimatedExpandCell(isShow, new ExpandCell(isExpanding));
            } else {
                return new ExpandCell(isExpanding);
            }
        }

        if (needPackup && isExpanding) {
            if (isLastRow(rowIndex, dataTable)) {
                if (isListLongEnough(dataRow, tableWidth)) {
                    return dataRow.map((dataItem, columnIndex) => getDataCell(rowIndex, columnIndex));
                } else {
                    let row = dataRow.map((dataItem, columnIndex) => getDataCell(rowIndex, columnIndex));
                    row.push(getExpandCell(isExpanding));
                    row = this._paddingRowWithEmptyCell(row, tableWidth);
                    return row;
                }
            } else {
                return dataRow.map((dataItem, columnIndex) => getDataCell(rowIndex, columnIndex));
            }
        } else if (needPackup && !isExpanding) {
            if (rowIndex === this._maxRowForBrief - 1) {
                let row = dataRow.map((dataItem, columnIndex) => getDataCell(rowIndex, columnIndex));
                row.pop();
                row.push(getExpandCell(isExpanding));
                return row;
            } else {
                return dataRow.map((dataItem, columnIndex) => getDataCell(rowIndex, columnIndex));
            }
        } else {
            let row = dataRow.map((dataItem, columnIndex) => getDataCell(rowIndex, columnIndex));
            if (isLastRow(rowIndex, dataTable) && !isListLongEnough(dataRow, tableWidth)) {
                row = this._paddingRowWithEmptyCell(row, tableWidth);
            }
            return row;
        }
    }

    _needAppendRowForExpandCell (isExpanding: bool): bool {
        let isListLongEnough = (array, targetLength) => array.length === targetLength;
        let dataTable = this._dataTable.getTable();
        let lastDataRow = dataTable[dataTable.length - 1];
        let tableWidth = this._dataTable.getTableWidth();
        let needPackup = this._needPackup;

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
        let getExpandCell = (isExpanding: bool): CellType => {
            if (isAnimated) {
                return new AnimatedExpandCell(isShow, new ExpandCell(isExpanding));
            } else {
                return new ExpandCell(isExpanding);
            }
        }

        let row = [getExpandCell(this._isExpanding)];
        let tableWidth = this._dataTable.getTableWidth();

        return this._paddingRowWithEmptyCell(row, tableWidth);
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

    updateTable () {
        this._renderTable = this.generateRenderTable(this._isExpanding);
    }

    getTable (): Array<Array<CellType>> {
        return this._renderTable;
    }

    refresh (next: () => void) {
        this._renderTable = this.generateRenderTable(this._isExpanding);
        this._updateView().then(next);
    }

    replaceCell (rowIndex: number, columnIndex: number, next: () => void) {
        let currentCell = this._renderTable[rowIndex][columnIndex];
        let renderRow = this._generateRenderRow(rowIndex, true, false, this._isExpanding);
        let replaceCell = renderRow[columnIndex];

        this._renderTable[rowIndex][columnIndex] = new AnimatedReplaceCell(currentCell, replaceCell);
        this._updateView().then(next);
    }

    replaceCellFinish (rowIndex: number, columnIndex: number, next: () => void) {
        let currentCell = this._renderTable[rowIndex][columnIndex];
        let replaceCell = currentCell.getReplaceCell();

        if (AnimatedDataCell.isAnimatedDataCell(replaceCell)) {
            replaceCell = new DataCell(rowIndex, columnIndex);
        } else {
            replaceCell = new ExpandCell(this._isExpanding);
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
            if (this._needAppendRowForExpandCell(this._isExpanding)) {
                renderRow = this._generateRowForExpandCell(true, false);
            } else {
                throw new Error('there is no render row to append');
            }
        } else {
            renderRow = this._generateRenderRow(renderTableLength, true, false, isExpanding);
        }

        renderTable.push(renderRow);
        this._updateView().then(next);
    }

    preRemoveRow (rowIndex: number, next: () => void) {
        let renderRow = this._renderTable[rowIndex];

        renderRow.forEach((renderCell, columnIndex) => {
            if (DataCell.isDataCell(renderCell)) {
                this._renderTable[rowIndex][columnIndex] = new AnimatedDataCell(true, renderCell);
            } else if (AnimatedDataCell.isAnimatedDataCell(renderCell)) {
                this._renderTable[rowIndex][columnIndex] = new AnimatedDataCell(true, renderCell.getDataCell());
            } else if (ExpandCell.isExpandCell(renderCell)) {
                this._renderTable[rowIndex][columnIndex] = new AnimatedExpandCell(true, renderCell);
            } else if (AnimatedExpandCell.isAnimatedExpandCell(renderCell)) {
                this._renderTable[rowIndex][columnIndex] = new AnimatedExpandCell(true, renderCell.getExpandCell());
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
