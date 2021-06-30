import { Event as E } from 'connectors/rnode';

describe(`ExploreDeploy`, () => {
  it('test explore deploy on testnet', () => {
    const code = `
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

    E.exploreDeploy({ code: code });
  });
});
