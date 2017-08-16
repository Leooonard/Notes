// @flow

import React, {
    Component
} from 'react';

import {
    Animated,
    View,
    Text
} from 'react-native';

import * as Style from '../../Style/';

import {
    AnimatedTips
} from './AnimatedTips';

type Props = {
    progressValue: number,
    tips: Array<string>,
    flightNo: string,
    date: string,
    departCity: string,
    arriveCity: string
};

class ProgressContentBar extends Component {
    props: Props;

    constructor () {
        this._marginLeftAnimatedValue = new Animated.Value(0);
    }

    _renderFlightInfo () {
        const {
            flightNo,
            date,
            departCity,
            arriveCity
        } = this.props;

        return (
            <Text style = {{
                fontSize: 12,
                color: 'white'
            }}>
                {`${flightNo} ${date} ${departCity}-${arriveCity}`}
            </Text>
        );
    }

    _renderProgressValue () {
        return (
            <Text style = {{
                alignSelf: 'center',
                fontSize: 20,
                color: 'white'
            }}>
                {`${this.props.progressValue}%`}
            </Text>
        );
    }

    render () {
        return (
            <View style = {[Style.fullSize, {
                backgroundColor: 'transparent',
                flexDirection: 'row',
                paddingHorizontal: 15,
                justifyContent: 'space-between'
            }]}>
                <View style = {{
                    flex: 1,
                    justifyContent: 'center'
                }}>
                    <View style = {{
                        marginBottom: 5
                    }}>
                        <AnimatedTips
                            tips = {this.props.tips}
                            width = {200}
                        />
                    </View>
                    {this._renderFlightInfo()}
                </View>
                {this._renderProgressValue()}
            </View>
        );
    }
}

export {
    ProgressContentBar
};
