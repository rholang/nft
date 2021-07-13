import { Effects as Fx, checkBalance, insertRegistry } from "@rholang/sdk";

import "isomorphic-fetch";

describe(`ExploreDeploy`, () => {
  it("test exploratory deploy on testnet", async () => {
    const fn = jest.fn();

    Fx.exploreDeployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.exploreDeployFx({
      client: "rnode",
      code: checkBalance(
        "1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ"
      ),
    });

    expect(fn).toBeCalledTimes(1);
  });
});

describe(`Deploy`, () => {
  it("test deploy on testnet", async () => {
    const fn = jest.fn();

    Fx.deployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.deployFx({
      client: "rnode",
      code: insertRegistry(),
      phloLimit: "500000",
    });

    expect(fn).toBeCalledTimes(1);
  }, 20000);
});
