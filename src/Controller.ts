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
  VaultSettled,
  VaultOpened__Params
} from "../generated/Controller/Controller"
import { log } from '@graphprotocol/graph-ts'

import { BIGINT_ONE, BIGDECIMAL_ZERO, BIGDECIMAL_ONE } from './helper'

import {
  Operator, Account, AccountOperator, Vault
} from '../generated/schema'

function loadOrCreateAccount(accountId: string): Account {
  let account = Account.load(accountId)
  // if no account, create new entity
  if (account == null) {
    account = new Account(accountId)
    account.operatorCount = new BigInt(0)
    account.vaultCount = new BigInt(0)
  }
  return account as Account
}

function loadOrCreateOperator(operatorId: string): Operator {
  let operator =  Operator.load(operatorId)
  // if no operator, create new entity
  if (operator == null ) {
    operator = new Operator(operatorId)
    operator.accountCount = new BigInt(0)
  }
  return operator as Operator
}

export function handleAccountOperatorUpdated(
  event: AccountOperatorUpdated
): void {
  let accountId = event.params.accountOwner.toHex()
  let operatorId = event.params.operator.toHex()
  let isSet = event.params.isSet

  let account = loadOrCreateAccount(accountId)
  let operator = loadOrCreateOperator(operatorId)
  
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

export function handleVaultOpened(event: VaultOpened): void {
  let accountId = event.params.accountOwner.toHex()
  let id = event.params.vaultId

  // update the account entity
  let account = loadOrCreateAccount(accountId)
  account.vaultCount = account.vaultCount.plus(BIGINT_ONE)

  // create and initializd a vault entity
  let vaultId = accountId + '-' + id.toString()
  let vault = new Vault(vaultId)

  vault.owner = accountId;
  vault.vaultId = id!

  vault.shortOTokens = []
  vault.longOTokens = []
  vault.collateralAssets = []
  
  vault.shortAmounts = []
  vault.longAmounts = []
  vault.collateralAmounts = []

  vault.save()
}

export function handleVaultSettled(event: VaultSettled): void {}
