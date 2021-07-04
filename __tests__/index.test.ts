import { Effects as Fx } from 'connectors/rnode-client';
import 'smart-contract/nft/app/master';

import 'isomorphic-fetch';

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

    Fx.exploreDeployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.exploreDeployFx({ client: 'rnode', code: checkBalance });

    expect(fn).toBeCalledTimes(1);
  });
});

describe(`Deploy`, () => {
  it('test deploy on testnet', async () => {
    const fn = jest.fn();
    const sampleInsertToRegistry = `new return(\`rho:rchain:deployId\`),
    insertArbitrary(\`rho:registry:insertArbitrary\`)
  in {
    new uriCh, valueCh in {
      insertArbitrary!("My value", *uriCh) |
      for (@uri <- uriCh) {
        return!(("URI", uri))
      }
    }
  }`;
    Fx.deployFx.doneData.watch((result) => {
      console.log(result);
      fn(result);
    });

    await Fx.deployFx({
      client: 'rnode',
      code: sampleInsertToRegistry,
      phloLimit: '500000',
    });

    expect(fn).toBeCalledTimes(1);
  });
});
