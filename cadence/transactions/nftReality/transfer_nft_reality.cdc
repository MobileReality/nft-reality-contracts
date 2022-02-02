import NonFungibleToken from "../../contracts/NonFungibleToken.cdc"
import NftReality from "../../contracts/NftReality.cdc"

transaction(recipient: Address, withdrawID: UInt64) {
    prepare(signer: AuthAccount) {
        
        let recipient = getAccount(recipient)

        let collectionRef = signer.borrow<&NftReality.Collection>(from: NftReality.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the owner's collection")

        let depositRef = recipient.getCapability(NftReality.CollectionPublicPath)!.borrow<&{NonFungibleToken.CollectionPublic}>()!

        let nft <- collectionRef.withdraw(withdrawID: withdrawID)

        depositRef.deposit(token: <-nft)
    }
}
