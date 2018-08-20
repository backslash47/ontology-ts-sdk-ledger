
# Ledger extension for Ontology blockchain TypeScript SDK

## Overview

This is an extension of Ontology TypeScript SDK adding the support for managing private keys on Ledger Hardware wallet.

## Installation

### Required Tools and Dependencies

* Node
* Yarn (https://yarnpkg.com/lang/en/docs/install/)

### Developing and Running

Execute these commands in the project's root directory:

Setup:

#### Install yarn
For faster building process and development experience install Yarn

```
npm install --global yarn
```

#### Download
```
git clone 'https://github.com/OntologyCommunityDevelopers/ontology-ts-sdk-ledger.git'
```

#### Development build
This will build the extension with minimum polyfilling for better debug experience.

````
yarn build:dev
````

#### Production build

````
yarn build:prod
````

#### Ledger support
Because Chrome allows communication with the Ledger only from HTTPS loaded page (which chrome extension is not), there is a IFrame based transport implemented. This IFrame needs to be served on HTTPS. The source codes for the IFrame are at https://github.com/OntologyCommunityDevelopers/ledger-forwarder.git . To set the Iframe address make a call to 

````
Ledger.setLedgerTransport(new Ledger.LedgerTransportIframe('https://drxwrxomfjdx5.cloudfront.net/forwarder.html', true));
````

To use your Ledger, you also needs Official Ontology Ledger App installed on your Ledger.

## Built With

* [TypeScript](https://www.typescriptlang.org/) - Used language
* [Node.js](https://nodejs.org) - JavaScript runtime for building and ingest
* [Ontology TypeScript SDK](https://github.com/ontio/ontology-ts-sdk) - The framework used

## Authors

* **Matus Zamborsky** - *Initial work* - [Backslash47](https://github.com/backslash47)

## License

This project is licensed under the ISC License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

Many thanks to the whole Ontology team, who done a great job bringing Ontology to life.
