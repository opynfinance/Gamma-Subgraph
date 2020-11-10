# Gamma (Opyn v2) Subgraph

Official subgraph(s) for opyn v2.

* [Gamma Rinkeby](https://thegraph.com/explorer/subgraph/antoncoding/gamma-rinkeby)
* [Gamma Kovan](https://thegraph.com/explorer/subgraph/antoncoding/gamma-kovan)

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

### Rinkeby

```shell
npm run deploy:rinkeby
```

### Kovan

```shell
npm run deploy:kovan
```

### Other network

Deploy the [opyn contracts](https://github.com/opynfinance/GammaProtocol) on the desired network, and udpate the contract addresses in `config/{network}.json`

## Deploy to custom subgraph endpoint

Change `antoncoding/gamma-rinkeby` in `package.json` to your subgraph id.