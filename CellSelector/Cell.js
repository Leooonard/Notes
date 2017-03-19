/* @flow */

import {
    Animated
} from 'react-native';

class DataCell {
    constructor () {}

    static isDataCell (cell): bool {
        return cell instanceof DataCell;
    }
}

class AnimatedCell {
    _display: bool;
    _duration: number;
    _animatedValue: any;

    constructor (display: bool, duration: number = 100) {
        this._display = display;
        this._duration = duration;
        this._setAnimatedValue();
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
    static isAnimatedDataCell (cell): bool {
        return cell instanceof AnimatedDataCell;
    }
}

class AnimatedExpandCell extends AnimatedCell {
    static isAnimatedExpandCell (cell): bool {
        return cell instanceof AnimatedExpandCell;
    }
}

class AnimatedReplaceCell extends AnimatedCell {
    _currentAnimatedValue: any;
    _replaceAnimatedValue: any;
    _currentCell: CellType;
    _replaceCell: CellType;

    constructor (currentCell: CellType, replaceCell: CellType, duration: number = 100) {
        super(false, duration);

        this._currentCell = currentCell;
        this._replaceCell = replaceCell;
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
    constructor () {}

    static isExpandCell (cell): bool {
        return cell instanceof ExpandCell;
    }
}

class EmptyCell {
    constructor () {}

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
