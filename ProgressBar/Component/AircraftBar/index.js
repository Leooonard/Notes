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
    aircraftWidth: number,
    aircraftHeight: number,
    containerWidth: number
};
type State = {
    showAircraft: bool
};

class AircraftBar extends Component {
    props: Props;
    state: State;
    _aircraftAnimatedValue: AnimatedValueType;

    constructor (props: Props) {
        super(props);

        this.state = {
            showAircraft: false
        };
        this._aircraftAnimatedValue = new Animated.Value(0);
    }

    showAircraft (animatedValue: number, duration: number): Promise<any> {
        return new Promise(resolve => {
            this.setState({
                showAircraft: true
            }, () => {
                Animated.timing(this._aircraftAnimatedValue, {
                    toValue: animatedValue,
                    duration,
                    easing: Easing.linear
                }).start(resolve);
            });
        });
    }

    animateAircraftWithRelativeAnimatedValue (animatedValue: AnimatedValueType) {
        Animated.timing(this._aircraftAnimatedValue, {
            toValue: animatedValue
        });
    }

    _renderAircraft () {
        const {
            aircraftWidth,
            aircraftHeight,
            containerWidth
        } = this.props;

        return (
            <Animated.View style = {{
                width: aircraftWidth,
                height: aircraftHeight,
                backgroundColor: 'white',
                marginLeft: this._aircraftAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0 - aircraftWidth / 2, containerWidth - aircraftWidth / 2]
                })
            }}></Animated.View>
        );
    }

    render () {
        const {
            showAircraft
        } = this.state;

        return (
            <View style = {[Style.fullSize, {
                backgroundColor: 'transparent',
                justifyContent: 'center'
            }]}>
                {
                    showAircraft ?
                    this._renderAircraft() :
                    null
                }
            </View>
        );
    }
}

export {
    AircraftBar
};
