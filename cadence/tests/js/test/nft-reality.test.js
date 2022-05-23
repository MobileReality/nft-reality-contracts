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
  getRandomMetadata,
  getNftRealityMetadataViewsById,
  getNftRealityAdditionalInfoById,
} from '../src/nft-reality';
import { v4 as uuid } from 'uuid';
import * as faker from 'faker';

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

    const [supply] = await shallResolve(getNftRealitySupply());
    expect(supply).toBe(0);
  });

  it('should be possible to create a new empty NFT Collection', async () => {
    await deployNftReality();

    const Collector = await getAccountAddress('Collector');
    await setupNftRealityOnAccount(Collector);

    const [length] = await shallResolve(getCollectionLength(Collector));
    expect(length).toBe(0);
  });

  it('should be possible to mint nft-reality nfts', async () => {
    await deployNftReality();

    const Collector = await getAccountAddress('Collector');
    await setupNftRealityOnAccount(Collector);

    const itemUuid = uuid();
    const metadata = getRandomMetadata();
    const quantity = 2;
    await shallPass(mintNftReality(itemUuid, Collector, quantity, metadata));

    const [nftCount] = await getCollectionLength(Collector);
    expect(nftCount).toBe(2);

    const [nft1] = await shallResolve(getNftRealityById(Collector, 0));
    const [nft2] = await shallResolve(getNftRealityById(Collector, 1));

    expect(nft1.itemUuid).toBe(itemUuid);
    expect(nft2.itemUuid).toBe(itemUuid);
    expect(nft1.unit).toBe(1);
    expect(nft2.unit).toBe(2);
    expect(nft1.totalUnits).toBe(2);
    expect(nft2.totalUnits).toBe(2);
    expect(nft1.metadata).toEqual(metadata);
    expect(nft2.metadata).toEqual(metadata);
  });

  it('should be possible to mint nft-reality nfts with additional info', async () => {
    await deployNftReality();

    const Collector = await getAccountAddress('Collector');
    await setupNftRealityOnAccount(Collector);

    const itemUuid = uuid();
    const metadata = getRandomMetadata();
    const quantity = 1;
    const extraInfo = 'extra info';
    const testInfo = 'test info';

    await shallPass(
      mintNftReality(itemUuid, Collector, quantity, metadata, {
        extraInfo,
        testInfo,
      }),
    );

    const [nft] = await getNftRealityById(Collector, 0);
    expect(nft.itemUuid).toBe(itemUuid);
    expect(nft.unit).toBe(1);
    expect(nft.totalUnits).toBe(1);
    expect(nft.metadata).toEqual(metadata);

    const [additionalInfo] = await getNftRealityAdditionalInfoById(
      Collector,
      0,
    );
    expect(additionalInfo).toEqual({
      extraInfo,
      testInfo,
    });
  });

  it('should be possible to read nft-reality nft metadata view', async () => {
    await deployNftReality();

    const Collector = await getAccountAddress('Collector');
    await setupNftRealityOnAccount(Collector);

    const itemUuid = uuid();
    const metadata = getRandomMetadata();
    const quantity = 1;
    await shallPass(mintNftReality(itemUuid, Collector, quantity, metadata));

    const [metadataViews] = await getNftRealityMetadataViewsById(Collector, 0);
    expect(metadataViews.metadata).toEqual({
      itemUuid,
      unit: 1,
      totalUnits: 1,
      ...metadata,
    });
  });

  it('should be possible to read nft-reality nft display view without thumbnail', async () => {
    await deployNftReality();

    const Collector = await getAccountAddress('Collector');
    await setupNftRealityOnAccount(Collector);

    const itemUuid = uuid();
    const metadata = getRandomMetadata();
    const quantity = 1;
    await shallPass(mintNftReality(itemUuid, Collector, quantity, metadata));

    const [metadataViews] = await getNftRealityMetadataViewsById(Collector, 0);
    expect(metadataViews.display).toEqual({
      name: `${metadata.company} - ${metadata.role}`,
      description: metadata.description,
      thumbnail: { url: '' },
    });
  });

  it('should be possible to read nft-reality nft display view with thumbnail', async () => {
    await deployNftReality();

    const Collector = await getAccountAddress('Collector');
    await setupNftRealityOnAccount(Collector);

    const itemUuid = uuid();
    const metadata = getRandomMetadata();
    const artworkThumbnail = faker.random.alphaNumeric(46);
    const additionalInfo = { artworkThumbnail };
    const quantity = 1;
    await shallPass(
      mintNftReality(itemUuid, Collector, quantity, metadata, additionalInfo),
    );

    const [metadataViews] = await getNftRealityMetadataViewsById(Collector, 0);
    expect(metadataViews.display).toEqual({
      name: `${metadata.company} - ${metadata.role}`,
      description: metadata.description,
      thumbnail: {
        cid: artworkThumbnail,
        path: 'artworkThumbnail',
      },
    });
  });

  it('should be possible to transfer NFT', async () => {
    await deployNftReality();
    const CollectorA = await getAccountAddress('CollectorA');
    const CollectorB = await getAccountAddress('CollectorB');

    await setupNftRealityOnAccount(CollectorA);
    await setupNftRealityOnAccount(CollectorB);

    const itemUuid = uuid();
    const metadata = getRandomMetadata();
    const quantity = 2;

    await mintNftReality(itemUuid, CollectorA, quantity, metadata);

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
