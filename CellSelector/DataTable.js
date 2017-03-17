/* @flow */

/*
    Dim -> Dimension -> 维度
    Coord -> Coordinate -> 坐标
*/

class DataTable {
    _dataSource: Array<any>;
    _tableWidth: number;
    _twoDimDataSource: Array<Array<any>>;

    constructor (dataSource: Array<any>, tableWidth: number) {
        if (tableWidth <= 0) {
            throw new Error('table width must bigger than 0');
        }

        this._dataSource = dataSource;
        this._tableWidth = tableWidth;
        this._twoDimDataSource = this._twoDimTransform(dataSource, tableWidth);
    }

    getData (row: number, column: number): any {
        return this._twoDimDataSource[row][column];
    }

    getTable (): Array<Array<any>> {
        return this._twoDimDataSource;
    }

    getTableWidth (): number {
        return this._tableWidth;
    }

    transformTwoDimCoordToOneDimCoord (rowCoord: number, columnCoord: number): number {
        if (rowCoord < 0 || columnCoord < 0) {
            throw new Error('coordinate should bigger than 0');
        }

        return rowCoord * this._tableWidth + columnCoord;
    }

    transformOneDimCoordToTwoDimCoord (index: number): {
        rowCoord: number,
        columnCoord: number
    } {
        if (index < 0) {
            throw new Error('index should bigger than 0');
        }

        return {
            rowCoord: Math.floor(index / this._tableWidth),
            columnCoord: index % this._tableWidth
        };
    }

    _twoDimTransform (array: Array<any>, oneDimLength: number): Array<Array<any>> {
        let twoDimArray = [];
        let startIndex = 0;

        while (startIndex < array.length) {
            twoDimArray.push(array.slice(startIndex, startIndex + oneDimLength));
            startIndex += oneDimLength;
        }

        return twoDimArray;
    }
}

export type DataTableType = DataTable;
export {
    DataTable
};
