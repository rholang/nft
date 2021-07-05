export const createPurses = `
  new basket,
    returnCh,
    boxCh,
    stdout(\`rho:io:stdout\`),
    deployerId(\`rho:rchain:deployerId\`),
    registryLookup(\`rho:registry:lookup\`)
  in {

    for (superKey <<- @(*deployerId, "rchain-token-contract", "MASTER_REGISTRY_URI", "CONTRACT_ID")) {
      superKey!((
        "CREATE_PURSES",
        {
          // example
          // "purses": { "0": { "box": "abc", "type": "gold", "quantity": 3, "data": Nil }}
          "purses": CREATE_PURSESS,
          // example
          // "data": { "0": "this bag is mine" }
          "data": CREATE_PURSESS_DATA,
        },
        *returnCh
      )) |
      for (@r <- returnCh) {
        match r {
          String => {
            basket!({ "status": "failed", "message": r }) |
            stdout!(("failed", r))
          }
          _ => {
            stdout!("completed, purses created and saved to box") |
            basket!({ "status": "completed" })
          }
        }
      }
    }
  }`;
