// @flow

import React, {
    Component
} from 'react';

import {
    Animated,
    View,
    Dimensions,
    Easing
} from 'react-native';

import type {
    AnimatedValueType
} from '../../../../Type/AnimatedType';

import type {
    AnimationSegment,
    EasingType
} from '../../index';

import {
    JointBlock,
    ShapeMap
} from './JointBlock';

import type {
    ShapeType as innerShapeType
} from './JointBlock';

export type ShapeType = innerShapeType;

const windowWidth = Dimensions.get('window').width;

type Props = {
    onUpdateAnimationValue: (value: number) => void,
    backgroundColor: string,
    shape: ShapeType,
    animationSegmentList: Array<AnimationSegment>
};

class AnimatedProgressBackgroundBar extends Component {
    props: Props;
    _translateXAnimation: AnimatedValueType;
    _lastAnimationValue: number;
    _currentAnimationSegment: number;

    constructor (props: Props) {
        super(props);

        this._translateXAnimation = new Animated.Value(0);
        this._lastAnimationValue = 0;
        this._currentAnimationSegment = 0;
        this._translateXAnimation.addListener(this._updateTranslateXAnimationValue.bind(this));
    }

    _hasNextAnimationSegment (): bool {
        return this._currentAnimationSegment < this.props.animationSegmentList.length;
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

    _startAnimationSegment (animationOption: Object) {
        Animated
        .timing(this._translateXAnimation, animationOption)
        .start((value: {
            finished: bool
        }) => {
            /**
             * 只有动画完成后，才需要调用onReachAnimationSegmentEnd，此时finished为true，
             * 当调用Animated api来暂停动画时，finished为false。
             */
            if (value.finished) {
                this._onReachAnimationSegmentEnd();
            }
        });
    }

    _onReachAnimationSegmentEnd () {
        const {
            onReachEnd
        } = this.props.animationSegmentList[this._currentAnimationSegment];
        const startNextAnimationSegment: bool = onReachEnd(this._currentAnimationSegment);

        this._currentAnimationSegment++;
        if (startNextAnimationSegment) {
            this._startCurrentAnimationSegment();
        }
    }

    startNextAnimationSegment (customEasing?: EasingType) {
        if (!this._hasNextAnimationSegment()) {
            return;
        }

        const {
            toValue,
            duration,
            easing
        } = this.props.animationSegmentList[this._currentAnimationSegment];

        this._startAnimationSegment({
            toValue,
            duration,
            easing: customEasing || easing
        });
    }

    _startCurrentAnimationSegment () {
        if (!this._hasNextAnimationSegment()) {
            return;
        }

        const animationSegment = this.props.animationSegmentList[this._currentAnimationSegment];
        this._startAnimationSegment({
            toValue: animationSegment.toValue,
            duration: animationSegment.duration,
            easing: animationSegment.easing
        });
    }

    pauseAnimationSegment () {
        const animationSegment = this.props.animationSegmentList[this._currentAnimationSegment];

        this._translateXAnimation.stopAnimation();
    }

    resumeAnimationSegment (customEasing?: EasingType) {
        const animationSegment = this.props.animationSegmentList[this._currentAnimationSegment];

        this._startAnimationSegment({
            toValue: animationSegment.toValue,
        });
    }

    componentDidMount () {
        this._startCurrentAnimationSegment();
    }

    render () {
        const {
            backgroundColor,
            shape
        } = this.props;

        return (
            <Animated.View style = {{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: this._translateXAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, windowWidth]
                }),
                right: 0,
                flexDirection: 'row'
            }}>
                <JointBlock shape = {shape} width = {30} height = {60} backgroundColor = {backgroundColor}/>
                <View style = {{
                    flex: 1,
                    backgroundColor
                }}></View>
            </Animated.View>
        );
    }
}

export {
    AnimatedProgressBackgroundBar,
    ShapeMap
};
