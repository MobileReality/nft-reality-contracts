import {
  getAccountAddress,
  getTransactionCode,
  sendTransaction,
} from 'flow-js-testing';

export const getNftRealityAddress = async () => getAccountAddress('NftReality');
export const getNftRealityAdminAddress = async () =>
  getAccountAddress('NftRealityAdmin');

export const registerContract = async (name, address) => {
  const code = await getTransactionCode({ name: 'utils/register_contract' });
  const args = [name, address];

  return sendTransaction({ code, args });
};
