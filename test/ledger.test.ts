import 'babel-polyfill';
import { CONST, Crypto, OntAssetTxBuilder, utils } from 'ontology-ts-sdk';
import Address = Crypto.Address;
import CurveLabel = Crypto.CurveLabel;
import KeyType = Crypto.KeyType;
import SignatureScheme = Crypto.SignatureScheme;
import { create } from '../src/ledgerKey';

// tslint:disable : no-console
describe('test Ledger', () => {

    test('create Ledger key', async () => {
        const key = await create(0);
        const pKey = key.getPublicKey();

        expect(pKey).toBeDefined();
        expect(pKey.key).toBeDefined();
        expect(pKey.algorithm).toBe(KeyType.ECDSA);
        expect(pKey.parameters.curve).toBe(CurveLabel.SECP256R1);
    });

    test('create multiple Ledger keys', async () => {
        const key1 = await create(0, false);
        const pKey1 = key1.getPublicKey();

        const key2 = await create(1, false);
        const pKey2 = key2.getPublicKey();

        expect(pKey1.key === pKey2.key).toBeFalsy();
    });

    test('sign with Ledger and verify', async () => {
        const tx = OntAssetTxBuilder.makeTransferTx(
            'ONT',
            new Address('AZ7iBezpZByGvUmXXdhfvLXM6cnQgXMiR7'),
            new Address('AcprovRtJETffQTFZKEdUrc1tEJebtrPyP'),
            '10',
            '0',
            `${CONST.DEFAULT_GAS_LIMIT}`
        );

        const key = await create(0, false);
        const pKey = key.getPublicKey();

        const signature = await key.signAsync(tx);

        expect(signature.algorithm).toBe(SignatureScheme.ECDSAwithSHA256);
        expect(signature.value).toBeDefined();

        const verifyResult = await pKey.verify(tx, signature);
        expect(verifyResult).toBeTruthy();
    }, 20000);

});
