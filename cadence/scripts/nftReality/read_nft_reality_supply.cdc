import NftReality from "../../contracts/NftReality.cdc"

pub fun main(): UInt64 {    
    return NftReality.totalSupply
}
