export declare const test = 5;
export declare const op_create_purses: ({}: {}) => string;
export declare const op_deploy: ({}: {}) => string;
export declare const op_deploy_box: ({}: {}) => string;
export declare const op_lock: ({}: {}) => string;
export declare const op_purchase: ({}: {}) => string;
export declare const op_send_purse: ({}: {}) => string;
export declare const op_test: ({ composeEntryUri }: {
    composeEntryUri: any;
}) => string;
export declare const op_update_purse_data: ({}: {}) => string;
export declare const op_update_purse_price: ({}: {}) => string;
export declare const op_withdraw: ({}: {}) => string;
export declare const read_all_purses: ({}: {}) => string;
export declare const read_box: ({}: {}) => string;
export declare const read_config: ({}: {}) => string;
export declare const read_purses: ({}: {}) => string;
export declare const read_purses_data: ({}: {}) => string;
export declare const master: ({ n, version, depthcontract, depth }: {
    n: any;
    version: any;
    depthcontract: any;
    depth: any;
}) => string;
export declare const checkBalance: ({ account }: {
    account: any;
}) => string;
export declare const insertRegistry: ({}: {}) => string;
export declare const compose: ({}: {}) => string;
export declare const factory: ({ n, version, depthcontract }: {
    n: any;
    version: any;
    depthcontract: any;
}) => string;
export declare const store: ({ depth }: {
    depth: any;
}) => string;
