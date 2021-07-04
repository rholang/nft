export const updatePurseDate = `
new basket,
  returnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (boxCh <<- @(*deployerId, "rchain-token-box", "MASTER_REGISTRY_URI", "BOX_ID")) {
    boxCh!(("UPDATE_PURSE_DATA", { "contractId": "CONTRACT_ID", "data": "UPDATE_PURSE_DATAA", "purseId": "PURSE_ID" }, *returnCh)) |
    for (@r <- returnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          basket!({ "status": "completed" }) |
          stdout!("completed, data updated")
        }
      }
    }
  }
}`;
