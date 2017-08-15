// @flow

import React, {
    Component
} from 'react';

import {
    View,
    Text
} from 'react-native';

type Props = {
    progressValue: number
};

class ProgressContentBar extends Component {
    props: Props;

    render () {
        return (
            <View style = {{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                backgroundColor: 'transparent',
                flexDirection: 'row',
                paddingHorizontal: 15,
                justifyContent: 'space-between'
            }}>
                <View style = {{
                    justifyContent: 'center'
                }}>
                    <Text style = {{
                        fontSize: 20,
                        color: 'white',
                        marginBottom: 5
                    }}>{'正在为您占座'}</Text>
                    <Text style = {{
                        fontSize: 12,
                        color: 'white'
                    }}>{'MU3380 08-12 上海-成都'}</Text>
                </View>
                <Text style = {{
                    alignSelf: 'center',
                    fontSize: 20,
                    color: 'white'
                }}>{`${this.props.progressValue}%`}</Text>
            </View>
        );
    }
}

export {
    ProgressContentBar
};
