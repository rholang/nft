import * as R from "ramda";
import {
    DeployArgs,
    DeployEff,
    ExploreDeployArgs,
    ExploreDeployEff,
    RNodeEff,
    Status,
    NodeUrls,
    AppProposeEff
} from "./types";
import { rhoExprToJson } from "./rho-json";
import { RevAccount, RevAddress, createRevAccount } from "./rev-address";
import { ethereumAddress } from "./eth/eth-wrapper";
import { makeRNodeWeb } from "./rnode-web";

const exploreDeploy = ({ rnodeHttp, node }: ExploreDeployEff) =>
    async function ({ code }: ExploreDeployArgs): Promise<Status> {
        // console.log('node')
        // console.log(node)
        const {
            expr: [e]
        } = await rnodeHttp(node.httpUrl, "explore-deploy", code);
        console.log(e);
        const message = rhoExprToJson(e);
        // console.log(dataBal);
        const dataError = (e && e.ExprString && e.ExprString.data) || "";
        return { success: "true", message };
    };

const deploy =
    (effects: DeployEff) =>
    async ({ code, account, phloLimit }: DeployArgs): Promise<Status> => {
        const { node, sendDeploy, getDataForDeploy, propose } = effects;
        // console.log(account)
        const phloLimitNum = R.isNil(phloLimit) ? phloLimit : parseInt(phloLimit);
        const { signature } = await sendDeploy(node, account, code, phloLimitNum);
        const pData = await propose(node);
        const updateProgress = () => true;

        // Try to get result from next proposed block

        const { data, cost } = await getDataForDeploy(node, signature, () => true);
        // Extract data from response object
        const args = data ? rhoExprToJson(data.expr) : void 0;

        const [sArgs, message]: [boolean, string] = R.isNil(args)
            ? [false, "deploy found in the block but data is not sent on `rho:rchain:deployId` channel"]
            : [true, R.is(Array, args) ? args : args];

        const success = pData ? sArgs.toString() : sArgs.toString() + pData;
        return { success, message };
    };

export const getMetamaskAccount = async () => {
    const ethAddr = await ethereumAddress();
    const revAddress = createRevAccount(ethAddr) as RevAddress;
    const revAccountAddress = { ethAddr, ...revAddress };
    const revAccountName = { name: "revWallet" };
    const revAccount: RevAccount = { ...revAccountAddress, ...revAccountName };
    return revAccount;
};

export const createRnodeService = (node: NodeUrls): RNodeEff => {
    const rnodeWeb = makeRNodeWeb({ now: Date.now });

    const { rnodeHttp, sendDeploy, getDataForDeploy, propose } = rnodeWeb;

    // App actions to process communication with RNode
    return {
        exploreDeploy: exploreDeploy({ rnodeHttp, node }),
        deploy: deploy({ node, sendDeploy, getDataForDeploy, propose })
    };
};
