import { Address, UInt64, String, Dictionary } from '@onflow/types';
import {
  deployContractByName,
  executeScript,
  getContractAddress,
  getContractCode,
  getScriptCode,
  getTransactionCode,
  mintFlow,
  sendTransaction,
} from 'flow-js-testing';
import {
  getNftRealityAddress,
  getNftRealityAdminAddress,
  registerContract,
} from './common';

/*
 * Deploys NonFungibleToken and NftReality contracts.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployNftReality = async () => {
  const NftReality = await getNftRealityAddress();
  const NftRealityAdmin = await getNftRealityAdminAddress();
  const addressMap = { NonFungibleToken: NftReality };

  await mintFlow(NftReality, '10.0');
  await deployContractByName({
    to: NftReality,
    name: 'NonFungibleToken',
  });

  const contractName = 'NftReality';
  const contractCode = await getContractCode({
    name: contractName,
    addressMap,
  });
  const contractCodeHex = Buffer.from(contractCode).toString('hex');

  const code = await getTransactionCode({ name: 'nftReality/deploy_contract' });
  const signers = [NftReality, NftRealityAdmin];

  const args = [
    [contractName, String],
    [contractCodeHex, String],
  ];
  await sendTransaction({ code, signers, args });

  return registerContract(contractName, NftReality);
};

/*
 * Setups NftReality collection on account and exposes public capability.
 * @param {string} account - account address
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const setupNftRealityOnAccount = async (account) => {
  const name = 'nftReality/setup_account';
  const code = await getTransactionCode({ name });
  const signers = [account];

  return sendTransaction({ code, signers });
};

/*
 * Returns NftReality supply.
 * @throws Will throw an error if execution fails
 * @returns {UInt64} - number of NFT minted so far
 * */
export const getNftRealitySupply = async () => {
  const NftReality = await getNftRealityAddress();
  const addressMap = { NftReality };

  const name = 'nftReality/read_nft_reality_supply';
  const code = await getScriptCode({ name, addressMap });

  const [result] = await executeScript({ code });

  return result;
};

/*
 * Mints NftReality with specific **uri** and sends it to **recipient**.
 * @param {string} itemUuid - token itemUuid
 * @param {string} recipient - account address
 * @param {number} quantity - nfts quantity
 * @param {string} artwork - ipfs hash of artwork
 * @param {string} logotype - ipfs hash of logotype
 * @param {string} description - metadata description
 * @param {string} creator - metadata creator
 * @param {string} company - metadata company
 * @param {string} role - metadata role
 * @param {string} creationDate - metadata creationDate
 * @param {object} additionalInfo - additional info
 * @throws Will throw an error if execution fails
 * @returns {Promise<*>}
 * */
export const mintNftReality = async (
  itemUuid,
  recipient,
  quantity,
  artwork,
  logotype,
  description,
  creator,
  company,
  role,
  creationDate,
  additionalInfo,
) => {
  const NftRealityAdmin = await getNftRealityAdminAddress();
  const NonFungibleToken = await getNftRealityAddress();
  const NftReality = await getNftRealityAddress();

  const name = 'nftReality/mint_nft_reality';
  const addressMap = { NonFungibleToken, NftReality };
  const code = await getTransactionCode({ name, addressMap });
  const totalUnits = quantity;
  const startingUnit = 1;

  const signers = [NftRealityAdmin];
  const args = [
    [itemUuid, String],
    [recipient, Address],
    [totalUnits, UInt64],
    [startingUnit, UInt64],
    [quantity, UInt64],
    [artwork, String],
    [logotype, String],
    [description, String],
    [creator, String],
    [company, String],
    [role, String],
    [creationDate, String],
    [
      Object.keys(additionalInfo).map(function (key) {
        return { key, value: additionalInfo[key] };
      }),
      Dictionary({ key: String, value: String }),
    ],
  ];

  return sendTransaction({ code, signers, args });
};

/*
 * Transfers NftReality NFT with id equal **itemId** from **sender** account to **recipient**.
 * @param {string} sender - sender address
 * @param {string} recipient - recipient address
 * @param {UInt64} itemId - id of the item to transfer
 * @throws Will throw an error if execution fails
 * @returns {Promise<*>}
 * */
export const transferNftReality = async (sender, recipient, itemId) => {
  const NonFungibleToken = await getNftRealityAddress();
  const NftReality = await getNftRealityAddress();

  const name = 'nftReality/transfer_nft_reality';
  const addressMap = { NonFungibleToken, NftReality };
  const code = await getTransactionCode({ name, addressMap });

  const signers = [sender];
  const args = [
    [recipient, Address],
    [itemId, UInt64],
  ];

  return sendTransaction({ code, signers, args });
};

/*
 * Returns NftReality with **id** in account collection.
 * @throws Will throw an error if execution fails
 * @returns {NftReality}
 * */
export const getNftRealityById = async (account, id) => {
  const NftReality = await getNftRealityAddress();
  const NonFungibleToken = await getNftRealityAddress();

  const name = 'nftReality/read_nft_reality';
  const addressMap = { NftReality, NonFungibleToken };
  const code = await getScriptCode({ name, addressMap });

  const args = [
    [account, Address],
    [id, UInt64],
  ];

  const [result] = await executeScript({ code, args });

  return result;
};

/*
 * Returns the length of account's NftReality collection.
 * @throws Will throw an error if execution fails
 * @returns {UInt64}
 * */
export const getCollectionLength = async (account) => {
  const NftReality = await getNftRealityAddress();
  const NonFungibleToken = await getContractAddress('NonFungibleToken');

  const name = 'nftReality/read_collection_length';
  const addressMap = { NonFungibleToken, NftReality };

  const code = await getScriptCode({ name, addressMap });
  const args = [[account, Address]];

  const [result] = await executeScript({ code, args });

  return result;
};
