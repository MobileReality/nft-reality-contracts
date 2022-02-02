import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NftReality from "../../contracts/NftReality.cdc"

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account.getCapability(NftReality.CollectionPublicPath)!
        .borrow<&{NonFungibleToken.CollectionPublic}>()
        ?? panic("Could not borrow capability from public collection")
    
    return collectionRef.getIDs().length
}
