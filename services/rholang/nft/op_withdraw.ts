export const withdraw = `
new basket,
  withdrawReturnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  for (boxCh <<- @(*deployerId, "rchain-token-box", "MASTER_REGISTRY_URI", "BOX_ID")) {
    boxCh!(("WITHDRAW", { "contractId": "CONTRACT_ID", "quantity": WITHDRAW_QUANTITY, "toBoxId": "TO_BOX_ID", "purseId": "PURSE_ID", "merge": MERGE }, *withdrawReturnCh)) |
    for (@r <- withdrawReturnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        _ => {
          basket!({ "status": "completed" }) |
          stdout!("completed, withdraw successful")
        }
      }
    }
  }
}`;
