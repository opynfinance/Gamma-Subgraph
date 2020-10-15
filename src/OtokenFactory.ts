import { BigInt } from "@graphprotocol/graph-ts"
import { OtokenCreated } from "../generated/OTokenFactory/OTokenFactory"
import { OToken as OTokenSource } from "../generated/templates"
import { OToken as TokenContract } from "../generated/templates/OToken/OToken"
import { OToken } from "../generated/schema"

export function handleOtokenCreated(event: OtokenCreated): void {

  // Start indeing the newly created OToken contract
  OTokenSource.create(event.params.tokenAddress)
  
  // Create Otoken Entity
  let entity = new OToken(event.params.tokenAddress.toHex())

  entity.underlyingAsset = event.params.underlying.toHex()
  entity.strikeAsset = event.params.strike.toHex()
  entity.collateralAsset = event.params.collateral.toHex()
  entity.strikePrice = event.params.strikePrice
  entity.isPut = event.params.isPut
  entity.expiryTimestamp = event.params.expiry
  entity.creator = event.params.creator

  let contract = TokenContract.bind(event.params.tokenAddress)
  // Access state variables and functions by calling them
  entity.symbol = contract.symbol()
  entity.name = contract.name()
  entity.decimals = 8

  entity.totalSupply = BigInt.fromI32(0)
  entity.createdAt = event.block.timestamp
  entity.createdTx = event.transaction.hash

  entity.save()
}

