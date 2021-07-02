import { Event as E } from 'connectors/rnode-client';
import Button from '../Button';

const ConnectWalletButton = (): JSX.Element => {
  const connectWallet = async () => {
    //await login();
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

    E.exploreDeploy({ client: 'nextjs', code: code });
  };

  return <Button onClick={connectWallet}>Connect Wallet</Button>;
};

export default ConnectWalletButton;
