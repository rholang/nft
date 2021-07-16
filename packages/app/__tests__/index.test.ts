import { Effects as Fx, checkBalance, master, Status } from "@rholang/sdk";
import "isomorphic-fetch";
import { writeEnv } from "utils/env";

describe(`ExploreDeploy`, () => {
  it("test exploratory deploy on testnet", async () => {
    const fn = jest.fn();

    Fx.exploreDeployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.exploreDeployFx({
      client: "rnode",
      code: checkBalance({
        account: "1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ",
      }),
    });

    expect(fn).toBeCalledTimes(1);
  });
});

describe(`Deploy NFT contract`, () => {
  it("test deploy on testnet", async () => {
    const fn = jest.fn();

    Fx.deployFx.doneData.watch((result: Status) => {
      if (result) {
        const uri = result.message
          ? [...result.message.matchAll(/URI.*,.*(rho:id.*)/g)]
          : null;
        if (uri[0][1]) {
          writeEnv("NEXT_ENTRYCH1", uri[0][1].toString());
        }
      }
      console.log(result);

      fn(result);
    });

    await Fx.deployFx({
      client: "rnode",
      code: master({ version: "6", depth: "3", depthcontract: "2", n: "1" }),
      phloLimit: "1000000000",
    });

    expect(fn).toBeCalledTimes(1);
  }, 1000000);
});
