import { BigInt } from "@graphprotocol/graph-ts"
import { OtokenFactory, OtokenCreated } from "../generated/OtokenFactory/OtokenFactory"
import { OToken } from "../generated/schema"

export function handleOtokenCreated(event: OtokenCreated): void {
  let entity = new OToken(event.params.tokenAddress.toHex())

  entity.underlyingAsset = event.params.underlying
  entity.strikeAsset = event.params.strike
  entity.collateralAsset = event.params.collateral
  entity.strikePrice = event.params.strikePrice
  entity.isPut = event.params.isPut
  entity.expiryTimestamp = event.params.expiry
  entity.creator = event.params.creator
  entity.totalSupply = BigInt.fromI32(0)

  entity.save()
}
