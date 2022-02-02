import path from 'path';
import {
  init,
  emulator,
  getAccountAddress,
  shallPass,
  shallResolve,
  shallRevert,
} from 'flow-js-testing';
import {
  deployNftReality,
  getNftRealityById,
  getNftRealitySupply,
  setupNftRealityOnAccount,
  mintNftReality,
  transferNftReality,
  getCollectionLength,
} from '../src/nft-reality';

describe('NftReality', () => {
  beforeEach(async () => {
    const basePath = path.resolve(__dirname, '../../../');
    const port = 9080;
    const logging = false;

    await init(basePath, { port });
    await emulator.start(port, logging);
  });

  afterEach(async () => {
    await emulator.stop();
  });

  it('should deploy NftReality contract', async () => {
    await shallPass(deployNftReality());
  });

  it('supply should be 0 after contract is deployed', async () => {
    await deployNftReality();
    await shallResolve(async () => {
      const supply = await getNftRealitySupply();
      expect(supply).toBe(0);
    });
  });

  it('should be possible to create a new empty NFT Collection', async () => {
    await deployNftReality();
    const Collector = await getAccountAddress('Collector');

    await setupNftRealityOnAccount(Collector);
    await shallResolve(async () => {
      const length = await getCollectionLength(Collector);
      expect(length).toBe(0);
    });
  });

  it('should be possible to mint nft-reality nfts', async () => {
    await deployNftReality();
    const Collector = await getAccountAddress('Collector');

    await setupNftRealityOnAccount(Collector);
    const itemUuid = '11111111-1111-1111-1111-111111111111';
    const artwork = '1q2w3e4r';
    const logotype = 'q1w2e3r4';
    const description = 'description';
    const creator = 'creator';
    const company = 'company';
    const role = 'role';
    const creationDate = 'creation-date';
    const quantity = 2;

    await shallPass(
      mintNftReality(
        itemUuid,
        Collector,
        quantity,
        artwork,
        logotype,
        description,
        creator,
        company,
        role,
        creationDate,
        {},
      ),
    );
    await shallResolve(async () => {
      const nftCount = await getCollectionLength(Collector);
      expect(nftCount).toBe(2);

      const nft1 = await getNftRealityById(Collector, 0);
      const nft2 = await getNftRealityById(Collector, 1);

      expect(nft1.unit).toBe(1);
      expect(nft2.unit).toBe(2);
      expect(nft1.totalUnits).toBe(2);
      expect(nft2.totalUnits).toBe(2);
      expect(nft1.metadata).toEqual({
        artwork,
        logotype,
        description,
        creator,
        company,
        role,
        creationDate,
      });
      expect(nft2.metadata).toEqual({
        artwork,
        logotype,
        description,
        creator,
        company,
        role,
        creationDate,
      });
    });
  });

  it('should be possible to mint nft-reality nfts with additional info', async () => {
    await deployNftReality();
    const Collector = await getAccountAddress('Collector');

    await setupNftRealityOnAccount(Collector);
    const itemUuid = '11111111-1111-1111-1111-111111111111';
    const artwork = '1q2w3e4r';
    const logotype = 'q1w2e3r4';
    const description = 'description';
    const creator = 'creator';
    const company = 'company';
    const role = 'role';
    const creationDate = 'creation-date';
    const quantity = 1;

    const extraInfo = 'extra info';
    const testInfo = 'test info';

    await shallPass(
      mintNftReality(
        itemUuid,
        Collector,
        quantity,
        artwork,
        logotype,
        description,
        creator,
        company,
        role,
        creationDate,
        { extraInfo, testInfo },
      ),
    );
    await shallResolve(async () => {
      const nft = await getNftRealityById(Collector, 0);

      expect(nft.unit).toBe(1);
      expect(nft.totalUnits).toBe(1);
      expect(nft.metadata).toEqual({
        artwork,
        logotype,
        description,
        creator,
        company,
        role,
        creationDate,
      });
      expect(nft.additionalInfo).toEqual({
        extraInfo,
        testInfo,
      });
    });
  });

  it('should be possible to transfer NFT', async () => {
    await deployNftReality();
    const CollectorA = await getAccountAddress('CollectorA');
    const CollectorB = await getAccountAddress('CollectorB');

    await setupNftRealityOnAccount(CollectorA);
    await setupNftRealityOnAccount(CollectorB);

    const itemUuid = '22222222-2222-2222-2222-222222222222';
    const artwork = '1q2w3e4r';
    const logotype = 'q1w2e3r4';
    const description = 'description';
    const creator = 'creator';
    const company = 'company';
    const role = 'role';
    const creationDate = 'creation-date';
    const quantity = 2;

    await mintNftReality(
      itemUuid,
      CollectorA,
      quantity,
      artwork,
      logotype,
      description,
      creator,
      company,
      role,
      creationDate,
      {},
    );

    await shallResolve(getNftRealityById(CollectorA, 0));
    await shallRevert(getNftRealityById(CollectorB, 0));

    await shallPass(transferNftReality(CollectorA, CollectorB, 0));

    await shallRevert(getNftRealityById(CollectorA, 0));
    await shallResolve(getNftRealityById(CollectorB, 0));
  });

  it('should not not be possible to withdraw NFT that does not exist in a collection', async () => {
    await deployNftReality();
    const CollectorA = await getAccountAddress('CollectorA');
    const CollectorB = await getAccountAddress('CollectorB');

    await setupNftRealityOnAccount(CollectorA);
    await setupNftRealityOnAccount(CollectorB);

    await shallRevert(transferNftReality(CollectorA, CollectorB, 9999));
  });
});
