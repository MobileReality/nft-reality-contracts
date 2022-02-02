transaction(contractName: String, code: String) {

    prepare(nftRealityContractAccount: AuthAccount, nftRealityAdminAccount: AuthAccount) {
        let contract = nftRealityContractAccount.contracts.get(name: contractName)
        if contract == nil {
            nftRealityContractAccount.contracts.add(
                name: contractName,
                code: code.decodeHex(),
                admin: nftRealityAdminAccount
            )
        } else {
            nftRealityContractAccount.contracts.update__experimental(name: contractName, code: code.decodeHex())
        }
    }
}