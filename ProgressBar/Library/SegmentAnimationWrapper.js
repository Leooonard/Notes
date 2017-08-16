// @flow

import type {
    AnimatedType
} from '../Type/AnimatedType';

export type SegmentAnimation = {
    /**
     * 当段动画的toValue
     */
    toValue: number,
    /**
     * 当段动画的执行时长
     */
    duration: number,
    /**
     * 当段动画的缓动函数
     */
    easing: EasingType,
    /**
     * 当段动画执行结束后，会调用callback，callback的返回值决定是否继续执行下段动画，
     * 如果返回true，则继续执行下段动画
     */
    onReachEnd: (index: number) => bool
};

class SegmentAnimationWrapper {
    _currentAnimationSegment: number;
    _animatedValue: AnimatedType;
    _segmentAnimationList: Array<SegmentAnimation>;

    constructor (animatedValue: AnimatedType, segmentAnimationList: Array<SegmentAnimation>) {
        this._currentAnimationSegmentIndex = 0;
        this._animatedValue = animatedValue;
        this._segmentAnimationList = segmentAnimationList;
    }

    hasNextSegmentAnimation (): bool {
        return this._currentAnimationSegmentIndex < this._segmentAnimationList.length;
    }

    getCurrentSegmentAnimation (): SegmentAnimation {
        return this._segmentAnimationList[this._currentAnimationSegmentIndex];
    }

    _startSegmentAnimation (animationOption: Object) {
        Animated
        .timing(this._animatedValue, animationOption)
        .start((e: {
            finished: bool
        }) => {
            /**
             * 只有动画完成后，才需要调用onReachAnimationSegmentEnd，此时finished为true，
             * 当调用Animated api来暂停动画时，finished为false。
             */
            if (e.finished) {
                this._onReachSegmentAnimationEnd();
            }
        });
    }

    _onReachSegmentAnimationEnd () {
        const {
            onReachEnd
        } = this.getCurrentSegmentAnimation();

        const startNextSegmentAnimation: bool = onReachEnd(this._currentSegmentAnimationIndex);

        this._currentSegmentAnimationIndex++;
        if (startNextSegmentAnimation) {
            this.start();
        }
    }

    stop () {
        this._animatedValue.stopAnimation();
    }

    start (segmentAnimation?: SegmentAnimation) {
        if (!this.hasNextSegmentAnimation()) {
            return;
        }

        let animationOption;
        if (segmentAnimation) {
            animationOption = {
                ...this.getCurrentSegmentAnimation(),
                ...segmentAnimation
            };
        } else {
            animationOption = this.getCurrentSegmentAnimation();
        }

        this._startSegmentAnimation(animationOption);
    }
}

export {
    SegmentAnimationWrapper
};
