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

    constructor (display: bool, duration: number = 200) {
        this._display = display;
        this._duration = duration;
        this._setAnimationValue();
    }

    _setAnimationValue () {
        if (this._display) {
            this._animatedValue = new Animated.Value(1);
        } else {
            this._animatedValue = new Animated.Value(0);
        }
    }

    getAnimationValue () {
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

export type CellType = DataCell | ExpandCell | EmptyCell | AnimatedDataCell | AnimatedExpandCell;
export type AnimatedCellType = AnimatedDataCell | AnimatedExpandCell;

export {
    DataCell,
    ExpandCell,
    EmptyCell,
    AnimatedDataCell,
    AnimatedExpandCell
};
