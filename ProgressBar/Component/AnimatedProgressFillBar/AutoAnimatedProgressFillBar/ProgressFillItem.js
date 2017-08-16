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

import type {
    AnimatedValueType
} from '../../../Type/AnimatedType';

type Props = {
    width: number,
    height: number,
    deg: string,
    backgroundColor: string,
    transformedBackgroundColor: string,
    customTransform?: Array<Object>
};

class TransformableProgressFillItem extends Component {
    props: Props;
    _backgroundAnimatedValue: AnimatedValueType;

    constructor (props: Props) {
        super(props);

        this._backgroundAnimatedValue = new Animated.Value(0);
    }

    transformBackgroundColor (): Promise<any> {
        return new Promise(resolve => {
            Animated.timing(this._backgroundAnimatedValue, {
                toValue: 1,
                duration: 500,
                easing: Easing.linear
            }).start(resolve);
        });
    }

    render () {
        const {
            width,
            height,
            deg,
            backgroundColor,
            transformedBackgroundColor,
            customTransform = []
        } = this.props;

        return (
            <Animated.View style = {{
                width,
                height,
                transform: [
                    {
                        rotate: deg
                    },
                    ...customTransform
                ],
                backgroundColor: this._backgroundAnimatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [backgroundColor, transformedBackgroundColor]
                })
            }}></Animated.View>
        );
    }
}

const DARK_FILL_ITEM_WIDTH = 30;
const DARK_FILL_ITEM_HEIGHT = 150;
class ProgressDarkFillItem extends Component {
    _transformableProgressFillItem: ?TransformableProgressFillItem;

    transformBackgroundColor () {
        this._transformableProgressFillItem &&
        this._transformableProgressFillItem.transformBackgroundColor();
    }

    render () {
        return (
            <TransformableProgressFillItem
                ref = {ref => this._transformableProgressFillItem = ref}
                width = {DARK_FILL_ITEM_WIDTH}
                height = {DARK_FILL_ITEM_HEIGHT}
                deg = {'45deg'}
                backgroundColor = {'#009EE1'}
                transformedBackgroundColor = {'#A17F19'}
                customTransform = {[
                    {
                        translateY: -45
                    }
                ]}
            />
        );
    }
}

const LIGHT_FILL_ITEM_WIDTH = 20;
const LIGHT_FILL_ITEM_HEIGHT = 150;
class ProgressLightFillItem extends Component {
    _transformableProgressFillItem: ?TransformableProgressFillItem;

    transformBackgroundColor () {
        this._transformableProgressFillItem &&
        this._transformableProgressFillItem.transformBackgroundColor();
    }

    render () {
        return (
            <TransformableProgressFillItem
                ref = {ref => this._transformableProgressFillItem = ref}
                width = {LIGHT_FILL_ITEM_WIDTH}
                height = {LIGHT_FILL_ITEM_HEIGHT}
                deg = {'45deg'}
                backgroundColor = {'#0FC7E6'}
                transformedBackgroundColor = {'#E0C672'}
                customTransform = {[
                    {
                        translateY: -45
                    }
                ]}
            />
        );
    }
}

export {
    ProgressDarkFillItem,
    ProgressLightFillItem,
    DARK_FILL_ITEM_WIDTH,
    LIGHT_FILL_ITEM_WIDTH
};
