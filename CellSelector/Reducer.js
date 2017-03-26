/* @flow */

import type {
    ActionManagerType
} from './ActionManager';

import type {
    RenderTableType
} from './RenderTable';

import type {
    ActionType
} from './Action';

import {
    Action,
    ACTION_TYPE
} from './Action';

type ReducerType = Reducer;

class Reducer {
    _actionManager: ActionManagerType;
    _renderTable: RenderTableType;
    _viewTable: any;
    _canReduce: bool;
    _reduceFinish: () => void;

    constructor (actionManager: ActionManagerType, renderTable: RenderTableType, viewTable, reduceFinish: () => void) {
        this._actionManager = actionManager;
        this._renderTable = renderTable;
        this._viewTable = viewTable;
        this._reduceFinish = reduceFinish;
        this._canReduce = true;
    }

    startReduceAction () {
        let nextAction = this._actionManager.getAction();

        if (nextAction === null || !this._canReduce) {
            this._reduceFinish();
            return;
        }

        if (Array.isArray(nextAction)) {
            Promise.all(nextAction.map(action => this._reduce(action))).then(this.startReduceAction.bind(this));
        } else {
            this._reduce(nextAction).then(this.startReduceAction.bind(this));
        }
    }

    stopReduce () {
        this._canReduce = false;
    }

    _reduce (nextAction: Action): Promise<any> {
        let payload;

        switch (nextAction.getType()) {
            case ACTION_TYPE.APPEND_ROW:
                return new Promise(resolve => {
                    this._renderTable.appendRowWithAnimatedCell(resolve);
                });
            case ACTION_TYPE.SHOW_CELL:
            case ACTION_TYPE.HIDE_CELL:
            case ACTION_TYPE.ANIMATE_REPLACE_CELL:
                return new Promise(resolve => {
                    payload = nextAction.getPayload();
                    this._renderTable.animateCell(payload.rowIndex, payload.columnIndex, resolve);
                })
            case ACTION_TYPE.REPLACE_CELL:
                return new Promise(resolve => {
                    payload = nextAction.getPayload();
                    this._renderTable.replaceCell(payload.rowIndex, payload.columnIndex, resolve);
                });
            case ACTION_TYPE.PRE_REMOVE_ROW:
                return new Promise(resolve => {
                    payload = nextAction.getPayload();
                    this._renderTable.preRemoveRow(payload.rowIndex, resolve);
                });
            case ACTION_TYPE.REMOVE_ROW:
                return new Promise(resolve => {
                    this._renderTable.removeRow(resolve);
                });
            case ACTION_TYPE.REPLACE_CELL_FINISH:
                return new Promise(resolve => {
                    payload = nextAction.getPayload();
                    this._renderTable.replaceCellFinish(payload.rowIndex, payload.columnIndex, resolve);
                });
            case ACTION_TYPE.REFRESH_RENDER_TABLE:
                return new Promise(resolve => {
                    this._renderTable.refresh(resolve);
                });
            case ACTION_TYPE.HIDE_TABLE:
                return new Promise(resolve => {
                    this._viewTable.hideTable(resolve);
                });
            case ACTION_TYPE.SHOW_TABLE:
                return new Promise(resolve => {
                    this._viewTable.showTable(resolve);
                });
            default:
                throw new Error('unknown action type');
        }
    }
}

export type ReducerType = Reducer;
export {
    Reducer
};
