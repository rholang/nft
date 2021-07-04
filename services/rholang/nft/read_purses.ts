export const readPurses = `
new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:MASTER_REGISTRY_URI\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      entry!(("PUBLIC_READ_PURSES", { "contractId": "CONTRACT_ID", "purseIds": Set(PURSES_IDS) }, *x)) |
      for (y <- x) {
        return!(*y)
      }
    }
  }
}`;
