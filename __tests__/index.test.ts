import { Event as E } from 'connectors/rnode-client';

describe(`ExploreDeploy`, () => {
  it('test exploratory deploy on testnet', () => {
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

    E.exploreDeploy({ client: 'nextjs', code: checkBalance });
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
