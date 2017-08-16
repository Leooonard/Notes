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

type Props = {
    tips: Array<string>,
    width: number
};

const TIP_INTERVAL = 3000;
const TIP_DURATION = 500;

class AnimatedTips extends Component {
    props: Props;

    constructor (props: Props) {
        super(props);

        this._tips = [...this.props.tips, this.props.tips[0]]
        this._marginLeftAnimatedValue = new Animated.Value(0);
    }

    _renderTips () {
        return this._tips.map((tip, index) => {
            return (
                <Text
                    key = {`tips_${index}`}
                    style = {{
                        width: this.props.width,
                        fontSize: 20,
                        color: 'white'
                    }}
                >
                    {tip}
                </Text>
            );
        });
    }

    _generateAnimationOptionList () {
        return this._tips.map((_, index) => {
            return {
                toValue: (index + 1) / (TIP.length - 1),
                delay: TIP_INTERVAL,
                duration: TIP_DURATION
            };
        });
    }

    _generateAnimationList (animationOptionList) {
        return animationOptionList.map(animationOption => {
            return Animated.timing(this._marginLeftAnimatedValue, animationOption);
        });
    }

    _generateInputRange () {
        return this._tips.map((_, index) => {
            return index / (this._tips.length - 1);
        });
    }

    _generateOutputRange () {
        return this._tips.map((_, index) => {
            return -1 * index * this.props.width;
        });
    }

    _loopTipAnimation () {
        const animationOptionList = this._generateAnimationOptionList();
        const animationList = this._generateAnimationList(animationOptionList);

        Animated
        .sequence(animationList)
        .start((result) => {
            if (!result.finished) {
                return;
            }

            this._marginLeftAnimatedValue.setValue(0);
            this._loopTipAnimation();
        });
    }

    componentDidMount () {
        this._loopTipAnimation();
    }

    render () {
        return (
            <Animated.View style = {{
                flexDirection: 'row',
                marginLeft: this._marginLeftAnimatedValue.interpolate({
                    inputRange: this._generateInputRange(),
                    outputRange: this._generateOutputRange()
                })
            }}>
                {this._renderTips()}
            </Animated.View>
        );
    }
}

export {
    AnimatedTips
};
