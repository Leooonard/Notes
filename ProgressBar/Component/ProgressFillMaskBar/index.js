// @flow

import React, {
    Component
} from 'react';

import {
    Animated,
    View,
    Easing
} from 'react-native';

import type {
    AnimatedValueType
} from '../../Type/AnimatedType';

import * as Style from '../../Style/';

type Props = {
    fromColors: [number, number],
    toColors: [number, number],
    conainerWidth: number,
    relativeAnimatedValue: AnimatedValueType
};

class ProgressFillMaskBar extends Component {
    props: Props;
    _backgroundColorAnimatedValue: AnimatedValueType;

    constructor (props: Props) {
        super(props);

        this._backgroundColorAnimatedValue = new Animated.Value(0);
    }

    componentDidMount () {
        const {
            relativeAnimatedValue
        } = this.props;

        Animated.timing({
            toValue: relativeAnimatedValue
        }).start();
    }

    render () {
        const {
            containerWidth
        } = this.props;

        return (
            <View style = {[Style.fullSize, {
                backgroundColor: 'transparent'
            }]}>
                <Animated.View style = {{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    width: this._backgroundColorAnimatedValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, containerWidth]
                    })
                }}></Animated.View>
            </View>
        );
    }
}

export {
    ProgressFillMaskBar
};
