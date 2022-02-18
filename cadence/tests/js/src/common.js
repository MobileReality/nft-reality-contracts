import {
  getAccountAddress,
  getTransactionCode,
  deployContractByName,
  sendTransaction,
  executeScript,
} from 'flow-js-testing';

export const getNftRealityAddress = async () => getAccountAddress('NftReality');

export const registerContract = async (name, address) => {
  const code = await getTransactionCode({ name: 'utils/register_contract' });
  const args = [name, address];

  return sendTransaction({ code, args });
};

export const deployContractByNameWithErrorRaised = async (...props) => {
  const [resp, err] = await deployContractByName(...props);
  if (err) {
    throw err;
  }
  return resp;
};

export const sendTransactionWithErrorRaised = async (...props) => {
  const [resp, err] = await sendTransaction(...props);
  if (err) {
    throw err;
  }
  return resp;
};

export const executeScriptWithErrorRaised = async (...props) => {
  const [resp, err] = await executeScript(...props);
  if (err) {
    throw err;
  }
  return resp;
};
