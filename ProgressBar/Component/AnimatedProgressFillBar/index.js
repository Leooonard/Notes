// @flow

import React, {
    Component
} from 'react';

import {
    Animated,
    View,
    StyleSheet,
    Easing
} from 'react-native';

import {
    AutoAnimatedProgressFillBar
} from './AutoAnimatedProgressFillBar';

import type {
    AnimatedValueType
} from '../../Type/AnimatedType';

import {
    RenewableAnimationWrapper
} from '../../Library/RenewableAnimationWrapper';

import {
    SegmentAnimationWrapper
} from '../../Library/SegmentAnimationWrapper';

import type {
    SegmentAnimation
} from '../../Library/SegmentAnimationWrapper';

import {
    JointBlock,
    ShapeMap
} from '../JointBlock';

import type {
    ShapeType
} from '../JointBlock';

function animatePromisely (animatedValue: AnimatedValueType, option: Object): Promise<void> {
    return new Promise(resolve => {
        Animated.timing(animatedValue, option).start(resolve);
    });
}

type Props = {
    onUpdateAnimationValue: (value: number) => void,
    containerHeight: number,
    containerWidth: number,
    backgroundColor: string,
    segmentAnimationList: Array<SegmentAnimation>
};
type State = {
    shape: ShapeType
};

class AnimatedProgressFillBar extends Component {
    props: Props;
    state: State;
    _translateXAnimation: AnimatedValueType;
    _animatedProgressFillBar: ?AnimatedProgressFillBar;
    _lastAnimationValue: number;
    _segmentAnimationWrapper: SegmentAnimationWrapper;
    _renewableAnimationWrapper: RenewableAnimationWrapper;

    constructor (props: Props) {
        super(props);

        this.state = {
            shape: ShapeMap.square
        };

        this._lastAnimationValue = 0;
        this._translateXAnimation = new Animated.Value(0);
        this._translateXAnimation.addListener(this._updateTranslateXAnimationValue.bind(this));

        const segmentAnimationList = this.props.segmentAnimationList.map(segmentAnimation => {
            return {
                ...segmentAnimation,
                onReachEnd: this._wrapOnReachEnd(segmentAnimation.onReachEnd)
            };
        });
        this._segmentAnimationWrapper = new SegmentAnimationWrapper(this._translateXAnimation, segmentAnimationList);
        const {
            easing,
            duration
        } = this._segmentAnimationWrapper.getCurrentSegmentAnimation();
        this._renewableAnimationWrapper = new RenewableAnimationWrapper(easing, duration);
    }

    _wrapOnReachEnd (onReachEnd) {
        return (i: number) => {
            const result = onReachEnd(i);
            this._onReachSegmentAnimationEnd(isStartNextSegmentAnimation);
            return result;
        };
    }

    _onReachSegmentAnimationEnd (isStartNextSegmentAnimation: bool) {
        if (!this._segmentAnimationWrapper.hasNextSegmentAnimation()) {
            return;
        }

        const {
            easing,
            duration
        } = this._segmentAnimationWrapper.getCurrentSegmentAnimation();
        this._renewableAnimationWrapper = new RenewableAnimationWrapper(easing, duration);
        if (isStartNextSegmentAnimation) {
            this._renewableAnimationWrapper.start();
        }
    }

    _updateTranslateXAnimationValue (e: {
        value: number
    }) {
        const animationValue = e.value * 100;
        const {
            onUpdateAnimationValue
        } = this.props;

        if (this._lastAnimationValue !== Math.ceil(animationValue)) {
            this._lastAnimationValue = Math.ceil(animationValue);
            onUpdateAnimationValue(this._lastAnimationValue);
        }
    }

    getAnimatedValue () {
        return this._translateXAnimation.value;
    }

    _setStatePromisely (state: Object): Promise<any> {
        return new Promise(resolve => {
            this.setState(state, resolve);
        });
    }

    componentDidMount () {
        this._segmentAnimationList.start({
            easing: this._renewableAnimationWrapper.getEasing()
        });
        this._renewableAnimationWrapper.start();
    }

    transform (): Promise<any> {
        if (this._animatedProgressFillBar) {
            return this._animatedProgressFillBar
            .transformBackgroundColor()
            .then(() => this._setStatePromisely({
                shape: ShapeMap.emptyTriangle
            }));
        } else {
            return Promise.resolve();
        }
    }

    start () {
        this._segmentAnimationWrapper.start();
        this._renewableAnimationWrapper.start();
    }

    pause () {
        this._segmentAnimationWrapper.stop();
        this._renewableAnimationWrapper.pause();
    }

    resume (segmentAnimation?: segmentAnimation = {}) {
        const animationOption = this._renewableAnimationWrapper.resume();
        this._segmentAnimationList.start({
            ...animationOption,
            ...segmentAnimation
        });
    }

    render () {
        const {
            containerWidth,
            containerHeight,
            backgroundColor
        } = this.props;

        const {
            shape
        } = this.state;

        return (
            <Animated.View style = {{
                flexDirection: 'row',
                height: containerHeight,
                flex: 0,
                transform: [
                    {
                        translateX: this._translateXAnimation.interpolate({
                            inputRange: [0, 1],
                            outputRange: [-1 * containerWidth, 0]
                        })
                    }
                ]
            }}>
                <View style = {{
                    width: containerWidth
                }}>
                    <AutoAnimatedProgressFillBar containerHeight = {containerHeight}/>
                </View>
                <JointBlock
                    shape = {shape}
                    width = {containerHeight / 2}
                    height = {containerHeight}
                    backgroundColor = {backgroundColor}
                />
            </Animated.View>
        );
    }
}

export {
    AnimatedProgressFillBar
};
