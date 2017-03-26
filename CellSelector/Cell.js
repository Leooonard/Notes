/* @flow */

import {
    Animated
} from 'react-native';

class DataCell {
    _rowIndex: number;
    _columnIndex: number;

    constructor (rowIndex: number, columnIndex: number) {
        this._rowIndex = rowIndex;
        this._columnIndex = columnIndex;
    }

    getRowIndex (): number {
        return this._rowIndex;
    }

    getColumnIndex (): number {
        return this._columnIndex;
    }

    getType () {
        return 'DATA_CELL';
    }

    static isDataCell (cell): bool {
        return cell instanceof DataCell;
    }
}

class AnimatedCell {
    _display: bool;
    _duration: number;
    _animatedValue: any;

    constructor (display: bool) {
        this._display = display;
        this._duration = 250;
        this._setAnimatedValue();
    }

    getType () {
        return 'ANIMATED_CELL';
    }

    _setAnimatedValue () {
        if (this._display) {
            this._animatedValue = new Animated.Value(1);
        } else {
            this._animatedValue = new Animated.Value(0);
        }
    }

    getAnimatedValue () {
        return this._animatedValue;
    }

    animate (onFinish: () => void) {
        let targetValue = this._display ? 0 : 1;

        Animated.timing(this._animatedValue, {
            toValue: targetValue,
            duration: this._duration,
        }).start(onFinish);
    }

    static isAnimatedCell (cell): bool {
        return cell instanceof AnimatedDataCell;
    }
}

class AnimatedDataCell extends AnimatedCell {
    _dataCell: DataCell;

    constructor (display: bool, dataCell: CellType) {
        super(display);

        this._dataCell = dataCell;
    }

    getDataCell (): DataCell {
        return this._dataCell;
    }

    getType () {
        return 'ANIMATED_DATA_CELL';
    }

    static isAnimatedDataCell (cell): bool {
        return cell instanceof AnimatedDataCell;
    }
}

class AnimatedExpandCell extends AnimatedCell {
    _expandCell: ExpandCell;

    constructor (display: bool, expandCell: CellType) {
        super(display);

        this._expandCell = expandCell;
    }

    getExpandCell (): ExpandCell {
        return this._expandCell;
    }

    getType () {
        return 'ANIMATED_EXPAND_CELL';
    }

    static isAnimatedExpandCell (cell): bool {
        return cell instanceof AnimatedExpandCell;
    }
}

class AnimatedReplaceCell extends AnimatedCell {
    _currentAnimatedValue: any;
    _replaceAnimatedValue: any;
    _currentCell: CellType;
    _replaceCell: CellType;

    constructor (currentCell: CellType, replaceCell: CellType, duration: number = 250) {
        super(false, duration);

        this._currentCell = currentCell;
        this._replaceCell = replaceCell;
    }

    getType () {
        return 'ANIMATED_REPLACE_CELL';
    }

    _setAnimatedValue () {
        this._currentAnimatedValue = new Animated.Value(1);
        this._replaceAnimatedValue = new Animated.Value(0);
    }

    getCurrentAnimatedValue () {
        return this._currentAnimatedValue;
    }

    getReplaceAnimatedValue () {
        return this._replaceAnimatedValue;
    }

    getCurrentCell (): CellType {
        return this._currentCell;
    }

    getReplaceCell (): CellType {
        return this._replaceCell;
    }

    animate (onFinish: () => void) {
        Animated.parallel([
            Animated.timing(this._currentAnimatedValue, {
                toValue: 0,
                duration: this._duration
            }),
            Animated.timing(this._replaceAnimatedValue, {
                toValue: 1,
                duration: this._duration
            })
        ]).start(onFinish);
    }

    static isAnimatedReplaceCell (cell): bool {
        return cell instanceof AnimatedReplaceCell;
    }
}

class ExpandCell {
    _isExpanding: bool;

    constructor (isExpanding: bool) {
        this._isExpanding = isExpanding;
    }

    getIsExpanding (): bool {
        return this._isExpanding;
    }

    getType () {
        return 'EXPAND_CELL';
    }

    static isExpandCell (cell): bool {
        return cell instanceof ExpandCell;
    }
}

class EmptyCell {
    constructor () {}

    getType () {
        return 'EMPTY_CELL';
    }

    static isEmptyCell (cell): bool {
        return cell instanceof EmptyCell;
    }
}

export type CellType = DataCell | ExpandCell | EmptyCell | AnimatedDataCell | AnimatedExpandCell | AnimatedReplaceCell;
export type AnimatedCellType = AnimatedDataCell | AnimatedExpandCell;

export {
    DataCell,
    ExpandCell,
    EmptyCell,
    AnimatedDataCell,
    AnimatedExpandCell,
    AnimatedReplaceCell
};
