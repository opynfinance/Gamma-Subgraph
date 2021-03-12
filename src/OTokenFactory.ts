import { BigInt } from "@graphprotocol/graph-ts"
import { OtokenCreated } from "../generated/OTokenFactory/OTokenFactory"
import { OToken as OTokenSource } from "../generated/templates"
import { OToken as TokenContract } from "../generated/templates/OToken/OToken"
import { AddressBook as AddressBookInterface } from '../generated/AddressBook/AddressBook'
import { OTokenFactory as FactoryInterface } from '../generated/OTokenFactory/OTokenFactory'
import { OToken } from "../generated/schema"

export function handleOtokenCreated(event: OtokenCreated): void {

  // Start indeing the newly created OToken contract
  OTokenSource.create(event.params.tokenAddress)

  // bind to the address that emit the event
  let factoryContract = FactoryInterface.bind(event.address)
  let addressBookAddress = factoryContract.addressBook()
  let addressBookContract = AddressBookInterface.bind(addressBookAddress)
  let implementation = addressBookContract.getOtokenImpl()
  
  // Create Otoken Entity
  let entity = new OToken(event.params.tokenAddress.toHex())

  entity.underlyingAsset = event.params.underlying.toHex()
  entity.strikeAsset = event.params.strike.toHex()
  entity.collateralAsset = event.params.collateral.toHex()
  entity.strikePrice = event.params.strikePrice
  entity.isPut = event.params.isPut
  entity.expiryTimestamp = event.params.expiry
  entity.creator = event.params.creator
  entity.implementation = implementation

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

