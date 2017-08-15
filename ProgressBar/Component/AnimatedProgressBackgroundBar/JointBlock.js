// @flow

import React, {
    Component
} from 'react';

import {
    View,
    StyleSheet
} from 'react-native';

export type ShapeType = 'square' | 'emptyTriangle';
const ShapeMap: {
    square: 'square',
    emptyTriangle: 'emptyTriangle'
} = {
    square: 'square',
    emptyTriangle: 'emptyTriangle'
};

type Props = {
    shape: ShapeType,
    width: number,
    height: number,
    backgroundColor: string
};

class JointBlock extends Component {
    props: Props;

    _renderSquare () {
        const {
            width,
            height,
            backgroundColor
        } = this.props;

        return (
            <View style = {{
                width,
                height,
                backgroundColor
            }}></View>
        );
    }

    _renderEmptyTriangle () {
        const {
            width,
            height,
            backgroundColor
        } = this.props;

        return (
            <View style = {{
                width,
                height,
                backgroundColor: 'transparent'
            }}>
                <View style = {[this._getTriangleStyle(width, height, backgroundColor), {
                    transform: [
                        {
                            rotate: '270deg'
                        }
                    ]
                }]}></View>
                <View style = {this._getTriangleStyle(width, height, backgroundColor)}></View>
            </View>
        );
    }

    _getTriangleStyle (width: number, height: number, backgroundColor: string): Object {
        return {
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderRightWidth: width,
            borderRightColor: backgroundColor,
            borderTopWidth: height / 2,
            borderTopColor: 'transparent'
        };
    }

    render () {
        const {
            shape
        } = this.props;

        if (shape === ShapeMap.square) {
            return this._renderSquare();
        } else {
            return this._renderEmptyTriangle();
        }
    }
}

export {
    JointBlock,
    ShapeMap
};
