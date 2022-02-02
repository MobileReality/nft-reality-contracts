transaction(contractName: String, code: String) {

    prepare(nftRealityContractAccount: AuthAccount) {
        let contract = nftRealityContractAccount.contracts.get(name: contractName)
        if contract == nil {
            nftRealityContractAccount.contracts.add(name: contractName, code: code.decodeHex())
        } else {
            nftRealityContractAccount.contracts.update__experimental(name: contractName, code: code.decodeHex())
        }
    }
}