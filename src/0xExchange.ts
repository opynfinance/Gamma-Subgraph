import { Fill } from "../generated/zxExchange/ZxExchange"
import { Whitelist as WhitelistContract } from "../generated/Whitelist/Whitelist"
import { AddressBook as AddressBookContract } from "../generated/AddressBook/AddressBook"
import { FillOrder, Controller } from '../generated/schema'
import { Address } from "@graphprotocol/graph-ts"

export function handleFillOrder(event: Fill): void {
  let id = event.params.orderHash.toHex() + '-' + event.transaction.hash.toHex()

  let makerAssetAddr = '0x' + event.params.makerAssetData.toHex().substr(-40)
  let takerAssetAddr = '0x' + event.params.takerAssetData.toHex().substr(-40)

  // get addressBook address
  let controller = Controller.load('1')

  let makerAssetIsOToken = false
  let takerAssetIsOToken = false

  let addressBook = AddressBookContract.bind(Address.fromString(controller.addressBook.toHex()))
    let whitelistAddr = addressBook.getWhitelist()
    let whitelistContract = WhitelistContract.bind(whitelistAddr)

    makerAssetIsOToken = whitelistContract.isWhitelistedOtoken(Address.fromString(makerAssetAddr))
    takerAssetIsOToken = whitelistContract.isWhitelistedOtoken(Address.fromString(takerAssetAddr))
  
  if (!makerAssetIsOToken && !takerAssetIsOToken) return

  let fill = new FillOrder(id)
  fill.timestamp = event.block.timestamp
  fill.makerAddress = event.params.makerAddress
  fill.takerAddress = event.params.takerAddress
  fill.senderAddress = event.params.senderAddress
  fill.makerAssetAmount = event.params.makerAssetFilledAmount
  fill.takerAssetAmount = event.params.takerAssetFilledAmount
  fill.protocolFeePaid = event.params.protocolFeePaid
  fill.makerAssetData = event.params.makerAssetData.toHex()
  fill.takerAssetData = event.params.takerAssetData.toHex()

  fill.makerAsset = makerAssetAddr
  fill.takerAsset = takerAssetAddr
  
  fill.save()
}