import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import MetadataViews from "../../contracts/MetadataViews.cdc"
import NftReality from "../../contracts/NftReality.cdc"

pub struct NftRealityMetadataViews {
    pub let metadata: NftReality.NftRealityMetadataView
    pub let display: MetadataViews.Display

    init(
        metadata: NftReality.NftRealityMetadataView,
        display: MetadataViews.Display,
    ) {
        self.metadata = metadata
        self.display = display
    }
}

pub fun main(address: Address, collectibleID: UInt64): NftRealityMetadataViews {

    let owner = getAccount(address)
    let collectionBorrow = owner.getCapability(NftReality.CollectionPublicPath)!
        .borrow<&{NftReality.NftRealityCollectionPublic}>()
        ?? panic("Could not borrow NftRealityCollectionPublic")

    let nftReality = collectionBorrow.borrowNftReality(id: collectibleID)
        ?? panic("No such collectibleID in that collection")

    let metadataView = nftReality.resolveView(Type<NftReality.NftRealityMetadataView>())!
    let displayView = nftReality.resolveView(Type<MetadataViews.Display>())!

    let metadata = metadataView as! NftReality.NftRealityMetadataView
    let display = displayView as! MetadataViews.Display

    return NftRealityMetadataViews(
        metadata: metadata,
        display: display,
    )
}
