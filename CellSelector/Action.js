/* @flow */

const ACTION_TYPE = {
    USER_EXPAND_TABLE: 'user_expand_table', // 用户展开了表格
    USER_PACKUP_TABLE: 'user_packup_table', // 用户收起了表格
    REPLACE_CELL: 'replace_cell', // 生成替换单元格
    REPLACE_CELL_FINISH: 'replace_cell_finish', // 将单元格替换成replaceCell。
    SHOW_CELL: 'show_cell', // 展示单元格
    HIDE_CELL: 'hide_cell', // 隐藏单元格
    APPEND_ROW: 'append_row', // 添加一行
    ANIMATE_REPLACE_CELL: 'animate_replace_cell', // 使用动画替换单元格
    PRE_REMOVE_ROW: 'pre_remove_row', // 将行内元素变为动画元素，准备隐藏后删除
    REMOVE_ROW: 'remove_row', // 删除行
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

    static generateAnimateReplaceAction (payload: any): Action {
        return new Action(ACTION_TYPE.ANIMATE_REPLACE_CELL, payload);
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

    static generatePreRemoveRowAction (payload: any): Action {
        return new Action(ACTION_TYPE.PRE_REMOVE_ROW, payload);
    }

    static generateRemoveRowAction (): Action {
        return new Action(ACTION_TYPE.REMOVE_ROW);
    }

     static generateReplaceFinishAction (payload: any): Action {
         return new Action(ACTION_TYPE.REPLACE_CELL_FINISH, payload);
     }
}

export type ActionType = Action;
export {
    Action,
    ACTION_TYPE
};
