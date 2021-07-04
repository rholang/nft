export const readConfig = `
new return, entryCh, readCh, lookup(\`rho:registry:lookup\`) in {
  lookup!(\`rho:id:MASTER_REGISTRY_URI\`, *entryCh) |
  for(entry <- entryCh) {
    new x in {
      entry!(("PUBLIC_READ_CONFIG", "CONTRACT_ID", *x)) |
      for (y <- x) {
        return!(*y)
      }
    }
  }
}`;
