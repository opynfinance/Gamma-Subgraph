import { BigInt } from "@graphprotocol/graph-ts"
import { store } from '@graphprotocol/graph-ts'
import {
  Controller,
  AccountOperatorUpdated,
  CallExecuted,
  CallRestricted,
  CollateralAssetDeposited,
  CollateralAssetWithdrawed,
  FullPauserUpdated,
  LongOtokenDeposited,
  LongOtokenWithdrawed,
  OwnershipTransferred,
  PartialPauserUpdated,
  Redeem,
  ShortOtokenBurned,
  ShortOtokenMinted,
  SystemFullyPaused,
  SystemPartiallyPaused,
  VaultOpened,
  VaultSettled
} from "../generated/Controller/Controller"
import { log } from '@graphprotocol/graph-ts'

import { BIGINT_ONE, BIGDECIMAL_ZERO } from './helper'

import {
  Operator, Account, AccountOperator
} from '../generated/schema'

export function handleAccountOperatorUpdated(
  event: AccountOperatorUpdated
): void {
  let accountId = event.params.accountOwner.toHex()
  let operatorId = event.params.operator.toHex()
  let isSet = event.params.isSet

  let account = Account.load(accountId)
  let operator = Operator.load(operatorId)

  // if no account, create new entity
  if (account == null) {
    account = new Account(accountId)
    account.operatorCount = new BigInt(0)
    account.vaultCount = new BigInt(0)
  }

  if (operator == null ) {
    operator = new Operator(operatorId)
    operator.accountCount = new BigInt(0)
  }

  let relationId = accountId + '-' + operatorId
  let relation = AccountOperator.load(relationId)  

  if (isSet && relation == null) { // adding a new  operator
    relation = new AccountOperator(relationId)
    relation.account = accountId
    relation.operator = operatorId
    relation.save()
    account.operatorCount = account.operatorCount.plus(BIGINT_ONE);
    operator.accountCount = operator.accountCount.plus(BIGINT_ONE);
  } else if (!isSet && relation != null) {
    store.remove('AccountOperator', relationId)
    account.operatorCount = account.operatorCount.minus(BIGINT_ONE);
    operator.accountCount = operator.accountCount.minus(BIGINT_ONE);
  }
  
  account.save()
  operator.save()
}

export function handleCallExecuted(event: CallExecuted): void {}

export function handleCallRestricted(event: CallRestricted): void {}

export function handleCollateralAssetDeposited(
  event: CollateralAssetDeposited
): void {}

export function handleCollateralAssetWithdrawed(
  event: CollateralAssetWithdrawed
): void {}

export function handleFullPauserUpdated(event: FullPauserUpdated): void {}

export function handleLongOtokenDeposited(event: LongOtokenDeposited): void {}

export function handleLongOtokenWithdrawed(event: LongOtokenWithdrawed): void {}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePartialPauserUpdated(event: PartialPauserUpdated): void {}

export function handleRedeem(event: Redeem): void {}

export function handleShortOtokenBurned(event: ShortOtokenBurned): void {}

export function handleShortOtokenMinted(event: ShortOtokenMinted): void {}

export function handleSystemFullyPaused(event: SystemFullyPaused): void {}

export function handleSystemPartiallyPaused(
  event: SystemPartiallyPaused
): void {}

export function handleVaultOpened(event: VaultOpened): void {}

export function handleVaultSettled(event: VaultSettled): void {}
