/* @flow */

'use strict';

import React, {
    Component
} from "react";

import {
    StyleSheet,
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
type RenderExpandCellFunction = (isExpanding: bool, toggleExpanding: () => void) => ReactClass<any>;

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
    _canAnimate: bool;
    _animateDuration: number;
    _tableOpacityValue: any;
    _initProps: Object;

    constructor (props: Props) {
        super(props);

        this._init(props);
        this._tableOpacityValue = new Animated.Value(1);

        this.state = {
            renderTable: this._renderTable.getTable()
        };
    }

    _init (props) {
        this._initProps = {
            ...props
        };

        let {
            dataArray,
            tableWidth,
            maxRowForBrief,
            renderCell,
            canPackup,
            defaultExpand,
            renderExpandCell,
            canAnimate,
            animateDuration
        } = props;

        if (!Array.isArray(dataArray)) {
            throw new Error('CellSelector must have a dataArray in array type');
        } else if (typeof renderCell !== 'function') {
            throw new Error('CellSelector must have a renderCell function as param');
        } else if (canPackup && typeof renderExpandCell !== 'function') {
            throw new Error('CellSelector must have a renderExpandCell function as param');
        }

        defaultExpand = defaultExpand || false;
        canPackup = canPackup || false;
        tableWidth = tableWidth || 1;
        maxRowForBrief = maxRowForBrief || 3;
        canAnimate = canAnimate || false;
        animateDuration = animateDuration || 500;

        this._needPackup = this._decideNeedPackup(canPackup, dataArray, tableWidth, maxRowForBrief);
        this._dataTable = new DataTable(dataArray, tableWidth);
        this._renderTable = new RenderTable(this._dataTable, this._needPackup, defaultExpand,
                                            maxRowForBrief, this.renderTablePromisely.bind(this));
        this._actionManager = new ActionManager(this._renderTable, this._dataTable);
        this._reducer = new Reducer(this._actionManager, this._renderTable, {
            hideTable: this._hideTable.bind(this),
            showTable: this._showTable.bind(this)
        }, this._stopAnimating.bind(this));

        this._isExpanding = defaultExpand;
        this._canAnimate = canAnimate;
        this._animateDuration = animateDuration;
        this._isAnimating = false;
    }

    updateCellSelector (nextProps) {
        nextProps = Object.assign({}, this._initProps, nextProps);
        this._reducer.stopReduce();

        this._init(nextProps);

        if (this._canAnimate) {
            this._actionManager.dispatchUserAction(Action.generateUserReplaceTableAction(),
                                                    () => this._reducer.startReduceAction());
        } else {
            this.setState({
                renderTable: this._renderTable.getTable()
            });
        }
    }

    _decideNeedPackup (canPackup: bool, dataArray: Array<any>, tableWidth: number, maxRowForBrief: number) {
        return canPackup && ((dataArray.length / tableWidth) > maxRowForBrief);
    }

    _toggleExpanding () {
        this._isExpanding = !this._isExpanding;
        this._renderTable.setIsExpanding(this._isExpanding);

        if (this._canAnimate) {
            this._isAnimating = true;

            if (this._isExpanding) {
                this._actionManager.dispatchUserAction(Action.generateUserExpandTableAction(),
                                                        () => this._reducer.startReduceAction());
            } else {
                this._actionManager.dispatchUserAction(Action.generateUserPackupTableAction(),
                                                        () => this._reducer.startReduceAction());
            }
        } else {
            this._renderTable.updateTable();
            this.setState({
                renderTable: this._renderTable.getTable()
            });
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
            <View style = {styles.cell}></View>
        );
    }

    _renderExpandCell (expandCell: CellType) {
        let {
            renderExpandCell
        } = this.props;

        return (
            <View style = {styles.cell}>
                {renderExpandCell(expandCell.getIsExpanding(), this._toggleExpanding.bind(this))}
            </View>
        );
    }

    _renderDataCell (dataCell: CellType) {
        let {
            renderCell
        } = this.props;

        return (
            <View style = {styles.cell}>
                {
                    renderCell(this._dataTable.transformTwoDimCoordToOneDimCoord(dataCell.getRowIndex(),
                                                                                dataCell.getColumnIndex()))
                }
            </View>
        );
    }

    _renderAnimatedDataCell (animatedValue: any, animatedDataCell: CellType) {
        let {
            renderCell
        } = this.props;

        return (
            <Animated.View style = {[styles.cell, {
                opacity: animatedValue
            }]}>
                {
                    renderCell(this._dataTable.transformTwoDimCoordToOneDimCoord(animatedDataCell.getDataCell().getRowIndex(),
                                                                                animatedDataCell.getDataCell().getColumnIndex()))
                }
            </Animated.View>
        );
    }

    _renderAnimatedExpandCell (animatedValue: any, animatedExpandCell: CellType) {
        let {
            renderExpandCell
        } = this.props;

        return (
            <Animated.View style = {[styles.cell, {
                opacity: animatedValue
            }]}>
                {renderExpandCell(animatedExpandCell.getExpandCell().getIsExpanding(), this._toggleExpanding.bind(this))}
            </Animated.View>
        )
    }

    _renderAnimatedReplaceCell (animatedReplaceCell: CellType) {
        let currentCell = animatedReplaceCell.getCurrentCell();
        let replaceCell = animatedReplaceCell.getReplaceCell();
        let currentComponent, replaceComponent;

        if (DataCell.isDataCell(currentCell)) {
            currentComponent = this._renderAnimatedDataCell(animatedReplaceCell.getCurrentAnimatedValue(),
                                                            new AnimatedDataCell(true, currentCell));

        } else if (AnimatedDataCell.isAnimatedDataCell(currentCell)) {
            currentComponent = this._renderAnimatedDataCell(animatedReplaceCell.getCurrentAnimatedValue(), currentCell);

        } else if (ExpandCell.isExpandCell(currentCell)) {
            currentComponent = this._renderAnimatedExpandCell(animatedReplaceCell.getCurrentAnimatedValue(),
                                                                new AnimatedExpandCell(true, currentCell));

        } else if (AnimatedExpandCell.isAnimatedExpandCell(currentCell)) {
            currentComponent = this._renderAnimatedExpandCell(animatedReplaceCell.getCurrentAnimatedValue(), currentCell);

        } else {
            throw new Error('error current cell type');
        }

        if (DataCell.isDataCell(replaceCell)) {
            replaceComponent = (
                <View style = {styles.mask}>
                    {this._renderAnimatedDataCell(animatedReplaceCell.getReplaceAnimatedValue(),
                                                    new AnimatedDataCell(false, replaceCell))}
                </View>
            );

        } else if (AnimatedDataCell.isAnimatedDataCell(replaceCell)) {
            replaceComponent = (
                <View style = {styles.mask}>
                    {this._renderAnimatedDataCell(animatedReplaceCell.getReplaceAnimatedValue(), replaceCell)}
                </View>
            );

        } else if (ExpandCell.isExpandCell(replaceCell)) {
            replaceComponent = (
                <View style = {styles.mask}>
                    {this._renderAnimatedExpandCell(animatedReplaceCell.getReplaceAnimatedValue(),
                                                    new AnimatedExpandCell(false, replaceCell))}
                </View>
            );

        } else if (AnimatedExpandCell.isAnimatedExpandCell(replaceCell)) {
            replaceComponent = (
                <View style = {styles.mask}>
                    {this._renderAnimatedExpandCell(animatedReplaceCell.getReplaceAnimatedValue(), replaceCell)}
                </View>
            );

        } else {
            throw new Error('error current cell type');
        }

        return (
            <View style = {styles.cell}>
                {currentComponent}
                {replaceComponent}
            </View>
        );
    }

    _drawCell (dataCell: CellType, columnIndex: number): ReactClass<any> {
        if (ExpandCell.isExpandCell(dataCell)) {
            return this._renderExpandCell(dataCell);

        } else if (EmptyCell.isEmptyCell(dataCell)) {
            return this._renderEmptyCell();

        } else if (DataCell.isDataCell(dataCell)) {
            return this._renderDataCell(dataCell);

        } else if (AnimatedDataCell.isAnimatedDataCell(dataCell)) {
            return this._renderAnimatedDataCell(dataCell.getAnimatedValue(), dataCell);

        } else if (AnimatedExpandCell.isAnimatedExpandCell(dataCell)) {
            return this._renderAnimatedExpandCell(dataCell.getAnimatedValue(), dataCell);

        } else if (AnimatedReplaceCell.isAnimatedReplaceCell(dataCell)) {
            return this._renderAnimatedReplaceCell(dataCell);

        } else {
            throw new Error('unknown cell type');
        }
    }

    _drawRow (dataRow: Array<CellType>, rowIndex: number): ReactClass<any> {
        let cellList = [];

        dataRow.forEach((dataCell) => {
            let cell = this._drawCell(dataCell);
            cellList.push(cell);
        });

        return (
            <View key = {`row_${rowIndex}`} style = {styles.row}>
                {cellList}
            </View>
        );
    }

    /*
        渲染所有的row。
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
            <Animated.View style = {{
                opacity: this._tableOpacityValue
            }}>
                {this._drawTable()}
            </Animated.View>
        );
    }

    _hideTable (next: () => void) {
        Animated.timing(this._tableOpacityValue, {
            toValue: 0,
            duration: 250
        }).start(next);
    }

    _showTable (next: () => void) {
        Animated.timing(this._tableOpacityValue, {
            toValue: 1,
            duration: 250
        }).start(next);
    }
}

let styles = StyleSheet.create({
    row: {
        flexDirection: 'row'
    },
    cell: {
        flex: 1
    },
    mask: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0
    }
});

export type CellSelectorType = CellSelector;
export {
    CellSelector
};
