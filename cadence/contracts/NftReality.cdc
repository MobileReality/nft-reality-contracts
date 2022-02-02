import NonFungibleToken from "./NonFungibleToken.cdc"

// NftReality Contract
pub contract NftReality: NonFungibleToken {

    // Events
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)
    pub event Minted(id: UInt64, itemUuid: String, unit: UInt64, totalUnits: UInt64, metadata: Metadata, additionalInfo: {String: String})

    // Paths
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let MinterStoragePath: StoragePath

    // Number of nfts minted
    pub var totalSupply: UInt64

    // NFT metadata
    pub struct Metadata {
        pub let artwork: String
        pub let logotype: String
        pub let description: String
        pub let creator: String
        pub let company: String
        pub let role: String
        pub let creationDate: String

        init(
            artwork: String,
            logotype: String,
            description: String,
            creator: String,
            company: String,
            role: String,
            creationDate: String
        ) {
            self.artwork = artwork
            self.logotype = logotype
            self.description = description
            self.creator = creator
            self.company = company
            self.role = role
            self.creationDate = creationDate
        }
    }

    // NftReality nft resource
    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64
        pub let itemUuid: String
        pub let unit: UInt64
        pub let totalUnits: UInt64
        pub let metadata: Metadata
        pub let additionalInfo: {String: String}

        init(ID: UInt64, itemUuid: String, unit: UInt64, totalUnits: UInt64, metadata: Metadata, additionalInfo: {String: String}) {
            self.id = ID
            self.itemUuid = itemUuid
            self.unit = unit
            self.totalUnits = totalUnits
            self.metadata = metadata
            self.additionalInfo = additionalInfo
        }
    }

    // NftReality nfts collection public interface
    pub resource interface NftRealityCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowNftReality(id: UInt64): &NftReality.NFT? {
            post {
                (result == nil) || (result?.id == id):
                    "Cannot borrow NftReality reference: The ID of the returned reference is incorrect"
            }
        }
    }

    // NftReality nfts collection resource
    pub resource Collection: NftRealityCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {
        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) ?? panic("Missing NFT")

            emit Withdraw(id: token.id, from: self.owner?.address)

            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @NftReality.NFT

            let id: UInt64 = token.id

            let oldToken <- self.ownedNFTs[id] <- token

            emit Deposit(id: id, to: self.owner?.address)

            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        pub fun borrowNftReality(id: UInt64): &NftReality.NFT? {
            if self.ownedNFTs[id] != nil {
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &NftReality.NFT
            } else {
                return nil
            }
        }

        destroy() {
            destroy self.ownedNFTs
        }

        init () {
            self.ownedNFTs <- {}
        }
    }

    // public function that anyone can call to create a new empty collection
    pub fun createEmptyCollection(): @NftReality.Collection {
        return <- create Collection()
    }

    // Resource that an admin can use to mint new nfts
	pub resource NFTMinter {

        pub fun mintNFT(
            itemUuid: String,
            recipient: &{NonFungibleToken.CollectionPublic},
            unit: UInt64,
            totalUnits: UInt64,
            metadata: Metadata,
            additionalInfo: {String: String}
        ) {
            emit Minted(id: NftReality.totalSupply, itemUuid: itemUuid, unit: unit, totalUnits: totalUnits, metadata: metadata, additionalInfo: additionalInfo)

            recipient.deposit(token: <-create NftReality.NFT(
                ID: NftReality.totalSupply,
                itemUuid: itemUuid,
                unit: unit,
                totalUnits: totalUnits,
                metadata: metadata,
                additionalInfo: additionalInfo
            ))

            NftReality.totalSupply = NftReality.totalSupply + (1 as UInt64)
		}

        pub fun batchMintNFT(
            itemUuid: String,
            recipient: &{NonFungibleToken.CollectionPublic},
            totalUnits: UInt64,
            startingUnit: UInt64,
            quantity: UInt64,
            metadata: Metadata,
            additionalInfo: {String: String}
        ) {
            var i: UInt64 = 0
            var unit: UInt64 = startingUnit - 1
            while i < quantity {
                i = i + UInt64(1)
                unit = unit + UInt64(1)
                self.mintNFT(
                    itemUuid: itemUuid,
                    recipient: recipient,
                    unit: unit,
                    totalUnits: totalUnits,
                    metadata: metadata,
                    additionalInfo: additionalInfo
                )
            }
        }
	}

    init (admin: AuthAccount) {
        self.CollectionStoragePath = /storage/nftRealityCollection
        self.CollectionPublicPath = /public/nftRealityCollection
        self.MinterStoragePath = /storage/nftRealityMinter

        self.totalSupply = 0

        let minter <- create NFTMinter()
        admin.save(<-minter, to: self.MinterStoragePath)

        emit ContractInitialized()
	}
}
