Vault {
boxes: Array<Box>
}

Box = {
purse : Purse
superkey : string
}

Purse = NFT | FT

type "0" = NFT
type "<any>" = FT

OCAP = Box

---

Factory {
adminContract: Admin
storeContract: Store

memberContract: Member
collectionContract: Collection
auctionContract: Auction
purseContract: Purse
tokenContract: Token
erc20Contract: ERC20
erc721Contract: ERC721

}

Store {
members : Arry<Member>

addMember()
removeMember()
}

Member {
collections: Array<Collection>

addCollection()
removeCollection()
}

Collection {
name: String
tokens: Array<ERC20>

}

Purse {
tokens: Array<Token>

withdraw()
purchase()
}

Token = ERC20 | ERC721

ERC721 {
name : String
collection: String
quantity: String
ressource : ByteCode
auction: Auction

lock()
addAuction()
removeAuction
}

Master contract

ro PUBLIC_READ_ALL_PURSES: (contractId: String) => String | Map(all purses encoded)
ro PUBLIC_READ_BOX: (boxId: String) => String | Map(box purses and config)
ro PUBLIC_READ_PURSES: ({ contractId: String, [purseIds]: Set(String) }) => Map(purses)
ro PUBLIC_READ_PURSES_DATA: ({ contractId: String, [purseIds]: Set(String) }) => Map(purses data)
ro PUBLIC_READ_CONFIG: (contractId: String) => String | Map(contract config)
PUBLIC_REGISTER_BOX: ({ boxId: String, publicKey: String }) => String | (true, box ocap object)

---

Box contract

ro READ: () => Properties of the purse (quantity, price, box, publicKey, type)
PUBLIC_REGISTER_CONTRACT: ({ contractId: string, fungible: Bool, fee: Nil | (String, int) }) => String | (true, super key ocap object)
UPDATE_PURSE_PRICE: ({ contractId: String, purseId: String, price: Nil | Int }) => String | (true, super key ocap object)
UPDATE_PURSE_DATA: ({ contractId: String, purseId: String, data: any }) => String | (true, super key ocap object)
WITHDRAW: ({ contractId: String, purseId: String, quantity: Int, toBoxId: String, merge: Bool }) => String | (true, Nil)
PURCHASE: ({ contractId: String, purseId: String, quantity: Int, merge: Bool, newId: String | Nil, data: any, purseRevAddr: String, purseRevAddr: VaultAuthKey }) => String | (true, Nil)

---

Purse contract

LOCK: () => String | (true, Nil) // cannot CREATE_PURSES anymore after a contract is locked
CREATE_PURSES: see cli/createPurse.js
