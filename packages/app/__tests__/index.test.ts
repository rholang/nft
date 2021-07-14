import { Effects as Fx, checkBalance, insertRegistry } from "@rholang/sdk";
import * as fs from "fs";
import { getEnvPath } from "utils/env";
import "isomorphic-fetch";

describe(`ExploreDeploy2`, () => {
  it("test exploratory deploy on testnet", async () => {
    fs.appendFileSync(getEnvPath(), "NEXT_ENTRYCH1=var");
  });
});

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
  }, 400000);
});
