import { Approval, Transfer } from "../generated/templates/OToken/OToken"

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

import { OToken, AccountBalance } from '../generated/schema'
import { Address } from "@graphprotocol/graph-ts"
import { BIGINT_ZERO } from "./helper"

export function handleApproval(event: Approval): void {}

export function handleTransfer(event: Transfer): void {
  // Load oToken entity
  let entity = OToken.load(event.address.toHex())
  let amount = event.params.value

  if (event.params.from.toHex() == ZERO_ADDRESS) {
    // Mint Operation
    entity.totalSupply = entity.totalSupply.plus(amount)
    // update account balance
    let accountBalance = getOrCreateAccount(event.params.to, entity as OToken)
    accountBalance.balance = accountBalance.balance.plus(amount)
    accountBalance.save()

  } else if (event.params.to.toHex() == ZERO_ADDRESS) {
    // Burn event
    entity.totalSupply = entity.totalSupply.minus(event.params.value)

    let accountBalance = getOrCreateAccount(event.params.from, entity as OToken)
    accountBalance.balance = accountBalance.balance.minus(amount)
    accountBalance.save()
  } else {
    // Transfer from sourceAccount to desinationAccount
    let sourceAccount = getOrCreateAccount(event.params.from, entity as OToken)
    sourceAccount.balance = sourceAccount.balance.minus(amount)
    sourceAccount.save()

    let destinationAccount = getOrCreateAccount(event.params.to, entity as OToken)
    destinationAccount.balance = destinationAccount.balance.plus(amount)
    destinationAccount.save()
  }

  entity.save()
}

function getOrCreateAccount(address: Address, token: OToken): AccountBalance {
  let entityId = address.toHex() + '-' + token.id;
  let accountBalance = AccountBalance.load(entityId)
  if (accountBalance != null) return accountBalance as AccountBalance

  accountBalance = new AccountBalance(entityId)
  
  accountBalance.token = token.id;
  accountBalance.account = address.toHex()
  accountBalance.balance = BIGINT_ZERO

  return accountBalance as AccountBalance
}