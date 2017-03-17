/* @flow */

import type {
    ActionType
} from './Action';

import type {
    RenderTableType
} from './RenderTable';

import type {
    DataTableType
} from './DataTable';

import {
    ACTION_TYPE,
    Action
} from './Action';

class ActionManager {
    _actionList: Array<ActionType>;
    _renderTable: RenderTableType;
    _dataTable: DataTableType;

    constructor (renderTable: RenderTableType, dataTable: DataTableType) {
        this._actionList = [];
        this._renderTable = renderTable;
        this._dataTable = dataTable;
    }

    dispatchUserAction (userAction: ActionType, actionListGenerateFinish: () => void) {
        switch (userAction.getType()) {
            case ACTION_TYPE.USER_EXPAND_TABLE:
                this._generateExpandActionList();
                actionListGenerateFinish();
                break;
            case ACTION_TYPE.USER_PACKUP_TABLE:
                this._generatePackupActionList();
                actionListGenerateFinish();
                break;
            default:
                throw new Error('unknown action type to dispatch');
        }
    }

    // 用户点击展开按钮后生成对应的actionList
    _generateExpandActionList () {
        let replaceAction = this._generateExpandCellReplaceAction();
        this._actionList.push(replaceAction);

        let renderTable = this._renderTable.getTable();
        let renderTableRowCount = renderTable.length;
        let dataTable = this._dataTable.getTable();
        let dataTableRowCount = dataTable.length;
        let tableWidth = this._dataTable.getTableWidth();

        let isLastRow = (currentRowCount: number, totalRowCount: number) => currentRowCount === totalRowCount - 1;
        let getLastItem = array => array[array.length - 1];

        while (renderTableRowCount < dataTableRowCount) {
            let currentRowIndex = renderTableRowCount;
            this._actionList.push(Action.generateAppendRowAction());

            if (isLastRow(renderTableRowCount, dataTableRowCount)) {
                let lastDataRow = getLastItem(dataTable);
                let lastDataRowLongEnough = lastDataRow.length === tableWidth;

                if (lastDataRowLongEnough) {
                    for (let i = 0 ; i < tableWidth ; i++) {
                        this._actionList.push(Action.generateShowAction({
                            rowIndex: currentRowIndex,
                            columnIndex: i
                        }));
                    }
                    this._actionList.push(Action.generateAppendRowAction());
                    this._actionList.push(Action.generateShowAction({
                        rowIndex: currentRowIndex + 1,
                        columnIndex: 0
                    }))
                } else {
                    for (let i = 0 ; i < lastDataRow.length ; i++) {
                        this._actionList.push(Action.generateShowAction({
                            rowIndex: currentRowIndex,
                            columnIndex: i
                        }));
                    }
                }
            } else {
                for (let i = 0 ; i < tableWidth ; i++) {
                    this._actionList.push(Action.generateShowAction({
                        rowIndex: currentRowIndex,
                        columnIndex: i
                    }));
                }
            }

            renderTableRowCount++;
        }
    }

    // 用户点击收起按钮后生成对应的actionList
    _generatePackupActionList () {

    }

    // 使用者更新数据后生成对应的actionList
    _generateResetDataActionList () {

    }

    // 组件被unmount时生成对应的actionList，直接清空actionList即可。
    _generateUnmountActionList () {
        this._actionList = [];
    }

    _generateExpandCellReplaceAction () {
        let {
            rowIndex,
            columnIndex
        } = this._renderTable.getExpandCellTwoDimCoord();

        let replaceAction = Action.generateReplaceAction({
            rowIndex,
            columnIndex
        });

        return replaceAction;
    }

    // 返回actionList中的第一个action，并且从actionList中删除该action。
    getAction (): ActionType {
        if (this._actionList.length === 0) {
            return null;
        }

        return this._actionList.shift();
    }
}

export type ActionManagerType = ActionManager;
export {
    ActionManager
};
