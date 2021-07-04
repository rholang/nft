import { Event as E, Store as S, Effects as Fx } from 'connectors/rnode-client';
import { createEffect, attach } from 'effector';
import 'isomorphic-fetch';
//import { store, event } from 'connectors/test';
describe(`ExploreDeploy`, () => {
  it('test exploratory deploy on testnet', async () => {
    const fn = jest.fn();
    const checkBalance = `
    new return, rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh in {
      rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
      for (@(_, RevVault) <- RevVaultCh) {
        @RevVault!("findOrCreate", "1111yNahhR8CYJ7ijaJsyDU4zzZ1CrJgdLZtK4fve7zifpDK3crzZ", *vaultCh) |
        for (@maybeVault <- vaultCh) {
          match maybeVault {
            (true, vault) => @vault!("balance", *return)
            (false, err)  => return!(err)
          }
        }
      }
    }
  `;

    /*S.$rnodeStore.watch((state) => {
      //console.log(state.status);
      fn();
    });*/

    Fx.exploreDeployFx.doneData.watch((state) => {
      console.log(state);
      fn(state);
    });

    /*Fx.exploreDeployFx.doneData.watch((e) => {
      fn(e);
    });*/

    E.exploreDeploy({ client: 'rnode', code: checkBalance });

    expect(fn).toBeCalledTimes(1);
  });
});

describe(`Deploy`, () => {
  it('test deploy on testnet', () => {
    const sampleInsertToRegistry = `
    new return(\`rho:rchain:deployId\`),
      insertArbitrary(\`rho:registry:insertArbitrary\`)
      in {
        new uriCh, valueCh in {
          insertArbitrary!("My value", *uriCh) |
          for (@uri <- uriCh) {
            return!(("URI", uri))
          }
        }
      }`;

    E.deploy({
      client: 'nextjs',
      code: sampleInsertToRegistry,
      phloLimit: '500000',
    });
  });
});
