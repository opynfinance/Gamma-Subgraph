import { fillOrder } from "../generated/0xExchange/0xExchange"

import { FilledOrder } from '../generated/schema'


export function handleFillOrder(event: fillOrder): void {
  let id = event.params.orderHash.toHex()
  let order = new FilledOrder(id)
  order.makerAddress = event.params.makerAddress
  order.takerAddress = event.params.takerAddress
  order.senderAddress = event.params.senderAddress
  order.makerAssetAmount = event.params.makerAssetAmount
  order.takerAssetAmount = event.params.takerAssetAmount
  order.expirationTimeSeconds = event.params.expirationTimeSeconds
  order.makerAssetData = event.params.makerAssetData
  order.takerAssetData = event.params.takerAssetData
  order.save()
}