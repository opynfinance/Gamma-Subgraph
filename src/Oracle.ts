import { Address } from "@graphprotocol/graph-ts"
import {
  DisputerUpdated,
  ExpiryPriceDisputed,
  ExpiryPriceUpdated,
  OwnershipTransferred,
  PricerDisputePeriodUpdated,
  PricerLockingPeriodUpdated,
  PricerUpdated
} from "../generated/OracleV1/OracleV1"

import {
  Oracle,
  OracleAsset,
  ExpiryPrice,
  OraclePricer
} from '../generated/schema';

import { checkERC20Entity } from './Whitelist'

import { ZERO_ADDRESS, BIGINT_ZERO } from './helper'

export function handleDisputerUpdated(event: DisputerUpdated): void {
  let oracle = Oracle.load('1')
  oracle.disputer = event.params.newDisputer
  oracle.save()
}

export function handleExpiryPriceDisputed(event: ExpiryPriceDisputed): void {
  let id = event.params.asset.toHex().concat('-').concat(event.params.expiryTimestamp.toString()) 
  let priceEntity = ExpiryPrice.load(id)
  priceEntity.price = event.params.newPrice
  // override the reported timestamp by disputed timestamp
  priceEntity.reportedTimestamp = event.params.disputeTimestamp
  priceEntity.reportedTx = event.transaction.hash
  priceEntity.isDisputed = true
  priceEntity.save()
}

export function handleExpiryPriceUpdated(event: ExpiryPriceUpdated): void {
  // create a new ExpiryPrice entity
  let id = event.params.asset.toHex().concat('-').concat(event.params.expiryTimestamp.toString()) 
  let priceEntity = ExpiryPrice.load(id)
  if (priceEntity == null) {
    priceEntity = new ExpiryPrice(id)
  }
  priceEntity.asset = event.params.asset.toHex()
  priceEntity.expiry = event.params.expiryTimestamp
  priceEntity.reportedTimestamp = event.params.onchainTimestamp
  priceEntity.reportedTx = event.transaction.hash
  priceEntity.price = event.params.price
  priceEntity.isDisputed = false
  priceEntity.save()
}

// this event is emitted at construction, we can use this to setup Oracle entity
export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let oracleEntity = new Oracle('1')
  oracleEntity.disputer = Address.fromString(ZERO_ADDRESS)
  oracleEntity.save()
}

export function handlePricerDisputePeriodUpdated(
  event: PricerDisputePeriodUpdated
): void {
  let pricer = loadOrCreatePricerEntity(event.params.pricer.toHex())
  pricer.disputePeriod = event.params.disputePeriod
  pricer.save()
}

export function handlePricerLockingPeriodUpdated(
  event: PricerLockingPeriodUpdated
): void {
  let pricer = loadOrCreatePricerEntity(event.params.pricer.toHex())
  pricer.lockingPeriod = event.params.lockingPeriod
  pricer.save()
}

export function handlePricerUpdated(event: PricerUpdated): void {
  checkERC20Entity(event.params.asset)
  let assetEntity = loadOrCreateAssetEntity(event.params.asset.toHex())
  let pricerId = event.params.pricer.toHex()
  // if no pricer entity created before, create a new one and save
  let pricer = loadOrCreatePricerEntity(pricerId)
  pricer.save()
  assetEntity.pricer = pricerId
  assetEntity.save()
}

function loadOrCreateAssetEntity(assetId: string): OracleAsset {
  let asset = OracleAsset.load(assetId);
  if (asset == null) {
    asset = new OracleAsset(assetId);
    asset.asset = assetId // link to ERC20 entity
  }
  return asset as OracleAsset;
}

function loadOrCreatePricerEntity(pricerId: string): OraclePricer {
  let pricer = OraclePricer.load(pricerId);
  if (pricer == null) {
    pricer = new OraclePricer(pricerId);
    pricer.disputePeriod = BIGINT_ZERO
    pricer.lockingPeriod = BIGINT_ZERO
  }
  return pricer as OraclePricer;
}