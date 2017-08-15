// @flow

import React, {
    Component
} from 'react';

import {
    View,
    StyleSheet
} from 'react-native';

import {
    LinearGradient
} from '@ctrip/crn';

import {
    AnimatedProgressBackgroundBar,
    ShapeMap
} from './Component/AnimatedProgressBackgroundBar/';

import type {
    ShapeType
} from './Component/AnimatedProgressBackgroundBar';

import {
    AnimatedProgressFillBar
} from './Component/AnimatedProgressFillBar';

export type EasingType = (t: number) => number;
export type AnimationSegment = {
    /**
     * 当段动画的toValue
     */
    toValue: number,
    /**
     * 当段动画的执行时长
     */
    duration: number,
    /**
     * 当段动画的缓动函数
     */
    easing: EasingType,
    /**
     * 当段动画执行结束后，会调用callback，callback的返回值决定是否继续执行下段动画，
     * 如果返回true，则继续执行下段动画
     */
    onReachEnd: (index: number) => bool
};

type Props = {
    /**
     * 进度条背景色
     */
    progressBackgroundColor: string,
    /**
     * 更新进度数值
     */
    onUpdateProgressValue: (progressValue: number) => void,
    /**
     * 进度条高度
     */
    progressBarHeight: number,
    /**
     * 分段动画列表，每个item都是一个具体的动画信息
     */
    animationSegmentList: Array<AnimationSegment>
};

type State = {
    shape: ShapeType
};

class AnimatedProgressBar extends Component {
    props: Props;
    state: State;
    _animatedProgressBackgroundBar: ?AnimatedProgressBackgroundBar;
    _animatedProgressFillBar: ?AnimatedProgressFillBar;

    constructor () {
        super();

        this.state = {
            shape: ShapeMap.square
        };
    }

    /**
    * 暂停当前正在执行的动画
    */
    pauseAnimation (): void {
        this._animatedProgressBackgroundBar &&
        this._animatedProgressBackgroundBar.pauseAnimationSegment();
    }

    /**
    * 恢复正在暂停的动画。如果传入新的缓动函数，则剩余的动画将按照新的缓动函数进行执行。
    * 如果不传入新的缓动函数，则完全按照之前定义的缓动函数把剩余的动画执行完毕。
    */
    resumeAnimation (easing?: EasingType): void {
        this._animatedProgressBackgroundBar &&
        this._animatedProgressBackgroundBar.resumeAnimationSegment(easing);
    }

    transform (): void {
        this._animatedProgressFillBar &&
        this._animatedProgressFillBar.transform();
        this.setState({
            shape: ShapeMap.emptyTriangle
        });
    }

    _getProgressFillComponent (progressFillColor?: string, progressFillComponent?: React$Element<any>): React$Element<any> {
        const getFullSizeElement = component => {
            return (
                <View style = {styles.fullSize}>
                    {component}
                </View>
            );
        };

        if (!progressFillColor && !progressFillComponent) {
            throw new Error('progressFillColor or progressFillComponent should at least has one');
        }

        /**
         * 当用户传入了自定义填充色和自定义填充组件时，优先使用组件
         */
        if (progressFillColor && progressFillComponent) {
            return getFullSizeElement(progressFillComponent);
        }

        if (typeof progressFillColor === 'string') {
            return (
                <View style = {[styles.fullSize, {
                    backgroundColor: progressFillColor
                }]}></View>
            );
        } else {
            return getFullSizeElement(progressFillComponent);
        }
    }

    render () {
        const {
            progressBarHeight,
            onUpdateProgressValue,
            animationSegmentList
        } = this.props;

        return (
            <View style = {{
                height: progressBarHeight,
            }}>
                <AnimatedProgressFillBar
                    ref = {ref => this._animatedProgressFillBar = ref}
                    height = {progressBarHeight}
                />
                <LinearGradient
                    start = {{x: 0, y: 0}}
                    end = {{x: 1, y: 1}}
                    colors = {['rgba(15, 199, 230, 0.5)', '#0FC7E6']}
                    style = {styles.fullSize}
                />
                <AnimatedProgressBackgroundBar
                    ref = {ref => this._animatedProgressBackgroundBar = ref}
                    shape = {this.state.shape}
                    backgroundColor = {'#5B6B83'}
                    onUpdateAnimationValue = {onUpdateProgressValue}
                    animationSegmentList = {animationSegmentList}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    fullSize: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }
});

export {
    AnimatedProgressBar
};
