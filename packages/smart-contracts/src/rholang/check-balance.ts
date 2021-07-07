// Rholang code to check REVs balance
// - intended for use with RNode exploratory deploy
export const checkBalance_rho = (addr: string) => `
  new return, stdout(\`rho:io:stdout\`), rl(\`rho:registry:lookup\`), RevVaultCh, vaultCh in {
    rl!(\`rho:rchain:revVault\`, *RevVaultCh) |
    stdout!("test11") |
    for (@(_, RevVault) <- RevVaultCh) {
      @RevVault!("findOrCreate", "${addr}", *vaultCh) |
      for (@maybeVault <- vaultCh) {
        match maybeVault {
          (true, vault) => @vault!("balance", *return)
          (false, err)  => return!(err)
        }
      }
    }
  }
`
