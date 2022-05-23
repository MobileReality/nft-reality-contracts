import { Address, UInt64, String, Array, Dictionary } from '@onflow/types';
import {
  deployContractByName,
  sendTransaction,
  executeScript,
  getContractAddress,
  getScriptCode,
  getTransactionCode,
  mintFlow,
} from 'flow-js-testing';
import { getFungibleTokenAddress, getNftRealityAddress } from './common';
import * as faker from 'faker';

/*
 * Deploys NonFungibleToken, MetadataViews, and NftReality contracts.
 * @throws Will throw an error if transaction is reverted.
 * @returns {Promise<*>}
 * */
export const deployNftReality = async () => {
  const NftReality = await getNftRealityAddress();
  const addressMap = {
    FungibleToken: getFungibleTokenAddress(),
    NonFungibleToken: NftReality,
    MetadataViews: NftReality,
  };

  await mintFlow(NftReality, '10.0');
  await deployContractByName({
    to: NftReality,
    name: 'NonFungibleToken',
  });
  await deployContractByName({
    to: NftReality,
    name: 'MetadataViews',
  });
  return deployContractByName({
    to: NftReality,
    name: 'NftReality',
    addressMap,
  });
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

  return executeScript({ code });
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
  metadata,
  additionalInfo = {},
) => {
  const NonFungibleToken = await getNftRealityAddress();
  const NftReality = await getNftRealityAddress();

  const name = 'nftReality/mint_nft_reality';
  const addressMap = { NonFungibleToken, NftReality };
  const code = await getTransactionCode({ name, addressMap });

  const totalUnits = quantity;
  const startingUnit = 1;

  const signers = [NftReality];
  const args = [
    [itemUuid, String],
    [recipient, Address],
    [totalUnits, UInt64],
    [startingUnit, UInt64],
    [quantity, UInt64],
    [metadata.artwork, String],
    [metadata.logotype, String],
    [metadata.description, String],
    [metadata.creator, String],
    [metadata.company, String],
    [metadata.role, String],
    [metadata.creationDate, String],
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
 * Transfers NftReality NFT with id equal **collectibleId** from **sender** account to **recipient**.
 * @param {string} sender - sender address
 * @param {string} recipient - recipient address
 * @param {UInt64} collectibleId - id of the item to transfer
 * @throws Will throw an error if execution fails
 * @returns {Promise<*>}
 * */
export const transferNftReality = async (sender, recipient, collectibleId) => {
  const NonFungibleToken = await getNftRealityAddress();
  const NftReality = await getNftRealityAddress();

  const name = 'nftReality/transfer_nft_reality';
  const addressMap = { NonFungibleToken, NftReality };
  const code = await getTransactionCode({ name, addressMap });

  const signers = [sender];
  const args = [
    [recipient, Address],
    [collectibleId, UInt64],
  ];

  return sendTransaction({ code, signers, args });
};

/*
 * Transfers Bulk NftReality NFT.
 * @param {string} sender - sender address
 * @param {string} recipient - recipient address
 * @param {Array} collectibleIds - ids of the item to transfer
 * @throws Will throw an error if execution fails
 * @returns {Promise<*>}
 * */
export const transferBulkNftReality = async (
  sender,
  recipient,
  collectibleIds,
) => {
  const NonFungibleToken = await getNftRealityAddress();
  const NftReality = await getNftRealityAddress();

  const name = 'nftReality/transfer_bulk_nft_reality';
  const addressMap = { NonFungibleToken, NftReality };
  const code = await getTransactionCode({ name, addressMap });

  const signers = [sender];
  const args = [
    [recipient, Address],
    [collectibleIds, Array(UInt64)],
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

  return executeScript({ code, args });
};

/*
 * Returns NftReality MetadataViews.
 * @throws Will throw an error if execution fails
 * */
export const getNftRealityMetadataViewsById = async (account, id) => {
  const NftReality = await getNftRealityAddress();
  const NonFungibleToken = await getContractAddress('NonFungibleToken');
  const MetadataViews = await getContractAddress('MetadataViews');

  const name = 'nftReality/read_nft_reality_metadata_views';
  const addressMap = { NftReality, NonFungibleToken, MetadataViews };
  const code = await getScriptCode({ name, addressMap });

  const args = [
    [account, Address],
    [id, UInt64],
  ];

  return executeScript({ code, args });
};

/*
 * Returns NftReality additionalInfo.
 * @throws Will throw an error if execution fails
 * */
export const getNftRealityAdditionalInfoById = async (account, id) => {
  const NftReality = await getNftRealityAddress();
  const NonFungibleToken = await getContractAddress('NonFungibleToken');

  const name = 'nftReality/read_nft_reality_additional_info';
  const addressMap = { NftReality, NonFungibleToken };
  const code = await getScriptCode({ name, addressMap });

  const args = [
    [account, Address],
    [id, UInt64],
  ];

  return executeScript({ code, args });
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

  return executeScript({ code, args });
};

/*
 * Returns collectible ids of account's NftReality collection.
 * @throws Will throw an error if execution fails
 * @returns {UInt64}
 * */
export const getCollectionIds = async (account) => {
  const NftReality = await getNftRealityAddress();
  const NonFungibleToken = await getContractAddress('NonFungibleToken');

  const name = 'nftReality/read_collection_ids';
  const addressMap = { NonFungibleToken, NftReality };

  const code = await getScriptCode({ name, addressMap });
  const args = [[account, Address]];

  return executeScript({ code, args });
};

/*
 * Returns random metadata
 * */
export const getRandomMetadata = (metadata = {}) => {
  return {
    artwork: metadata.artwork || faker.random.alphaNumeric(46),
    logotype: metadata.logotype || faker.random.alphaNumeric(46),
    description: metadata.description || faker.lorem.paragraph(),
    creator: metadata.creator || faker.random.words(2),
    company: metadata.company || faker.random.words(2),
    role: metadata.role || faker.random.words(2),
    creationDate: metadata.creationDate || faker.random.words(2),
  };
};
