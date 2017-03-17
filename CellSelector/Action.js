/* @flow */

const ACTION_TYPE = {
    USER_EXPAND_TABLE: 'user_expand_table', // 用户展开了表格
    USER_PACKUP_TABLE: 'user_packup_table', // 用户收起了表格
    REPLACE_CELL: 'replace_cell', // 替换单元格
    SHOW_CELL: 'show_cell', // 展示单元格
    HIDE_CELL: 'hide_cell', // 隐藏单元格
    APPEND_ROW: 'append_row', // 添加一行
};

class Action {
    _type: string;
    _payload: any;

    constructor (type: string, payload: any) {
        this._type = type;
        this._payload = payload;
    }

    getType (): string {
        return this._type;
    }

    getPayload (): any {
        return this._payload;
    }

    static generateUserExpandTableAction (payload: any): Action {
        return new Action(ACTION_TYPE.USER_EXPAND_TABLE, payload);
    }

    static generateUserPackupTableAction (payload: any): Action {
        return new Action(ACTION_TYPE.USER_PACKUP_TABLE, payload);
    }

    static generateReplaceAction (payload: any): Action {
        return new Action(ACTION_TYPE.REPLACE_CELL, payload);
    }

    static generateShowAction (payload: any): Action {
        return new Action(ACTION_TYPE.SHOW_CELL, payload);
    }

    static generateHideAction (payload: any): Action {
        return new Action(ACTION_TYPE.HIDE_CELL, payload);
    }

    static generateAppendRowAction (): Action {
        return new Action(ACTION_TYPE.APPEND_ROW);
    }
}

export type ActionType = Action;
export {
    Action,
    ACTION_TYPE
};
