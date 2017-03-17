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
                payload = nextAction.getPayload();
                this._renderTable.animateCell(payload.rowIndex, payload.columnIndex, this.startReduceAction.bind(this));
                break;
            case ACTION_TYPE.HIDE_CELL:
                payload = nextAction.getPayload();
                this._renderTable.animateCell(payload.rowIndex, payload.columnIndex, this.startReduceAction.bind(this));
                break;
            case ACTION_TYPE.REPLACE_CELL:
                // this._renderTable.replaceCell(startReduceAction);
                this.startReduceAction();
                break;
            default:
                throw new Error('unknow action type');
        }
    }
}

export type ReducerType = Reducer;
export {
    Reducer
};
