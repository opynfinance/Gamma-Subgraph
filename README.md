# Gamma (Opyn v2) Subgraph

Official subgraph(s) for opyn v2.

- [Gamma Mainnet](https://thegraph.com/explorer/subgraph/opynfinance/gamma-mainnet)
- [Gamma Kovan](https://thegraph.com/explorer/subgraph/opynfinance/gamma-kovan)

## Install

```shell
npm i
```

## Building the graph

```shell
# compile types
npm run codegen

# build subgraph
npm run build

```

## Deploy

### Get Access Token

You will need an access token for deployment. After you get that on [the graph](https://thegraph.com/explorer/dashboard), you need to run the following command before deploying.

```shell
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
```

Make sure you include the last `/` at the end of the url!

### Mainnet

```shell
npm run deploy:mainnet
```

### Kovan

```shell
npm run deploy:kovan
```

### Deploy on other networks

To deploy this subgraph on a different network, 
you will first need to deploy the [gamma protocol contracts](https://github.com/opynfinance/GammaProtocol) on the desired network, and udpate the contract addresses in `config/{network}.json`

Then run
```shell

# create a subgraph.yaml file
mustache config/<network>.json subgraph.template.yaml > subgraph.yaml

# deploy
graph deploy --node https://api.thegraph.com/deploy/ --ipfs https://api.thegraph.com/ipfs/ <subgraph-name>
```

## Deploy to custom subgraph endpoint

Change `antoncoding/gamma-subgraph-new` in `package.json` to your subgraph id.
