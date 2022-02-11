import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NftReality from "../../contracts/NftReality.cdc"

pub fun main(address: Address, collectibleID: UInt64): {String: String} {

    let owner = getAccount(address)
    let collectionBorrow = owner.getCapability(NftReality.CollectionPublicPath)!
        .borrow<&{NftReality.NftRealityCollectionPublic}>()
        ?? panic("Could not borrow NftRealityCollectionPublic")

    let nftReality = collectionBorrow.borrowNftReality(id: collectibleID)
        ?? panic("No such collectibleID in that collection")

    return nftReality.getAdditionalInfo()
}
