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

import {
    DataCell,
    AnimatedDataCell,
    ExpandCell,
    AnimatedExpandCell,
    EmptyCell
} from './Cell';

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
                this._generateUserExpandActionList();
                actionListGenerateFinish();
                break;
            case ACTION_TYPE.USER_PACKUP_TABLE:
                this._generateUserPackupActionList();
                actionListGenerateFinish();
                break;
            case ACTION_TYPE.USER_REPLACE_TABLE:
                this._generateUserReplaceActionList();
                actionListGenerateFinish();
                break;
            default:
                throw new Error('unknown action type to dispatch');
        }
    }

    _generateUserExpandActionList () {
        // 展开操作，currentRenderTableRowCount < targetRenderTableRowCount。
        let currentRenderTable = this._renderTable.getTable();
        let targetRenderTable = this._renderTable.generateRenderTable(true);
        let tableWidth = this._dataTable.getTableWidth();

        let showActionList = [];

        for (let i = 0 ; i < targetRenderTable.length ; i++) {
            let targetRenderRow = targetRenderTable[i];
            let currentRenderRow = currentRenderTable[i]; // 有可能为空。

            if (currentRenderRow && targetRenderRow) {
                for (let j = 0 ; j < tableWidth ; j++) {
                    let currentRenderCell = currentRenderRow[j];
                    let targetRenderCell = targetRenderRow[j];

                    if (currentRenderCell.getType() !== targetRenderCell.getType()) {
                        this._generateReplaceAction(this._actionList, i, j);
                    }
                }
            } else {
                this._actionList.push(Action.generateAppendRowAction());

                for (let j = 0 ; j < tableWidth ; j++) {
                    let targetRenderCell = targetRenderRow[j];

                    if (!EmptyCell.isEmptyCell(targetRenderCell)) {
                        showActionList.push(Action.generateShowAction({
                            rowIndex: i,
                            columnIndex: j
                        }));
                    }
                }
            }
        }

        this._actionList.push(showActionList);
        this._actionList.push(Action.generateRefreshRenderTableAction());
    }

    _generateUserPackupActionList () {
        let currentRenderTable = this._renderTable.getTable();
        let targetRenderTable = this._renderTable.generateRenderTable(false);
        let tableWidth = this._dataTable.getTableWidth();
        let preRemoveRowActionList = [];
        let removeRowActionList = [];
        let actionHideList = [];
        let replaceActionList = [];

        for (let i = currentRenderTable.length - 1 ; i > -1 ; i--) {
            let targetRenderRow = targetRenderTable[i];
            let currentRenderRow = currentRenderTable[i];

            if (currentRenderRow && targetRenderRow) {
                for (let j = tableWidth - 1 ; j > -1 ; j--) {
                    let currentRenderCell = currentRenderRow[j];
                    let targetRenderCell = targetRenderRow[j];

                    if (currentRenderCell.getType() !== targetRenderCell.getType()) {
                        this._generateReplaceAction(replaceActionList, i, j);
                    }
                }
            } else {
                preRemoveRowActionList.push(Action.generatePreRemoveRowAction({
                    rowIndex: i
                }));

                for (let j = tableWidth - 1 ; j > -1 ; j--) {
                    let renderCell = currentRenderRow[j];

                    if (!EmptyCell.isEmptyCell(renderCell)) {
                        actionHideList.push(Action.generateHideAction({
                            rowIndex: i,
                            columnIndex: j
                        }));
                    }
                }

                removeRowActionList.push(Action.generateRemoveRowAction());
            }
        }

        this._actionList = this._actionList.concat(preRemoveRowActionList);
        this._actionList.push(actionHideList);
        this._actionList = this._actionList.concat(removeRowActionList);
        this._actionList.push(replaceActionList);
        this._actionList.push(Action.generateRefreshRenderTableAction());
    }

    _generateUserReplaceActionList () {
        this._actionList = [];
        this._actionList.push(Action.generateHideTableAction());
        this._actionList.push(Action.generateRefreshRenderTableAction());
        this._actionList.push(Action.generateShowTableAction());
    }

    _generateReplaceAction (actionList: Array<ActionType>, rowIndex: number, columnIndex: number) {
        actionList.push(Action.generateReplaceAction({
            rowIndex,
            columnIndex
        }));
        actionList.push(Action.generateAnimateReplaceAction({
            rowIndex,
            columnIndex
        }));
        actionList.push(Action.generateReplaceFinishAction({
            rowIndex,
            columnIndex
        }));
    }

    // 组件被unmount时生成对应的actionList，直接清空actionList即可。
    _generateUnmountActionList () {
        this._actionList = [];
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
