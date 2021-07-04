export const master = (n) => `
  new 
    basket,

    entryCh,
    entryUriCh,

    byteArraySafeToStoreCh,
    iterateOnThmKeysCh,
    createPursesCh,
    makePurseCh,
    calculateFeeCh,
    pursesTreeHashMapCh,
    pursesForSaleTreeHashMapCh,
    initializeOCAPOnBoxCh,

    /*
      vault is the ultimate accessibility unforgeable in
      master contract, every data is stored in channels that
      derives from *vault unforgeable name

      // tree hash map of purses :
      thm <- @(*vault, "purses", "contract03")

      // tree hash map of purses data :
      thm <- @(*vault, "pursesData", "contract03")

      // contract's configs
      config <- @(*vault, "contractConfig", "contract03")

      // box's configs
      config <- @(*vault, "boxConfig", "box01")

      // boxes
      box <- @(*vault, "boxes", "box01")

      // super keys of a given box
      superKeys <- @(*vault, "boxesSuperKeys", "box01")
    */
    vault,

    /*
      boxesThm and contractsThm only store the list
      of existing contracts / boxes, ex:
      boxesThm:
      { "box1": "exists", "mycoolbox": "exists" }

      Then each box is a Map stored at a unique channel
      (see above) and has the following structure:
      {
        [contractId: string]: Set(purseId: string)
      }

      Each contract has its own tree hash map, and
      have the following structure:
      pursesThm:
      {
        "1": { quantity: 2, type: "0", box: "box1", price: Nil},
        "2": { quantity: 12, type: "0", box: "box1", price: 2},
      }
    */
    boxesReadyCh,
    contractsReadyCh,

    TreeHashMap,

    savePurseInBoxCh,
    removePurseInBoxCh,
    getBoxCh,
    getPurseCh,
    getContractPursesThmCh,
    getContractPursesDataThmCh,

    insertArbitrary(\`rho:registry:insertArbitrary\`),
    stdout(\`rho:io:stdout\`),
    revAddress(\`rho:rev:address\`),
    registryLookup(\`rho:registry:lookup\`),
    deployerId(\`rho:rchain:deployerId\`)
  in {

    TREE_HASH_MAP

    // depth 1 = 12 maps in tree hash map
    // depth 2 = 12 * 12 = 144 maps in tree hash map
    // etc...

    TreeHashMap!("init", DEPTH, true, *boxesReadyCh) |
    TreeHashMap!("init", DEPTH, false, *contractsReadyCh) |

    for (@boxesThm <- boxesReadyCh; @contractsThm <- contractsReadyCh) {

      // returns the box if exists
      for (@(boxId, return) <= getBoxCh) {
        new ch1 in {
          TreeHashMap!("get", boxesThm, boxId, *ch1) |
          for (@exists <- ch1) {
            if (exists == "exists") {
              for (@box <<- @(*vault, "boxes", boxId)) {
                @return!(box)
              }
            } else {
              @return!(Nil)
            }
          }
        }
      } |

      // returns the purse if exists AND is associated with box
      for (@(box, contractId, purseId, return) <= getPurseCh) {
        new ch1 in {
          if (box.get(contractId) == Nil) {
            @return!(Nil)
          } else {
            if (box.get(contractId).contains(purseId) == true) {
              getContractPursesThmCh!((contractId, *ch1)) |
              for (@pursesThm <- ch1) {
                TreeHashMap!("get", pursesThm, purseId, return)
              }
            } else {
              @return!(Nil)
            }
          }
        }
      } |

      // returns the tree hash map of the contract's purses if exists
      for (@(contractId, return) <= getContractPursesThmCh) {
        new ch1 in {
          TreeHashMap!("get", contractsThm, contractId, *ch1) |
          for (@exists <- ch1) {
            if (exists == "exists") {
              for (@pursesThm <<- @(*vault, "purses", contractId)) {
                @return!(pursesThm)
              }
            } else {
              @return!(Nil)
            }
          }
        }
      } |

      // returns the tree hash map of the contract's purses data if exists
      for (@(contractId, return) <= getContractPursesDataThmCh) {
        new ch1 in {
          TreeHashMap!("get", contractsThm, contractId, *ch1) |
          for (@exists <- ch1) {
            if (exists == "exists") {
              for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                @return!(pursesDataThm)
              }
            } else {
              @return!(Nil)
            }
          }
        }
      } |
    
      // remove purse in box, if found
      for (@(boxId, contractId, purseId, return) <= removePurseInBoxCh) {
        new ch1 in {
          getBoxCh!((boxId, *ch1)) |
          for (@box <- ch1) {
            if (box == Nil) {
              @return!("error: CRITICAL box not found")
            } else {
              if (box.get(contractId) == Nil) {
                @return!("error: CRITICAL purse not found")
              } else {
                if (box.get(contractId).contains(purseId) == false) {
                  @return!("error: CRITICAL purse not found")
                } else {
                  for (_ <- @(*vault, "boxes", boxId)) {
                    stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purseId ++ " removed from box") |
                    @(*vault, "boxes", boxId)!(box.set(contractId, box.get(contractId).delete(purseId))) |
                    @return!((true, Nil))
                  }
                }
              }
            }
          }
        }
      } |

      // save purse id in box
      for (@(contractId, boxId, purseId, merge, return) <= savePurseInBoxCh) {
        new ch1, ch2, ch3, iterateAndMergePursesCh in {

          getBoxCh!((boxId, *ch1)) |
          getContractPursesThmCh!((contractId, *ch2)) |

          for (@box <- ch1; @pursesThm <- ch2) {
            match (box != Nil, pursesThm != Nil) {
              (true, true) => {
                if (box.get(contractId) == Nil) {
                  for (_ <- @(*vault, "boxes", boxId)) {
                    stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purseId ++ " saved to box") |
                    @(*vault, "boxes", boxId)!(box.set(contractId, Set(purseId))) |
                    @return!((true, Nil))
                  }
                } else {
                  if (box.get(contractId).contains(purseId) == false) {
                    for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
                      match (contractConfig.get("fungible") == true, merge) {
                        (true, true) => {
                          for (@pursesThm <<- @(*vault, "purses", contractId)) {
                            TreeHashMap!("get", pursesThm, purseId, *ch3) |
                            for (@purse <- ch3) {
                              iterateAndMergePursesCh!((box, purse, pursesThm))
                            }
                          }
                        }
                        _ => {
                          for (_ <- @(*vault, "boxes", boxId)) {
                            stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purseId ++ " saved to box") |
                            @(*vault, "boxes", boxId)!(box.set(
                              contractId,
                              box.get(contractId).union(Set(purseId))
                            )) |
                            @return!((true, Nil))
                          }
                        }
                      }
                    }
                  } else {
                    @return!("error: CRITICAL, purse already exists in box")
                  }
                }
              }
            }
          } |
          // if contract is fungible, we may find a
          // purse with same .price and .type property
          // if found, then merge and delete current purse
          for (@(box, purse, pursesThm) <- iterateAndMergePursesCh) {
            new tmpCh, itCh in {
              for (ids <= itCh) {
                match *ids {
                  Set() => {
                    stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purse.get("id") ++ " saved to box") |
                    for (_ <- @(*vault, "boxes", boxId)) {
                      @(*vault, "boxes", boxId)!(box.set(contractId, Set(purseId))) |
                      @return!((true, Nil))
                    }
                  }
                  Set(last) => {
                    new ch4, ch5, ch6, ch7 in {
                      TreeHashMap!("get", pursesThm, last, *ch4) |
                      for (@purse2 <- ch4) {
                        match (purse2.get("type") == purse.get("type"), purse2.get("price") == purse.get("price")) {
                          (true, true) => {
                            TreeHashMap!(
                              "set",
                              pursesThm,
                              last,
                              purse2.set("quantity", purse2.get("quantity") + purse.get("quantity")),
                              *ch5
                            ) |
                            TreeHashMap!(
                              "set",
                              pursesThm,
                              purse.get("id"),
                              Nil,
                              *ch6
                            ) |
                            for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                              TreeHashMap!(
                                "set",
                                pursesDataThm,
                                purse.get("id"),
                                Nil,
                                *ch7
                              )
                            } |
                            for (_ <- ch5; _ <- ch6; _ <- ch7) {
                              stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purse.get("id") ++ " merged into purse " ++ purse2.get("id")) |
                              @return!((true, Nil))
                            }
                          }
                          _ => {
                            stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purse.get("id") ++ " saved to box") |
                            for (_ <- @(*vault, "boxes", boxId)) {
                              @(*vault, "boxes", boxId)!(box.set(
                                contractId,
                                box.get(contractId).union(Set(purse.get("id")))
                              )) |
                              @return!((true, Nil))
                            }
                          }
                        }
                      }

                    }
                  }
                  Set(first ... rest) => {
                    new ch4, ch5, ch6, ch7 in {
                      TreeHashMap!("get", pursesThm, first, *ch4) |
                      for (@purse2 <- ch4) {
                        match (purse2.get("type") == purse.get("type"), purse2.get("price") == purse.get("price")) {
                          (true, true) => {
                            TreeHashMap!(
                              "set",
                              pursesThm,
                              first,
                              purse2.set("quantity", purse2.get("quantity") + purse.get("quantity")),
                              *ch5
                            ) |
                            TreeHashMap!(
                              "set",
                              pursesThm,
                              purse.get("id"),
                              Nil,
                              *ch6
                            ) |
                            for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                              TreeHashMap!(
                                "set",
                                pursesDataThm,
                                purse.get("id"),
                                Nil,
                                *ch7
                              )
                            } |
                            for (_ <- ch5; _ <- ch6; _ <- ch7) {
                              stdout!(contractId ++ "/" ++ boxId ++ " purse " ++ purse.get("id") ++ " merged into purse " ++ purse2.get("id")) |
                              @return!((true, Nil))
                            }
                          }
                          _ => {
                            itCh!(rest)
                          }
                        }
                      }
                    }
                  }
                }
              } |
              itCh!(box.get(contractId))
            }
          }
        }
      } |

      /*
        makePurseCh
        only place where new purses are created:
        PURCHASE, WITHDRAW, and CREATE_PURSES may call this channel

        depending on if .fungible is true or false, it decides
        which id to give to the new purse, then it creates the
        purse and saves to box
      */
      for (@(contractId, properties, data, merge, return) <= makePurseCh) {
        new ch1, ch2, ch3, ch4, idAndQuantityCh in {
          for (@contractConfig <<- @(*vault, "contractConfig", contractId)) {
            if (contractConfig.get("fungible") == true) {
              for (_ <- @(*vault, "contractConfig", contractId)) {
                @(*vault, "contractConfig", contractId)!(contractConfig.set("counter", contractConfig.get("counter") + 1))
              } |
              idAndQuantityCh!({ "id": "${n}" %% { "n": contractConfig.get("counter") }, "quantity": properties.get("quantity") })
            } else {
              for (@pursesThm <<- @(*vault, "purses", contractId)) {
                TreeHashMap!("get", pursesThm, properties.get("id"), *ch1) |
                for (@existingPurse <- ch1) {

                  // check that nft does not exist
                  if (existingPurse == Nil) {
                    if (properties.get("id") == "0") {
                      idAndQuantityCh!({ "id": properties.get("id"), "quantity": properties.get("quantity") })
                    } else {
                      idAndQuantityCh!({ "id": properties.get("id"), "quantity": 1 })
                    }
                  } else {

                    // nft with id: "0" is a special nft from which
                    // anyone can mint a nft that does not exist yet
                    // used by dappy name system for example
                    if (properties.get("id") == "0") {
                      TreeHashMap!("get", pursesThm, properties.get("newId"), *ch2) |
                      for (@purseWithNewId <- ch2) {
                        match (properties.get("newId"), purseWithNewId) {
                          (String, Nil) => {
                            idAndQuantityCh!({ "id": properties.get("newId"), "quantity": 1 })
                          }
                          _ => {
                            @return!("error: no .newId in payload or .newId already exists")
                          }
                        }
                      }
                    } else {
                      @return!("error: purse id already exists")
                    }
                  }
                }
              }
            }
          } |
          for (@idAndQuantity <- idAndQuantityCh) {
            match properties
              .set("id", idAndQuantity.get("id"))
              .set("quantity", idAndQuantity.get("quantity"))
              .delete("newId")
            {
              purse => {
                match (purse, purse.get("id").length() > 0, purse.get("id").length() < 25) {
                  ({
                    "quantity": Int,
                    "type": String,
                    "boxId": String,
                    "id": String,
                    "price": Nil \\/ Int
                  }, true, true) => {
                    for (@pursesDataThm <<- @(*vault, "pursesData", contractId)) {
                      for (@pursesThm <<- @(*vault, "purses", contractId)) {
                        TreeHashMap!("set", pursesThm, purse.get("id"), purse, *ch3) |
                        TreeHashMap!("set", pursesDataThm, purse.get("id"), data, *ch4)
                      }
                    } |

                    for (_ <- ch3; _ <- ch4) {
                      savePurseInBoxCh!((contractId, purse.get("boxId"), purse.get("id"), merge, return))
                    }
                  }
                  _ => {
                    @return!("error: invalid purse, one of the following errors: id length must be between length 1 and 24")
                  }
                }
              }
            }
          }
        }
      } |

      for (@(payload, contractId, return) <= createPursesCh) {
        new itCh, sizeCh, createdPursesesCh, saveKeyAndBagCh in {
          createdPursesesCh!([]) |
          sizeCh!(payload.get("purses").keys().size()) |
          for (@size <- sizeCh) {
            itCh!(payload.get("purses").keys()) |
            for(@set <= itCh) {
              match set {
                Nil => {}
                Set(last) => {
                  new ch1, ch2 in {
                    match payload.get("purses").get(last) {
                      {
                        "quantity": Int,
                        "type": String,
                        "id": String,
                        "price": Nil \\/ Int,
                        "boxId": String
                      } => {
                        getBoxCh!((payload.get("purses").get(last).get("boxId"), *ch1)) |
                        for (@box <- ch1) {
                          if (box == Nil) {
                            @return!("error: some purses may have been created until one failed: box not found " ++ payload.get("purses").get(last).get("boxId"))
                          } else {
                            makePurseCh!((
                              contractId,
                              payload.get("purses").get(last),
                              payload.get("data").get(last),
                              true,
                              *ch2
                            )) |
                            for (@r <- ch2) {
                              match r {
                                String => {
                                  @return!("error: some purses may have been created until one failed " ++ r)
                                }
                                _ => {
                                  @return!((true, Nil))
                                }
                              }
                            }
                          }
                        }
                      }
                      _ => {
                        @return!("error: invalid purse payload, some purses may have been successfuly created")
                      }
                    }
                  }
                }
                Set(first ... rest) => {
                  new ch1, ch2 in {
                    match payload.get("purses").get(first) {
                      {
                        "quantity": Int,
                        "type": String,
                        "id": String,
                        "price": Nil \\/ Int,
                        "boxId": String
                      } => {
                        getBoxCh!((payload.get("purses").get(first).get("boxId"), *ch1)) |
                        for (@box <- ch1) {
                          if (box == Nil) {
                            @return!("error: some purses may have been created until one failed: box not found " ++ payload.get("purses").get(first).get("boxId"))
                          } else {
                            makePurseCh!((
                              contractId,
                              payload.get("purses").get(first),
                              payload.get("data").get(first),
                              true,
                              *ch2
                            )) |
                            for (@r <- ch2) {
                              match r {
                                String => {
                                  @return!("error: some purses may have been created until one failed " ++ r)
                                }
                                _ => {
                                  itCh!(rest)
                                }
                              }
                            }
                          }
                        }
                      }
                      _ => {
                        @return!("error: invalid purse payload, some purses may have been successfuly created")
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } |

      contract iterateOnThmKeysCh(@(ids, thm, return)) = {
        new tmpCh, itCh in {
          for (@(tmpCh, ids) <= itCh) {
            for (tmp <- @tmpCh) {
              match ids {
                Nil => {
                  @return!(*tmp)
                }
                Set(last) => {
                  new ch1 in {
                    TreeHashMap!("get", thm, last, *ch1) |
                    for (@p <- ch1) {
                      @return!(*tmp.set(last, p))
                    }
                  }
                }
                Set(first ... rest) => {
                  new ch1 in {
                    TreeHashMap!("get", thm, first, *ch1) |
                    for (@p <- ch1) {
                      @tmpCh!(*tmp.set(first, p)) |
                      itCh!((tmpCh, rest))
                    }
                  }
                }
              }
            }
          } |
          tmpCh!({}) |
          itCh!((*tmpCh, ids))
        }
      } |

      // ====================================
      // ===== ANY USER / PUBLIC capabilities
      // ====================================

      for (@("PUBLIC_READ_ALL_PURSES", contractId, return) <= entryCh) {
        new ch1 in {
          getContractPursesThmCh!((contractId, *ch1)) |
          for (@pursesThm <- ch1) {
            if (pursesThm == Nil) {
              @return!("error: contract not found")
            } else {
              TreeHashMap!("getAllValues", pursesThm, return)
            }
          }
        }
      } |

      for (@("PUBLIC_READ_BOX", boxId, return) <= entryCh) {
        new ch1 in {
          getBoxCh!((boxId, *ch1)) |
          for (@box <- ch1) {
            if (box == Nil) {
              @return!("error: box not found")
            } else {
              for (@superKeys <<- @(*vault, "boxesSuperKeys", boxId)) {
                for (@config <<- @(*vault, "boxConfig", boxId)) {
                  @return!(config.union({ "superKeys": superKeys, "purses": box, "version": VERSION }))
                }
              }
            }
          }
        }
      } |

      for (@("PUBLIC_READ_PURSES", payload, return) <= entryCh) {
        new ch1 in {
          getContractPursesThmCh!((payload.get("contractId"), *ch1)) |
          for (@pursesThm <- ch1) {
            if (pursesThm == Nil) {
              @return!("error: contract not found")
            } else {
              match payload.get("purseIds").size() < 101 {
                true => {
                  iterateOnThmKeysCh!((payload.get("purseIds"), pursesThm, return))
                }
                _ => {
                  @return!("error: payload.purseIds must be a Set of strings with max size 100")
                }
              }
            }
          }
        }
      } |

      for (@("PUBLIC_READ_PURSES_DATA", payload, return) <= entryCh) {
        new ch1 in {
          getContractPursesDataThmCh!((payload.get("contractId"), *ch1)) |
          for (@pursesDataThm <- ch1) {
            if (pursesDataThm == Nil) {
              @return!("error: contract not found")
            } else {
              match payload.get("purseIds").size() < 101 {
                true => {
                  iterateOnThmKeysCh!((payload.get("purseIds"), pursesDataThm, return))
                }
                _ => {
                  @return!("error: payload.purseIds must be a Set of strings with max size 100")
                }
              }
            }
          }
        }
      } |

      for (@("PUBLIC_READ_CONFIG", contractId, return) <= entryCh) {
        for (@config <<- @(*vault, "contractConfig", contractId)) {
          @return!(config)
        }
      } |

      for (@("PUBLIC_REGISTER_BOX", payload, return) <= entryCh) {
        match (payload.get("boxId"), payload.get("publicKey"), payload.get("boxId").length() > 1, payload.get("boxId").length() < 25) {
          (String, String, true, true) => {
            new ch1, ch2, ch3, ch4, ch5, ch6 in {
              registryLookup!(\`rho:rchain:revVault\`, *ch3) |
              for (@(_, RevVault) <- ch3) {
                revAddress!("fromPublicKey", payload.get("publicKey").hexToBytes(), *ch4) |
                for (@a <- ch4) {
                  @RevVault!("findOrCreate", a, *ch5) |
                  for (@b <- ch5) {
                    match b {
                      (true, vaultFromPublicKey) => {
                        ch6!(true)
                      }
                      _ => {
                        @return!("error: invalid public key, could not get vault")
                      }
                    }
                  }
                }
              } |

              TreeHashMap!("get", boxesThm, payload.get("boxId"), *ch1) |
              for (@existingBox <- ch1; _ <- ch6) {
                if (existingBox == Nil) {
                  new boxCh in {
                    TreeHashMap!("set", boxesThm, payload.get("boxId"), "exists", *ch2) |
                    for (_ <- ch2) {
                      @(*vault, "boxes", payload.get("boxId"))!({}) |
                      @(*vault, "boxesSuperKeys", payload.get("boxId"))!(Set()) |
                      @(*vault, "boxConfig", payload.get("boxId"))!({ "publicKey": payload.get("publicKey") }) |
                      @return!((true, bundle+{*boxCh})) |
                      initializeOCAPOnBoxCh!((*boxCh, payload.get("boxId")))
                    }
                  }
                } else {
                  @return!("error: box already exists")
                }
              }
            }
          }
        }
      } |

      for (@(boxCh, boxId) <= initializeOCAPOnBoxCh) {

        for (@("PUBLIC_REGISTER_CONTRACT", payload, return) <= @boxCh) {
          match payload {
            { "contractId": String, "fungible": Bool, "fee": Nil \\/ (String, Int) } => {
              match (payload.get("contractId").length() > 1, payload.get("contractId").length() < 25) {
                (true, true) => {
                  new ch1, ch2, ch3, ch4, ch5 in {
                    TreeHashMap!("get", contractsThm, payload.get("contractId"), *ch1) |
                    for (@exists <- ch1) {
                      if (exists == Nil) {
                        TreeHashMap!("init", DEPTH_CONTRACT, true, *ch2) |
                        TreeHashMap!("init", DEPTH_CONTRACT, true, *ch4) |
                        TreeHashMap!("set", contractsThm, payload.get("contractId"), "exists", *ch3) |
                        for (@pursesThm <- ch2; @pursesDataThm <- ch4; _ <- ch3) {

                          for (@superKeys <- @(*vault, "boxesSuperKeys", boxId)) {
                            @(*vault, "boxesSuperKeys", boxId)!(
                              superKeys.union(Set(payload.get("contractId")))
                            )
                          } |

                          // purses tree hash map
                          @(*vault, "purses", payload.get("contractId"))!(pursesThm) |

                          // purses data tree hash map
                          @(*vault, "pursesData", payload.get("contractId"))!(pursesDataThm) |

                          // config
                          @(*vault, "contractConfig", payload.get("contractId"))!(
                            payload.set("locked", false).set("counter", 1).set("version", VERSION).set("fee", payload.get("fee"))
                          ) |

                          new superKeyCh in {
                            // return the bundle+ super key
                            @return!((true, bundle+{*superKeyCh})) |

                            for (@("LOCK", return2) <= superKeyCh) {
                              for (@contractConfig <<- @(*vault, "contractConfig", payload.get("contractId"))) {
                                if (contractConfig.get("locked") == true) {
                                  @return2!("error: contract is already locked")
                                } else {
                                  for (_ <- @(*vault, "contractConfig", payload.get("contractId"))) {
                                    @(*vault, "contractConfig", payload.get("contractId"))!(contractConfig.set("locked", true)) |
                                    @return2!((true, Nil))
                                  }
                                }
                              }
                            } |

                            for (@("CREATE_PURSES", createPursesPayload, return2) <= superKeyCh) {
                              for (@contractConfig <<- @(*vault, "contractConfig", payload.get("contractId"))) {
                                if (contractConfig.get("locked") == true) {
                                  @return2!("error: contract is locked")
                                } else {
                                  createPursesCh!((createPursesPayload, payload.get("contractId"), return2))
                                }
                              }
                            }
                          }
                        }
                      } else {
                        @return!("error: contract id already exists")
                      }
                    }
                  }
                }
                _ => {
                  @return!("error: invalid contract id")
                }
              }
            }
            _ => {
              @return!("error: invalid payload")
            }
          }
        } |


        for (@("UPDATE_PURSE_PRICE", payload2, return2) <= @boxCh) {
          new ch3, ch4, ch5 in {
            match payload2 {
              { "price": Int \\/ Nil, "contractId": String, "purseId": String } => {
                getBoxCh!((boxId, *ch3)) |
                for (@box <- ch3) {
                  if (box != Nil) {
                    getPurseCh!((box, payload2.get("contractId"), payload2.get("purseId"), *ch4)) |
                    for (@purse <- ch4) {
                      if (purse != Nil) {
                        for (@pursesThm <<- @(*vault, "purses", payload2.get("contractId"))) {
                          TreeHashMap!("set", pursesThm, payload2.get("purseId"), purse.set("price", payload2.get("price")), *ch5) |
                          for (_ <- ch5) {
                            @return2!((true, Nil))
                          }
                        }
                      } else {
                        @return2!("error: purse not found")
                      }
                    }
                  } else {
                    @return2!("error: CRITICAL box not found")
                  }
                }
              }
              _ => {
                @return2!("error: invalid payload for update price")
              }
            }
          }
        } |

        for (@("UPDATE_PURSE_DATA", payload2, return2) <= @boxCh) {
          new ch3, ch4, ch5 in {
            match payload2 {
              { "data": _, "contractId": String, "purseId": String } => {
                getBoxCh!((boxId, *ch3)) |
                for (@box <- ch3) {
                  if (box != Nil) {
                    getPurseCh!((box, payload2.get("contractId"), payload2.get("purseId"), *ch4)) |
                    for (@purse <- ch4) {
                      if (box != Nil) {
                        for (@pursesDataThm <<- @(*vault, "pursesData", payload2.get("contractId"))) {
                          TreeHashMap!("set", pursesDataThm, payload2.get("purseId"), payload2.get("data"), *ch5) |
                          for (_ <- ch5) {
                            @return2!((true, Nil))
                          }
                        }
                      } else {
                        @return2!("error: purse not found")
                      }
                    }
                  } else {
                    @return2!("error: CRITICAL box not found")
                  }
                }
              }
              _ => {
                @return2!("error: invalid payload for update data")
              }
            }
          }
        } |

        for (@("WITHDRAW", payload2, return2) <= @boxCh) {
          new ch3, ch4, ch5, ch6, ch7, ch8, ch9, ch10, ch11, proceedWithdrawCh, mergeCh, mergeOkCh in {
            match payload2 {
              { "quantity": Int, "contractId": String, "purseId": String, "toBoxId": String, "merge": Bool } => {
                getContractPursesThmCh!((payload2.get("contractId"), *ch4)) |
                getBoxCh!((payload2.get("toBoxId"), *ch6)) |
                getBoxCh!((boxId, *ch10)) |
                for (@pursesThm <- ch4; @toBox <- ch6; @box <- ch10) {
                  match (pursesThm != Nil, toBox != Nil, box != Nil) {
                    (true, true, true) => {
                      getPurseCh!((box, payload2.get("contractId"), payload2.get("purseId"), *ch9)) |
                      for (@purse <- ch9) {
                        if (purse == Nil) {
                          @return2!("error: purse does not exist")
                        } else {
                          if (purse.get("id") != "0") {
                            proceedWithdrawCh!((pursesThm, purse))
                          } else {
                            @return2!("error: withdraw from special nft 0 is forbidden")
                          }
                        }
                      }
                    }
                    _ => {
                      @return2!("error: contract or recipient box does not exist")
                    }
                  }
                }
              }
              _ => {
                @return2!("error: invalid payload for withdraw")
              }
            } |

            for (@(pursesThm, purse) <- proceedWithdrawCh) {

              // the withdrawer should not be able to choose if
              // tokens in recipient box will or will not be 
              // merged, except if he withdraws to himself
              mergeCh!(payload2.get("merge")) |
              if (payload2.get("toBoxId") != boxId) {
                for (_ <- mergeCh) {
                  mergeOkCh!(true)
                }
              } else {
                for (@m <- mergeCh) {
                  mergeOkCh!(m)
                }
              } |

              for (@merge <- mergeOkCh) {
                match (
                  purse.get("quantity") - payload2.get("quantity") >= 0,
                  purse.get("quantity") > 0,
                  purse.get("quantity") - payload2.get("quantity") > 0
                ) {

                  // ajust quantity in first purse, create a second purse
                  // associated with toBoxId
                  (true, true, true) => {
                    TreeHashMap!("set", pursesThm, payload2.get("purseId"), purse.set("quantity", purse.get("quantity") - payload2.get("quantity")),  *ch5) |
                    for (_ <- ch5) {
                      makePurseCh!((
                        payload2.get("contractId"),
                        purse
                          .set("price", Nil)
                          .set("quantity", payload2.get("quantity"))
                          .set("boxId", payload2.get("toBoxId")),
                        Nil,
                        merge,
                        return2
                      ))
                    }
                  }

                  // remove first purse, create a second purse
                  // associated with toBoxId
                  (true, true, false) => {
                    TreeHashMap!("set", pursesThm, payload2.get("purseId"), Nil,  *ch5) |
                    for (@pursesDataThm <<- @(*vault, "pursesData", payload2.get("contractId"))) {
                      TreeHashMap!(
                        "get",
                        pursesDataThm,
                        payload2.get("purseId"),
                        *ch7
                      ) |
                      for (_ <- ch5; @data <- ch7) {
                        TreeHashMap!(
                          "set",
                          pursesDataThm,
                          payload2.get("purseId"),
                          Nil,
                          *ch11
                        ) |
                        for (_ <- ch11) {
                          removePurseInBoxCh!((boxId, payload2.get("contractId"), payload2.get("purseId"), *ch8)) |
                          for (@r <- ch8) {
                            match r {
                              String => {
                                @return2!(r)
                              }
                              _ => {
                                makePurseCh!((
                                  payload2.get("contractId"),
                                  purse
                                    .set("price", Nil)
                                    .set("boxId", payload2.get("toBoxId")),
                                  data,
                                  merge,
                                  return2
                                )) 
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                  _ => {
                    @return2!("error: cannot withdraw, quantity in payload is superior to existing purse quantity")
                  }
                }
              }
            }
          }
        } |

        for (@(amount, contractConfig, return2) <= calculateFeeCh) {
          if (contractConfig.get("fee") == Nil) {
            @return2!((amount, 0, Nil))
          } else {
            match amount * contractConfig.get("fee").nth(1) / 100000 {
              feeAmount => {
                @return2!((amount - feeAmount, feeAmount, contractConfig.get("fee").nth(0)))
              }
            }
          }
        } |

        for (@("PURCHASE", payload2, return2) <= @boxCh) {
          match payload2 {
            { "quantity": Int, "contractId": String, "merge": Bool, "purseId": String, "newId": Nil \\/ String, "data": _, "purseRevAddr": _, "purseAuthKey": _ } => {
              new ch3, ch4, ch5, ch6, ch7, step2Ch, ch20, ch21, ch22, ch23, ch24, ch25, ch26, ch27, ch28, step3Ch, rollbackCh, ch30, ch31, ch32, ch33, ch34, ch35, ch36, ch37, step4Ch, ch40, ch41, ch42, ch43, ch44, ch45, ch46, ch47, ch48, step5Ch, ch50, ch51, ch52, ch53 in {

                // STEP 1
                // check box, purse
                getBoxCh!((boxId, *ch3)) |
                for (@box <- ch3) {
                  if (box != Nil) {
                    getContractPursesThmCh!((payload2.get("contractId"), *ch4)) |
                    getContractPursesDataThmCh!((payload2.get("contractId"), *ch5)) |
                    for (@pursesThm <- ch4; @pursesDataThm <- ch5) {
                      if (pursesThm != Nil) {
                        TreeHashMap!("get", pursesThm, payload2.get("purseId"), *ch6) |
                        TreeHashMap!("get", pursesDataThm, payload2.get("purseId"), *ch7)
                      } else {
                        @return2!("error: contract not found")
                      } |
                      for (@purse <- ch6; @purseData <- ch7) {
                        if (purse != Nil) {
                          step2Ch!((pursesThm, pursesDataThm, purse, purseData))
                        } else {
                          @return2!("error: purse not found")
                        }
                      }
                    }
                  } else {
                    @return2!("error: CRITICAL box not found")
                  }
                } |

                // STEP 2
                // transfer total amount to temporary escrow purse
                // check that both emitter and recipient vault exist
                for (@(pursesThm, pursesDataThm, purse, purseData) <- step2Ch) {
                  match (
                    purse.get("price"),
                    purse.get("quantity") > 0,
                    payload2.get("quantity") > 0,
                    purse.get("quantity") >= payload2.get("quantity")
                  ) {
                    (Int, true, true, true) => {
                      registryLookup!(\`rho:rchain:revVault\`, *ch20) |

                      for (@boxConfig <<- @(*vault, "boxConfig", purse.get("boxId"))) {
                        revAddress!("fromPublicKey", boxConfig.get("publicKey").hexToBytes(), *ch21)
                      } |

                      for (@contractConfig <<- @(*vault, "contractConfig", payload2.get("contractId"))) {
                        calculateFeeCh!((payload2.get("quantity") * purse.get("price"), contractConfig, *ch22))
                      } |

                      for (@(_, RevVault) <- ch20; @ownerRevAddress <- ch21; @amountAndFeeAmount <- ch22) {
                        match (
                          payload2.get("purseRevAddr"),
                          ownerRevAddress,
                          amountAndFeeAmount.nth(0),
                          amountAndFeeAmount.nth(1),
                          amountAndFeeAmount.nth(2)
                        ) {
                          (emitterRevAddress, recipientRevAddress, amount, feeAmount, feePublicKey) => {
                            @RevVault!("findOrCreate", emitterRevAddress, *ch23) |
                            @RevVault!("findOrCreate", recipientRevAddress, *ch24) |
                            for (@a <- ch23; @b <- ch24) {
                              match (a, b) {
                                ((true, purseVaultEmitter),  (true, purseVaultRecipient)) => {
                                  new unf in {
                                    @RevVault!("unforgeableAuthKey", *unf, *ch25) |
                                    revAddress!("fromUnforgeable", *unf, *ch26) |
                                    for (@escrowPurseAuthKey <- ch25; @escrowPurseRevAddr <- ch26) {
                                      @RevVault!("findOrCreate", escrowPurseRevAddr, *ch27) |
                                      for (@(true, escrowPurseVault) <- ch27) {
                                        @purseVaultEmitter!("transfer", escrowPurseRevAddr, amount + feeAmount, payload2.get("purseAuthKey"), *ch28) |
                                        for (@escrowTransferResult <- ch28) {
                                          match escrowTransferResult {
                                            (true, Nil) => {
                                              stdout!("transfer to escrow purse successful") |
                                              step3Ch!((pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feePublicKey))
                                            }
                                            _ => {
                                              stdout!(escrowTransferResult) |
                                              @return2!("error: escrow transfer went wrong, invalid rev purse in payload")
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                                _ => {
                                  @return2!("error: could not find or create vaults")
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                    _ => {
                      @return2!("error: quantity not available or purse not for sale")
                    }
                  }
                } |

                // STEP 3
                // listen on rollbackCh and prepare to reset state to original
                // if step 4 or 5 fails
                // 
                for (@(pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feePublicKey) <- step3Ch) {
                  for (@message <- rollbackCh) {
                    TreeHashMap!("set", pursesThm, purse.get("id"), purse,  *ch30) |
                    TreeHashMap!("set", pursesDataThm, purse.get("id"), purseData,  *ch31) |
                    if (purse.get("quantity") - payload2.get("quantity") == 0) {
                      savePurseInBoxCh!((payload2.get("contractId"), purse.get("boxId"), purse.get("id"), true, *ch32))
                    } else {
                      // the purse has not been removed from box
                      ch32!((true, Nil))
                    } |
                    for (_ <- ch30; _ <- ch31; @a <- ch32) {
                      match a {
                        String => {
                          stdout!("error: CRITICAL could not rollback after makePurse error") |
                          @return2!("error: CRITICAL could not rollback after makePurse error")
                        }
                        _ => {
                          @RevVault!("findOrCreate", escrowPurseRevAddr, *ch33) |
                          for (@(true, purseVaultEscrow) <- ch33) {
                            @purseVaultEscrow!("transfer", emitterRevAddress, amount + feeAmount, escrowPurseAuthKey, *ch34) |
                            for (@r <- ch34) {
                              match r {
                                (true, Nil) => {
                                  @return2!("error: rollback successful, makePurse error, transaction was rolled backed, emitter purse was reimbursed " ++ message)
                                }
                                _ => {
                                  stdout!(r) |
                                  stdout!("error: CRITICAL, makePurse error, could rollback but could not reimburse after makePurse error" ++ message) |
                                  @return2!("error: CRITICAL, makePurse error, could rollback but could not reimburse after makePurse error" ++ message)
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  } |
                  step4Ch!((pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feePublicKey))
                } |

                // STEP 4
                // try to makePurse
                for (@(pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feePublicKey) <- step4Ch) {
                  for (@makePurseResult <- ch43) {
                    match makePurseResult {
                      String => {
                        rollbackCh!(makePurseResult)
                      }
                      _ => {
                        step5Ch!((pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feePublicKey))
                      }
                    }
                  } |

                  // remove completely purse and create a new one
                  // with same id, id may be changed by makePurse
                  // depending on fungible or not
                  if (purse.get("quantity") - payload2.get("quantity") == 0) {
                    TreeHashMap!("set", pursesThm, purse.get("id"), Nil,  *ch40) |
                    TreeHashMap!("set", pursesDataThm, purse.get("id"), Nil,  *ch41) |
                    removePurseInBoxCh!((purse.get("boxId"), payload2.get("contractId"), purse.get("id"), *ch42)) |

                    for (_ <- ch40; _ <- ch41; _ <- ch42) {
                      makePurseCh!((
                        payload2.get("contractId"),
                        // keep quantity and type of existing purse
                        purse
                          .set("boxId", boxId)
                          .set("price", Nil)
                          // will only considered for nft, purchase from purse "0"
                          .set("newId", payload2.get("newId")),
                        payload2.get("data"),
                        payload2.get("merge"),
                        *ch43
                      ))
                    }
                  } else {
                    // just update quantity of current purse, and
                    //  create another one with right quantity
                    TreeHashMap!("set", pursesThm, purse.get("id"), purse.set("quantity", purse.get("quantity") - payload2.get("quantity")),  *ch40) |

                    for (_ <- ch40) {
                      makePurseCh!((
                        payload2.get("contractId"),
                        purse
                          .set("boxId", boxId)
                          .set("quantity", payload2.get("quantity"))
                          .set("price", Nil)
                          // will only considered for nft, purchase from purse "0"
                          .set("newId", payload2.get("newId")),
                        payload2.get("data"),
                        payload2.get("merge"),
                        *ch43
                      ))
                    }
                  }
                } |

                // STEP 5
                // everything went ok, do final payment
                for (@(pursesThm, pursesDataThm, purse, purseData, RevVault, escrowPurseRevAddr, escrowPurseAuthKey, emitterRevAddress, recipientRevAddress, amount, feeAmount, feePublicKey) <- step5Ch) {
                  @RevVault!("findOrCreate", escrowPurseRevAddr, *ch50) |
                  for (@(true, purseVaultEscrow) <- ch50) {
                    @purseVaultEscrow!("transfer", recipientRevAddress, amount, escrowPurseAuthKey, *ch51) |
                    for (@r <- ch51) {
                      match r {
                        (true, Nil) => {
                          if (feeAmount != 0) {
                            revAddress!("fromPublicKey", feePublicKey.hexToBytes(), *ch52) |
                            for (@feeRevAddress <- ch52) {
                              @purseVaultEscrow!("transfer", feeRevAddress, feeAmount, escrowPurseAuthKey, *ch53)
                            } |
                            for (@transferFeeReturn <- ch53) {
                              match transferFeeReturn {
                                (true, Nil) => {
                                  stdout!("fee transfer successful")
                                }
                                _ => {
                                  stdout!("error: CRITICAL could not transfer fee")
                                }
                              }
                            }
                          } |
                          @return2!((true, Nil))
                        }
                        _ => {
                          stdout!("error: CRITICAL, makePurse went fine, but could not do final transfer") |
                          rollbackCh!("error: CRITICAL, makePurse went fine, but could not do final transfer")
                        }
                      }
                    }
                  }
                }
              }
            }
            _ => {
              @return2!("error: invalid payload")
            }
          }
        }
      } |

      insertArbitrary!(bundle+{*entryCh}, *entryUriCh) |

      for (entryUri <- entryUriCh) {
        basket!({
          "status": "completed",
          "registryUri": *entryUri
        }) |
        stdout!(("rchain-token master registered at", *entryUri))
      }
    }
  }`;