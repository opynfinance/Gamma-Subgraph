import {Address } from "@graphprotocol/graph-ts"
import {
  CalleeBlacklisted,
  CalleeWhitelisted,
  CollateralBlacklisted,
  CollateralWhitelisted,
  OtokenBlacklisted,
  OtokenWhitelisted,
  OwnershipTransferred,
  ProductBlacklisted,
  ProductWhitelisted
} from "../generated/Whitelist/Whitelist"
import { ERC20 as ERC20Contract } from "../generated/OTokenFactory/ERC20"
import { ERC20, WhitelistedProduct } from "../generated/schema"
import { log } from '@graphprotocol/graph-ts'

// const blacklistedPaymentTokens = ['0xb7a4f3e9097c08da09517b5ab877f7a917224ede']

export function handleCalleeBlacklisted(event: CalleeBlacklisted): void {}

export function handleCalleeWhitelisted(event: CalleeWhitelisted): void {}

export function handleCollateralBlacklisted(
  event: CollateralBlacklisted
): void {}

export function handleCollateralWhitelisted(
  event: CollateralWhitelisted
): void {}

export function handleOtokenBlacklisted(event: OtokenBlacklisted): void {}

export function handleOtokenWhitelisted(event: OtokenWhitelisted): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handleProductBlacklisted(event: ProductBlacklisted): void {
  let entity = getProductEntity(event.params.underlying, event.params.strike, event.params.collateral, event.params.isPut)  
  entity.isWhitelisted = false;
  entity.save()
}

export function handleProductWhitelisted(event: ProductWhitelisted): void {
  let entity = getProductEntity(event.params.underlying, event.params.strike, event.params.collateral, event.params.isPut)  
  entity.isWhitelisted = true;
  entity.save()
}

function getProductEntity(underlying: Address, strike: Address, collateral: Address, isPut:boolean): WhitelistedProduct {
  log.info('getProduct Entity with: {}, {}, {}', [
    underlying.toString(),
    strike.toString(),
    collateral.toString(),
  ])
  checkERC20Entity(underlying)
  checkERC20Entity(strike)
  checkERC20Entity(collateral)

  let id = getProductId(underlying, strike, collateral, isPut)
  let entity = WhitelistedProduct.load(id)

  if (entity != null) return entity as WhitelistedProduct

  let newEntity = new WhitelistedProduct(id)
  
  newEntity.underlying = underlying.toHex()
  newEntity.strike = strike.toHex()
  newEntity.collateral = collateral.toHex()
  newEntity.isPut = isPut

  return newEntity
}

function getProductId(underlying:Address, strike:Address, collateral:Address, isPut: boolean) : string {
  return underlying.toHex() + '-' + strike.toHex() + '-' + collateral.toHex() + '-' + isPut.toString();
}

/**
 * Make sure the ERC20 entity exist
 * @param address 
 */
export function checkERC20Entity(address: Address): void {
  let entity = ERC20.load(address.toHex())
  if (entity != null) return

  log.info('checkERC20Entity createERC20 Entity {} start', [
    address.toString(),
  ])
  
  entity = new ERC20(address.toHex())
  let contract = ERC20Contract.bind(address)
  entity.symbol = contract.symbol()
  entity.name = contract.name()
  entity.decimals = contract.decimals()
  entity.save();

  log.info('checkERC20Entity createERC20 Entity {} done', [
    address.toString(),
  ])
}