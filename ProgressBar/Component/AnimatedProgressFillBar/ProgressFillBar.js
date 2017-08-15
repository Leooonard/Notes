// @flow

import React, {
    Component
} from 'react';

import {
    View,
    StyleSheet,
    Dimensions
} from 'react-native';

import {
    ProgressDarkFillItem,
    DARK_FILL_ITEM_WIDTH,
    ProgressLightFillItem,
    LIGHT_FILL_ITEM_WIDTH
} from './ProgressFillItem';

const windowWidth = Dimensions.get('window').width;
const MAX_TRANSLATE_X_DISTANCE = 2 * (DARK_FILL_ITEM_WIDTH + LIGHT_FILL_ITEM_WIDTH) * Math.pow(2, 0.5) + 10;

type Props = {
    height: number
};

class ProgressFillBar extends Component {
    _fillItemList: Array<?ProgressDarkFillItem | ?ProgressLightFillItem>;

    constructor (props: Props) {
        super(props);

        this._fillItemList = [];
    }

    _caculateFillItemCount (): number {
        /**
         * 计算屏幕最多能容纳多少个fillItem。
         * 一暗一明，两个fillItem作为一组进行计算。
         */
        const doubleFillItemWidth = DARK_FILL_ITEM_WIDTH + LIGHT_FILL_ITEM_WIDTH;
        /**
         * 系数，制造出的fillItem宽度 = 屏幕宽度 * 系数。
         */
        const coefficient = 3;

        /**
         * fillItem个数 = 屏幕宽度 * 系数 / fillItem组宽度
         */
        return Math.ceil(windowWidth * coefficient / doubleFillItemWidth);
    }

    _renderFillItem (): Array<React$Element<any>> {
        const fillItemCount = this._caculateFillItemCount();
        const fillItemList = [];

        for (let i = 0 ; i < fillItemCount ; i++) {
            fillItemList.push(<ProgressLightFillItem ref = {ref => this._fillItemList.push(ref)} key = {`light_${i}`}/>);
            fillItemList.push(<ProgressDarkFillItem ref = {ref => this._fillItemList.push(ref)} key = {`dark_${i}`}/>);
        }

        return fillItemList;
    }

    transformBackgroundColor () {
        this._fillItemList.forEach(fillItem => fillItem && fillItem.transformBackgroundColor());
    }

    render () {
        return (
            <View style = {{
                height: this.props.height,
                flexDirection: 'row',
                transform: [
                    {
                        translateX: -1.5 * MAX_TRANSLATE_X_DISTANCE
                    }
                ]
            }}>
                {this._renderFillItem()}
            </View>
        );
    }
}

export {
    ProgressFillBar,
    MAX_TRANSLATE_X_DISTANCE
};
