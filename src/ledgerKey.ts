/*
 * Copyright (C) 2018 The ontology Authors
 * This file is part of The ontology library.
 *
 * The ontology is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The ontology is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with The ontology.  If not, see <http://www.gnu.org/licenses/>.
 */
import * as elliptic from 'elliptic';
import { Crypto, Transaction } from 'ontology-ts-sdk';
import { computesSignature, getPublicKey } from './ledgerProxy';

import Address = Crypto.Address;
import CurveLabel = Crypto.CurveLabel;
import JsonKey = Crypto.JsonKey;
import KeyParameters = Crypto.KeyParameters;
import KeyType = Crypto.KeyType;
import PrivateKey = Crypto.PrivateKey;
import PublicKey = Crypto.PublicKey;
import Signable = Crypto.Signable;
import Signature = Crypto.Signature;
import SignatureScheme = Crypto.SignatureScheme;

export interface LedgerKey extends PrivateKey {
    publicKey: PublicKey;   // transient

    index: number;
    neo: boolean;

    type: 'LEDGER';
}

export async function create(index: number, neo: boolean): Promise<LedgerKey> {
    const uncompressed = await getPublicKey(index, neo);

    const ec = new elliptic.ec(CurveLabel.SECP256R1.preset);
    const keyPair = ec.keyFromPublic(uncompressed, 'hex');
    const compressed = keyPair.getPublic(true, 'hex');

    return createExisting(index, neo, compressed);
}

export function createExisting(index: number, neo: boolean, pKey: string): LedgerKey {
    const privateKey = new PrivateKey('', KeyType.ECDSA, new KeyParameters(CurveLabel.SECP256R1));
    const ledgerKey = privateKey as LedgerKey;

    ledgerKey.index = index;
    ledgerKey.neo = neo;
    ledgerKey.publicKey = new PublicKey(pKey, privateKey.algorithm, privateKey.parameters);
    ledgerKey.type = 'LEDGER';

    /**
     * Synchronious signing is not supported with Ledger. Use signAsync instead.
     */
    ledgerKey.sign = function sign(msg: string | Signable, schema?: SignatureScheme, publicKeyId?: string): Signature {
        throw new Error('Synchronious signing is not supported with Ledger.');
    };

    /**
     * Signs the data with the Ledger HW.
     *
     * If the signature schema is not provided, the default schema for this key type is used.
     *
     * @param msg Hex encoded input data
     * @param schema Signing schema to use
     * @param publicKeyId Id of public key
     */
    // tslint:disable-next-line:max-line-length
    ledgerKey.signAsync = async function signAsync(msg: string | Signable, schema?: SignatureScheme, publicKeyId?: string): Promise<Signature> {
        if (schema === undefined) {
            schema = SignatureScheme.ECDSAwithSHA256;
        }

        if (!this.isSchemaSupported(schema)) {
            throw new Error('Signature schema does not match key type.');
        }

        // retrieves content to sign if not provided directly
        if (msg instanceof Transaction) {
            msg = msg.serializeUnsignedData();
        } else {
            throw new Error('Only Transaction signature is supported in ledger');
        }

        const signed = await computesSignature(this.index, neo, msg);

        return new Signature(schema, signed, publicKeyId);
    };

    /**
     * Derives Public key out of Private key.
     *
     * Uses cached public key, so no further communication with the Ledger HW is necessary.
     */
    ledgerKey.getPublicKey = function getPublicKey2(): PublicKey {
        return this.publicKey;
    };

    /**
     * Only ECDSAwithSHA256 is supported for Ledger key.
     */
    ledgerKey.isSchemaSupported = function isSchemaSupported(schema: SignatureScheme): boolean {
        return schema === SignatureScheme.ECDSAwithSHA256;
    };

    /**
     * Gets JSON representation of the Ledger Key.
     */
    ledgerKey.serializeJson = function serializeJson(): JsonKey {
        return {
            algorithm: this.algorithm.label,
            external: {
                index: this.index,
                neo: this.index,
                pKey: this.publicKey.key,
                type: 'LEDGER'
            },
            parameters: this.parameters.serializeJson(),
            key: null
        };
    };

    /**
     * Decryption is not supported for Ledger Key. This operation is NOOP.
     */
    ledgerKey.decrypt = function decrypt(keyphrase: string, address: Address, salt: string, params?: any): PrivateKey {
        return this;
    };

    /**
     * Encryption is not supported for Ledger Key. This operation is NOOP.
     */
    ledgerKey.encrypt = function encrypt(keyphrase: string, address: Address, salt: string, params?: any): PrivateKey {
        return this;
    };

    return ledgerKey;
}
