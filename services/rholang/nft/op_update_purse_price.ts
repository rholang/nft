export const updatePursePrice = `new basket,
  returnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (boxCh <<- @(*deployerId, "rchain-token-box", "MASTER_REGISTRY_URI", "BOX_ID")) {
    boxCh!(("UPDATE_PURSE_PRICE", { "contractId": "CONTRACT_ID", "price": PRICEE, "purseId": "PURSE_ID" }, *returnCh)) |
    for (@r <- returnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          basket!({ "status": "completed" }) |
          stdout!("completed, price updated")
        }
      }
    }
  }
}`;
