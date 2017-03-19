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

    constructor (actionManager: ActionManagerType, renderTable: RenderTableType) {
        this._actionManager = actionManager;
        this._renderTable = renderTable;
    }

    startReduceAction () {
        let nextAction = this._actionManager.getAction();

        if (nextAction === null) {
            return;
        }

        let payload;

        switch (nextAction.getType()) {
            case ACTION_TYPE.APPEND_ROW:
                this._renderTable.appendRowWithAnimatedCell(this.startReduceAction.bind(this));
                break;
            case ACTION_TYPE.SHOW_CELL:
            case ACTION_TYPE.HIDE_CELL:
            case ACTION_TYPE.ANIMATE_REPLACE_CELL:
                payload = nextAction.getPayload();
                this._renderTable.animateCell(payload.rowIndex, payload.columnIndex, this.startReduceAction.bind(this));
                break;
            case ACTION_TYPE.REPLACE_CELL:
                payload = nextAction.getPayload();
                this._renderTable.replaceCell(payload.rowIndex, payload.columnIndex, this.startReduceAction.bind(this));
                break;
            case ACTION_TYPE.PRE_REMOVE_ROW:
                this._renderTable.preRemoveRow(this.startReduceAction.bind(this));
                break;
            case ACTION_TYPE.REMOVE_ROW:
                this._renderTable.removeRow(this.startReduceAction.bind(this));
                break;
            case ACTION_TYPE.REPLACE_CELL_FINISH:
                payload = nextAction.getPayload();
                this._renderTable.replaceCellFinish(payload.rowIndex, payload.columnIndex, this.startReduceAction.bind(this));
                break;
            default:
                throw new Error('unknown action type');
        }
    }
}

export type ReducerType = Reducer;
export {
    Reducer
};
