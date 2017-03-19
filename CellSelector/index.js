/* @flow */

'use strict';

import React, {
    Component
} from "react";

import {
    StyleSheet,
    TouchableOpacity,
    View,
    Animated
} from "react-native";

/**
 * CellSelector，一个用于组织大量单元格的组件，提供以下功能：
 * 1. 智能的判断是否展示更多Cell。
 * 2. 设置每行有几个Cell。
 * 3. 设置多少行后出现更多Cell。
 * 4. 设置更多展开后是否可以收起。
 * 5. 更多展开收起的效果是否带有动画。
 * 6. 可以动态刷新CellSelector中的Cell。
 * 7. 可以确定动态刷新是否带有动画效果。
 * 8. 暴露Cell被点击的回调方法。
 * 9. 提供一个渲染每个Cell的方法。
 */

import type {
    CellType
} from './Cell';

import type {
    DataTableType
} from './DataTable';

import type {
    RenderTableType
} from './RenderTable';

import type {
    ActionManagerType
} from './ActionManager';

import type {
    ReducerType
} from './Reducer';

import {
    DataTable
} from './DataTable';

import {
    RenderTable
} from './RenderTable';

import {
    ExpandCell,
    DataCell,
    EmptyCell,
    AnimatedDataCell,
    AnimatedExpandCell,
    AnimatedReplaceCell
} from './Cell';

import {
    ActionManager
} from './ActionManager';

import {
    Action
} from './Action';

import {
    Reducer
} from './Reducer';

type RenderCellFunction = (index: number) => ReactClass<any>;
type RenderExpandCellFunction = (isExpanding: bool) => ReactClass<any>;

type Props = {
    dataArray: Array<any>, // Cell的数据源。
    tableWidth: number, // 每行有几个Cell。
    maxRowForBrief: number, // 多少行后出现更多Cell。
    renderCell: RenderCellFunction, // 渲染Cell的方法。
    canPackup: ?bool, // 是否有收起功能。
    defaultExpand: ?bool, // 初始时是否展开。
    renderExpandCell: ?RenderExpandCellFunction, // 渲染更多Cell的方法。
    canAnimate: ?bool, // 是否使用动画效果。（展开收起时，刷新时）
    animateDuration: ?number // 动画时长。
};

type State = {
    renderTable: Array<Array<CellType>> // 当前将要渲染的Cell表格。
};

class CellSelector extends Component {
    state: State;
    _needPackup: bool;
    _dataTable: DataTableType;
    _renderTable: RenderTableType;
    _actionManager: ActionManagerType;
    _reducer: ReducerType;
    _isExpanding: bool;
    _isAnimating: bool;

    constructor (props: Props) {
        super(props);

        let {
            defaultExpand,
            canPackup,
            tableWidth,
            maxRowForBrief,
            dataArray
        } = props;

        defaultExpand = defaultExpand || false;
        canPackup = canPackup || false;

        this._needPackup = this._decideNeedPackup(canPackup, dataArray, tableWidth, maxRowForBrief);
        this._dataTable = new DataTable(dataArray, tableWidth);
        this._renderTable = new RenderTable(this._dataTable, this._needPackup, defaultExpand,
                                            maxRowForBrief, this.renderTablePromisely.bind(this));
        this._actionManager = new ActionManager(this._renderTable, this._dataTable);
        this._reducer = new Reducer(this._actionManager, this._renderTable, this._stopAnimating.bind(this));

        this._isExpanding = defaultExpand;
        this._isAnimating = false;
        this.state = {
            renderTable: this._renderTable.getTable()
        };
    }

    _decideNeedPackup (canPackup: bool, dataArray: Array<any>, tableWidth: number, maxRowForBrief: number) {
        return canPackup && ((dataArray.length / tableWidth) > maxRowForBrief);
    }

    _toggleExpanding () {
        let {
            canAnimate
        } = this.props;

        this._isExpanding = !this._isExpanding;
        this._isAnimating = true;
        this._renderTable.setIsExpanding(this._isExpanding)

        if (this._isExpanding) {
            this._actionManager.dispatchUserAction(Action.generateUserExpandTableAction(),
                                                    () => this._reducer.startReduceAction());
        } else {
            this._actionManager.dispatchUserAction(Action.generateUserPackupTableAction(),
                                                    () => this._reducer.startReduceAction());
        }
    }

    renderTablePromisely () {
        return new Promise((resolve, reject) => {
            this.setState({
                renderTable: this._renderTable.getTable()
            }, resolve);
        });
    }

    _stopAnimating () {
        this._isAnimating = false;
    }

    _renderEmptyCell () {
        return (
            <View></View>
        );
    }

    _drawCell (dataCell: CellType, dataIndex: number): ReactClass<any> {
        let {
            renderCell,
            renderExpandCell
        } = this.props;

        let isExpanding = this._isExpanding;

        let cellComponent;
        let self = this;

        if (ExpandCell.isExpandCell(dataCell)) {
            cellComponent = renderExpandCell(isExpanding, this._toggleExpanding.bind(this));
        } else if (EmptyCell.isEmptyCell(dataCell)) {
            cellComponent = this._renderEmptyCell();
        } else if (DataCell.isDataCell(dataCell)) {
            cellComponent = renderCell(dataIndex);
        } else if (AnimatedDataCell.isAnimatedDataCell(dataCell)) {
            cellComponent = (
                <Animated.View style = {{
                    opacity: dataCell.getAnimatedValue()
                }}>
                    {renderCell(dataIndex)}
                </Animated.View>
            );
        } else if (AnimatedExpandCell.isAnimatedExpandCell(dataCell)) {
            cellComponent = (
                <Animated.View style = {{
                    opacity: dataCell.getAnimatedValue()
                }}>
                    {
                        renderExpandCell(true, self._toggleExpanding.bind(self))
                    }
                </Animated.View>
            );
        } else if (AnimatedReplaceCell.isAnimatedReplaceCell(dataCell)) {
            let currentCell = dataCell.getCurrentCell();
            let replaceCell = dataCell.getReplaceCell();
            let currentComponent, replaceComponent;

            if (DataCell.isDataCell(currentCell) || AnimatedDataCell.isAnimatedDataCell(currentCell)) {
                currentComponent = (
                    <Animated.View style = {{
                        opacity: dataCell.getCurrentAnimatedValue()
                    }}>
                        {renderCell(dataIndex)}
                    </Animated.View>
                );
            } else if (ExpandCell.isExpandCell(currentCell) || AnimatedExpandCell.isAnimatedExpandCell(currentCell)) {
                // 注意!isExpanding的写法，特别脏！！！要注意。
                currentComponent = (
                    <Animated.View style = {{
                        opacity: dataCell.getCurrentAnimatedValue()
                    }}>
                        {
                            renderExpandCell(!isExpanding, self._toggleExpanding.bind(self))
                        }
                    </Animated.View>
                );
            } else {
                throw new Error('error current cell type');
            }

            if (DataCell.isDataCell(replaceCell) || AnimatedDataCell.isAnimatedDataCell(replaceCell)) {
                replaceComponent = (
                    <Animated.View style = {{
                        opacity: dataCell.getReplaceAnimatedValue(),
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }}>
                        {renderCell(dataIndex)}
                    </Animated.View>
                );
            } else if (ExpandCell.isExpandCell(replaceCell) || AnimatedExpandCell.isAnimatedExpandCell(replaceCell)) {
                replaceComponent = (
                    <Animated.View style = {{
                        opacity: dataCell.getReplaceAnimatedValue(),
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0
                    }}>
                        {
                            renderExpandCell(isExpanding, self._toggleExpanding.bind(self))
                        }
                    </Animated.View>
                );
            } else {
                throw new Error('error current cell type');
            }

            cellComponent = (
                <View>
                    {currentComponent}
                    {replaceComponent}
                </View>
            );
        } else {
            throw new Error('unknown cell type');
        }

        return (
            <View style = {{flex: 1}}>
                {cellComponent}
            </View>
        );
    }

    _drawRow (dataRow: Array<CellType>, rowIndex: number): ReactClass<any> {
        let cellList = [];
        let {
            tableWidth
        } = this.props;

        dataRow.forEach((dataCell, columnIndex) => {
            let dataIndex = this._dataTable.transformTwoDimCoordToOneDimCoord(rowIndex, columnIndex);
            let cell = this._drawCell(dataCell, dataIndex);
            cellList.push(cell);
        });

        return (
            <View style = {{
                flexDirection: 'row'
            }}>
                {cellList}
            </View>
        );
    }

    /*
        渲染所有的Cell。
        作用是判断该渲染哪几行。
    */
    _drawTable (): Array<ReactClass<any>> {
        let rowComponentList = [];
        let {
            renderTable
        } = this.state;

        renderTable.forEach((renderRow, rowIndex) => {
            let rowComponent = this._drawRow(renderRow, rowIndex);
            rowComponentList.push(rowComponent);
        });

        return rowComponentList;
    }

    render () {
        return (
            <View>
                {this._drawTable()}
            </View>
        );
    }
}

const styles = StyleSheet.create({

});

export type CellSelectorType = CellSelector;
export {
    CellSelector
};
