export const deployBox = `
new basket,
  masterEntryCh,
  registerBoxReturnCh,
  sendReturnCh,
  deletePurseReturnCh,
  boxCh,
  stdout(\`rho:io:stdout\`),
  deployerId(\`rho:rchain:deployerId\`),
  registryLookup(\`rho:registry:lookup\`)
in {

  registryLookup!(\`rho:id:MASTER_REGISTRY_URI\`, *masterEntryCh) |

  for (masterEntry <- masterEntryCh) {
    masterEntry!(("PUBLIC_REGISTER_BOX", { "boxId": "BOX_ID", "publicKey": "PUBLIC_KEY" }, *registerBoxReturnCh)) |
    for (@r <- registerBoxReturnCh) {
      match r {
        String => {
          basket!({ "status": "failed", "message": r }) |
          stdout!(("failed", r))
        }
        (true, box) => {
          @(*deployerId, "rchain-token-box", "MASTER_REGISTRY_URI", "BOX_ID")!(box) |
          basket!({ "status": "completed", "boxId": "BOX_ID" }) |
          stdout!("completed, box registered")
        }
      }
    }
  }
}`;
