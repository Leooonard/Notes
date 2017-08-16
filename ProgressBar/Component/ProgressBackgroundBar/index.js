// @flow

import React, {
    Component
} from 'react';

import {
    View
} from 'react-native';

import * as Style from '../../Style'

type Props = {
    backgroundColor: string
};

class ProgressBackgroundBar extends Component {
    props: Props;

    render () {
        const {
            backgroundColor,
        } = this.props;

        return (
            <View style = {Style.fullSize}></View>
        );
    }
}

export {
    ProgressBackgroundBar
};
