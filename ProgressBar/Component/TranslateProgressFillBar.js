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
    AnimatedProgressFillBar
} from './AnimatedProgressFillBar';

import type {
    AnimatedValueType
} from '../../../Type/AnimatedType';

import {
    RenewableAnimationWrapper
} from '../Library/RenewableAnimationWrapper';

function animatePromisely (animatedValue: AnimatedValueType, option: Object): Promise<void> {
    return new Promise(resolve => {
        Animated.timing(animatedValue, option).start(resolve);
    });
}

type Props = {
    height: number
};

class TranslateProgressFillBar extends Component {
    props: Props;
    _translateXAnimation: AnimatedValueType
    _animatedProgressFillBar: ?AnimatedProgressFillBar;

    constructor (props: Props) {
        super(props);

        this._translateXAnimation = new Animated.Value(0);
    }

    _loopAnimation () {
        return;
        animatePromisely(this._translateXAnimation, {
            toValue: 1,
            duration: this._loopDuration,
            easing: Easing.linear,
            useNativeDriver: true
        })
        .then(() => this._translateXAnimation.setValue(0))
        .then(this._loopAnimation.bind(this));
    }

    transform () {
        this._animatedProgressFillBar &&
        this._animatedProgressFillBar.transformBackgroundColor();
        this._loopDuration = FAST_LOOP_DURATION;
    }

    render () {
        return (
            <View style = {{
                flex: 0
            }}>
                <Animated.View style = {{
                    transform: [
                        {
                            translateX: this._translateXAnimation.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 1 * MAX_TRANSLATE_X_DISTANCE]
                            })
                        }
                    ]
                }}>
                    <ProgressFillBar
                        ref = {ref => this._progressFillBar = ref}
                        height = {this.props.height}
                    />
                </Animated.View>
            </View>
        );
    }
}

export {
    TranslateProgressFillBar
};
