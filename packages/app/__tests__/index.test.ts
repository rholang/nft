import {
  Effects as Fx,
  checkBalance,
  master,
  compose,
  Status,
  op_test,
} from "@rholang/sdk";

import "isomorphic-fetch";
import { writeUriEnv, readKeyEnv } from "utils/env";

/* explore deploy -> return channel, deploy -> return(`rho:rchain:deployId`) channel */
describe(`ExploreDeploy`, () => {
  it("nft explore-deploy", async () => {
    const fn = jest.fn();

    Fx.exploreDeployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.exploreDeployFx({
      client: "rnode",
      code: checkBalance({
        account: "11113y7AfYj7hShN49oAHHd3KiWxZRsodesdBi8QwSrPR5Veyh77S",
      }),
    });

    expect(fn).toBeCalledTimes(1);
  });

  it("test explore-deploy", async () => {
    const fn = jest.fn();

    Fx.exploreDeployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.exploreDeployFx({
      client: "rnode",
      code: op_test({ composeEntryUri: readKeyEnv("NEXT_ENTRY_COMPOSE") }),
    });

    expect(fn).toBeCalledTimes(1);
  });
});

describe(`Deploy`, () => {
  it("nft deploy", async () => {
    const fn = jest.fn();

    Fx.deployFx.doneData.watch((result: Status) => {
      writeUriEnv(result, "NEXT_ENTRY_NFT");
      fn(result);
    });

    await Fx.deployFx({
      client: "rnode",
      code: master({ version: "6", depth: "3", depthcontract: "2", n: "1" }),
      phloLimit: "1000000000",
    });

    expect(fn).toBeCalledTimes(1);
  }, 1000000);

  it("compose deploy", async () => {
    const fn = jest.fn();

    Fx.deployFx.doneData.watch((result: Status) => {
      writeUriEnv(result, "NEXT_ENTRY_COMPOSE");
      fn(result);
    });

    await Fx.deployFx({
      client: "rnode",
      code: compose({}),
      phloLimit: "1000000000",
    });

    expect(fn).toBeCalledTimes(1);
  }, 1000000);

  it("test deploy", async () => {
    const fn = jest.fn();

    Fx.deployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.deployFx({
      client: "rnode",
      code: op_test({ composeEntryUri: readKeyEnv("NEXT_ENTRY_COMPOSE") }),
      phloLimit: "1000000000",
    });

    expect(fn).toBeCalledTimes(1);
  }, 1000000);
});
