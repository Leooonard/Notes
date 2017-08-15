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
} from '../../../Type/AnimatedType';

const windowWidth = Dimensions.get('window').width;

type Props = {
    onFinish: () => void
};

class AnimatedProgressShadowBar extends Component {
    props: Props;
    _translateXAnimatedValue: AnimatedValueType;

    constructor (props: Props) {
        super(props);
        this._translateXAnimatedValue = new Animated.Value(0);
    }

    componentDidMount () {
        Animated.timing(this._translateXAnimatedValue, {
            toValue: 1,
            duration: 1000 * 10,
            easing: Easing.linear
        }).start(this.props.onFinish);
    }

    render () {
        return (
            <Animated.View style = {{
                position: 'absolute',
                top: 0,
                bottom: 0,
                width: this._translateXAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, windowWidth]
                }),
                backgroundColor: 'rgba(255, 0, 0, 0.3)'
            }}>
            </Animated.View>
        );
    }
}

export {
    AnimatedProgressShadowBar
};
