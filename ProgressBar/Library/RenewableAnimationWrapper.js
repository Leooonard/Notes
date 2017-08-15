// @flow

import type {
    EasingType
} from '../';

class RenewableAnimationWrapper {
    /**
     * 记录动画开始的时间。
     */
    _animationSegmentStartTime: number;
    /**
     * 这里记录动画暂停时，已经执行的时间。
     */
    _animationSegmentPauseTime: number;
    /**
     * 缓动函数可以看做一个作用域在[0, 1]，值域也在[0, 1]的函数，这里记录暂停时缓动函数的X坐标。
     */
    _currentAnimationPauseEasingX: number;

    _lastAnimationPauseEasingX: number;
    _lastAnimationPauseEasingY: number;

    _easing: EasingType;
    _totalDuration: number;

    constructor (easing: EasingType, totalDuration: number) {
        this._easing = easing;
        this._totalDuration = totalDuration;
        this._lastAnimationPauseEasingX = 0;
        this._lastAnimationPauseEasingY = 0;
    }

    _wrapEasing (easing: EasingType): EasingType {
        return (t: number) => {
            this._currentAnimationPauseEasingX = t;
            return easing(t);
        };
    }

    _convertEasingX (t: number): number {
        return (1 - this._lastAnimationPauseEasingX) * t;
    }

    _convertEasingY (t: number): number {
        const result = this._easing(t);
        return (result - this._lastAnimationPauseEasingY) / (1 - this._lastAnimationPauseEasingY);
    }

    getEasing (): EasingType {
        return this._wrapEasing(this._easing);
    }

    start () {
        this._animationSegmentStartTime = Date.now();
    }

    pause () {
        this._animationSegmentPauseTime = Date.now();
        this._lastAnimationPauseEasingX += this._convertEasingX(this._currentAnimationPauseEasingX);
        this._lastAnimationPauseEasingY = this._easing(this._lastAnimationPauseEasingX);
    }

    resume (): {
        duration: number,
        easing: EasingType
    } {
        return {
            duration: this._totalDuration - (this._animationSegmentPauseTime - this._animationSegmentStartTime),
            easing: this._wrapEasing((t: number) => {
                return this._convertEasingY(this._convertEasingX(t) + this._lastAnimationPauseEasingX);
            })
        };
    }
}

export {
    RenewableAnimationWrapper
}
