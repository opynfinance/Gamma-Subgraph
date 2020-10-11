import { BigInt } from "@graphprotocol/graph-ts"
import { OTokenFactory, OtokenCreated } from "../generated/OTokenFactory/OTokenFactory"
import { OToken as OTokenSource } from "../generated/templates"
import { OToken } from "../generated/schema"

export function handleOtokenCreated(event: OtokenCreated): void {

  // Start indeing the newly created OToken contract
  OTokenSource.create(event.params.tokenAddress)

  // Create Otoken Entity
  let entity = new OToken(event.params.tokenAddress.toHex())

  entity.underlyingAsset = event.params.underlying
  entity.strikeAsset = event.params.strike
  entity.collateralAsset = event.params.collateral
  entity.strikePrice = event.params.strikePrice
  entity.isPut = event.params.isPut
  entity.expiryTimestamp = event.params.expiry
  entity.creator = event.params.creator

  entity.totalSupply = BigInt.fromI32(0)
  entity.createdAt = event.block.timestamp
  entity.createdTx = event.transaction.hash

  entity.save()
}
