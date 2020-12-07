import { Fill } from "../generated/zxExchange/ZxExchange"

import { FillOrder } from '../generated/schema'


export function handleFillOrder(event: Fill): void {
  let id = event.params.orderHash.toHex() + '-' + event.transaction.hash.toHex()
  let fill = new FillOrder(id)
  fill.timestamp = event.block.timestamp;
  fill.makerAddress = event.params.makerAddress
  fill.takerAddress = event.params.takerAddress
  fill.senderAddress = event.params.senderAddress
  fill.makerAssetAmount = event.params.makerAssetFilledAmount
  fill.takerAssetAmount = event.params.takerAssetFilledAmount
  fill.protocolFeePaid = event.params.protocolFeePaid
  fill.makerAssetData = event.params.makerAssetData
  fill.takerAssetData = event.params.takerAssetData
  fill.save()
}