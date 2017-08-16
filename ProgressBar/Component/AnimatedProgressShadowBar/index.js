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
} from '../../Type/AnimatedType';

import {
    JointBlock,
    ShapeMap
} from '../JointBlock';

import * as Style from '../../Style/';

type Props = {
    onFinish: () => void,
    onHalf: () => void,
    width: number,
    height: number,
    backgroundColor: string,
    shadowColor: string,
    duration: number
};

class AnimatedProgressShadowBar extends Component {
    props: Props;
    _translateXAnimatedValue: AnimatedValueType;
    _hasTriggerOnHalf: bool;

    constructor (props: Props) {
        super(props);
        this._translateXAnimatedValue = new Animated.Value(0);
        this._hasTriggerOnHalf = false;
        this._translateXAnimatedValue.addListener(this._updateAnimatedValue.bind(this));
    }

    _updateAnimatedValue (e) {
        if (!this._hasTriggerOnHalf && e.value > 0.5) {
            this._hasTriggerOnHalf = true;
            this.props.onHalf();
        }
    }

    componentDidMount () {
        const {
            onFinish,
            duration
        } = this.props;

        Animated
        .timing(this._translateXAnimatedValue, {
            toValue: 1,
            duration: duration,
            easing: Easing.linear
        })
        .start(onFinish);
    }

    render () {
        const {
            width,
            height,
            backgroundColor,
            shadowColor
        } = this.props;

        return (
            <View style = {[Style.fullSize, {
                backgroundColor: 'transparent'
            }]}>
                <Animated.View style = {{
                    width: this._translateXAnimatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, width]
                    }),
                    backgroundColor: shadowColor
                }}></Animated.View>
                <JointBlock
                    shape = {ShapeMap.emptyTriangle}
                    width = {height / 2}
                    height = {height}
                    backgroundColor = {backgroundColor}
                />
            </View>
        );
    }
}

export {
    AnimatedProgressShadowBar
};
