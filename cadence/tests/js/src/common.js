import { getAccountAddress } from "flow-js-testing";

const FUNGIBLE_TOKEN_ADDRESS = "0xee82856bf20e2aa6";

export const getFungibleTokenAddress = () => FUNGIBLE_TOKEN_ADDRESS;
export const getNftRealityAddress = async () => getAccountAddress("NftReality");
