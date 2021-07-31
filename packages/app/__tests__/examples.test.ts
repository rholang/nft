import { Effects as Fx, compose, Status } from "@rholang/sdk";
import "isomorphic-fetch";

describe(`Examples`, () => {
  it("ExploreDeploy", async () => {
    const fn = jest.fn();

    Fx.exploreDeployFx.doneData.watch((result) => {
      console.table(result);
      fn(result);
    });

    await Fx.exploreDeployFx({
      client: "rnode",
      code: compose({}),
    });

    expect(fn).toBeCalledTimes(1);
  });

  it("Deploy", async () => {
    const fn = jest.fn();

    Fx.deployFx.doneData.watch((result: Status) => {
      console.log(JSON.stringify(result, null, 4));
      fn(result);
    });

    await Fx.deployFx({
      client: "rnode",
      code: compose({}),
      phloLimit: "1000000000",
    });

    expect(fn).toBeCalledTimes(1);
  }, 1000000);
});
