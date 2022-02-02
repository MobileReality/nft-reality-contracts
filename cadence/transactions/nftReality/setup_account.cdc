import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NftReality from "../../contracts/NftReality.cdc"

transaction {
    prepare(signer: AuthAccount) {
        if signer.borrow<&NftReality.Collection>(from: NftReality.CollectionStoragePath) == nil {

            let collection <- NftReality.createEmptyCollection()
            
            signer.save(<-collection, to: NftReality.CollectionStoragePath)

            signer.link<&NftReality.Collection{NonFungibleToken.CollectionPublic, NftReality.NftRealityCollectionPublic}>(NftReality.CollectionPublicPath, target: NftReality.CollectionStoragePath)
        }
    }
}
