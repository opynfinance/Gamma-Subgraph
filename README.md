# Gamma (Opyn v2) Subgraph

Official subgraph(s) for opyn v2.

* [Gamma Mainnet](https://thegraph.com/explorer/subgraph/antoncoding/gamma-mainnet)
* [Gamma Kovan](https://thegraph.com/explorer/subgraph/antoncoding/gamma-kovan-new)

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

You will need an access token for deployment.

```shell
graph auth https://api.thegraph.com/deploy/ <ACCESS_TOKEN>
```

Make sure include the last `/` at the end of the url!

### Mainnet

```shell
npm run deploy:mainnet
```

### Kovan

```shell
npm run deploy:kovan
```

### Other network

Deploy the [opyn contracts](https://github.com/opynfinance/GammaProtocol) on the desired network, and udpate the contract addresses in `config/{network}.json`

## Deploy to custom subgraph endpoint

Change `antoncoding/gamma-subgraph` in `package.json` to your subgraph id.