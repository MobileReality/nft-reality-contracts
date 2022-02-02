import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NftReality from "../../contracts/NftReality.cdc"

transaction(
    itemUuid: String,
    recipient: Address,
    totalUnits: UInt64,
    startingUnit: UInt64,
    quantity: UInt64,
    artwork: String,
    logotype: String,
    description: String,
    creator: String,
    company: String,
    role: String,
    creationDate: String,
    additionalInfo: {String: String}
) {
    let minter: &NftReality.NFTMinter

    prepare(signer: AuthAccount) {
        self.minter = signer.borrow<&NftReality.NFTMinter>(from: NftReality.MinterStoragePath)
            ?? panic("Could not borrow a reference to the NFT minter")
    }

    execute {
        let recipient = getAccount(recipient)

        let receiver = recipient
            .getCapability(NftReality.CollectionPublicPath)
            .borrow<&{NonFungibleToken.CollectionPublic}>()
            ?? panic("Could not get receiver reference to the NFT Collection")

        let metadata = NftReality.Metadata(
            artwork: artwork,
            logotype: logotype,
            description: description,
            creator: creator,
            company: company,
            role: role,
            creationDate: creationDate
        )

        self.minter.batchMintNFT(
            itemUuid: itemUuid,
            recipient: receiver,
            totalUnits: totalUnits,
            startingUnit: startingUnit,
            quantity: quantity,
            metadata: metadata,
            additionalInfo: additionalInfo
        )
    }
}
