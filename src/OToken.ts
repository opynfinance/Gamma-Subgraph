import { BigInt } from "@graphprotocol/graph-ts"
import { Approval, Transfer } from "../generated/templates/OToken/OToken"

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

import { OToken } from '../generated/schema'

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {
  // Load oToken entity
  let entity = OToken.load(event.address.toHex())

  if (event.params.from.toHex() == ZERO_ADDRESS) {
    // Mint event
    entity.totalSupply = entity.totalSupply.plus(event.params.value)
  } else if (event.params.to.toHex() == ZERO_ADDRESS) {
    // Burn event
    entity.totalSupply = entity.totalSupply.minus(event.params.value)
  }

  entity.save()
}
