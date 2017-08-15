// @flow

import React, {
    Component
} from 'react';

import {
    View,
    Text,
    Easing,
    TouchableOpacity
} from 'react-native';

import {
    AnimatedProgressBar
} from './ProgressBar/';

import {
    AnimatedProgressFillBar
} from './ProgressBar/Component/AnimatedProgressFillBar';

import {
    ProgressContentBar
} from './ProgressBar/Component/ProgressContentBar';

import {
    AnimatedProgressShadowBar
} from './ProgressBar/Component/AnimatedProgressShadowBar';

class AdvertisementVideoPage extends Component {
    state: {
        progressValue: number,
        showShadowBar: bool
    }
    _animatedProgressBar: ?AnimatedProgressBar;

    constructor (props: {}) {
        super(props);

        this.state = {
            progressValue: 0,
            showShadowBar: true
        };
    }

    _updateProgressValue (animationValue: number) {
        this.setState({
            progressValue: animationValue
        });
    }

    render () {
        const BAR_HEIGHT = 60;

        return (
            <View>
                <View style = {{
                    backgroundColor: 'red'
                }}>
                    <AnimatedProgressBar
                        ref = {ref => this._animatedProgressBar = ref}
                        progressBackgroundColor = {'#5B6B83'}
                        onUpdateProgressValue = {progressValue => this.setState({
                            progressValue
                        })}
                        progressBarHeight = {BAR_HEIGHT}
                        animationSegmentList = {[
                            {
                                toValue: 0.8,
                                duration: 1000 * 20,
                                easing: Easing.inOut(Easing.quad),
                                onReachEnd: () => true
                            }
                        ]}
                    />
                    {
                        this.state.showShadowBar ?
                        <AnimatedProgressShadowBar onFinish = {() => this.setState({
                            showShadowBar: false
                        })}/> :
                        null
                    }
                    <ProgressContentBar progressValue = {this.state.progressValue}/>
                </View>
                <View style = {{backgroundColor: 'white', flexDirection: 'row'}}>
                    <TouchableOpacity
                        style = {{
                            backgroundColor: 'red',
                            width: 100,
                            height: 50
                        }}
                        onPress = {() => {
                            this._animatedProgressBar &&
                            this._animatedProgressBar.pauseAnimation();
                        }}
                    >
                        <Text>暂停</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style = {{
                            backgroundColor: 'green',
                            width: 100,
                            height: 50
                        }}
                        onPress = {() => {
                            this._animatedProgressBar &&
                            this._animatedProgressBar.resumeAnimation();
                        }}
                    >
                        <Text>继续</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style = {{
                            backgroundColor: 'blue',
                            width: 100,
                            height: 50
                        }}
                        onPress = {() => {
                            this._animatedProgressBar &&
                            this._animatedProgressBar.transform();
                        }}
                    >
                        <Text>变色</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

export {
    AdvertisementVideoPage
};
