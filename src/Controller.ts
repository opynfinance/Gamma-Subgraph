import { BigInt, Address, store } from '@graphprotocol/graph-ts';
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
  VaultOpened__Params,
} from '../generated/Controller/Controller';
import { Entity } from '@graphprotocol/graph-ts';

import { BIGINT_ONE, BIGDECIMAL_ZERO, BIGDECIMAL_ONE } from './helper';

import {
  Operator,
  Account,
  AccountOperator,
  Vault,
  OpenVaultAction,
  DepositCollateralAction,
  WithdrawCollateralAction,
  DepositLongAction,
  WithdrawLongAction,
  BurnShortAction,
  MintShortAction,
} from '../generated/schema';

function loadOrCreateAccount(accountId: string): Account {
  let account = Account.load(accountId);
  // if no account, create new entity
  if (account == null) {
    account = new Account(accountId);
    account.operatorCount = new BigInt(0);
    account.vaultCount = new BigInt(0);
  }
  return account as Account;
}

function loadOrCreateOperator(operatorId: string): Operator {
  let operator = Operator.load(operatorId);
  // if no operator, create new entity
  if (operator == null) {
    operator = new Operator(operatorId);
    operator.accountCount = new BigInt(0);
  }
  return operator as Operator;
}

export function handleAccountOperatorUpdated(event: AccountOperatorUpdated): void {
  let accountId = event.params.accountOwner.toHex();
  let operatorId = event.params.operator.toHex();
  let isSet = event.params.isSet;

  let account = loadOrCreateAccount(accountId);
  let operator = loadOrCreateOperator(operatorId);

  let relationId = accountId + '-' + operatorId;
  let relation = AccountOperator.load(relationId);

  if (isSet && relation == null) {
    // adding a new  operator
    relation = new AccountOperator(relationId);
    relation.account = accountId;
    relation.operator = operatorId;
    relation.save();
    account.operatorCount = account.operatorCount.plus(BIGINT_ONE);
    operator.accountCount = operator.accountCount.plus(BIGINT_ONE);
  } else if (!isSet && relation != null) {
    store.remove('AccountOperator', relationId);
    account.operatorCount = account.operatorCount.minus(BIGINT_ONE);
    operator.accountCount = operator.accountCount.minus(BIGINT_ONE);
  }

  account.save();
  operator.save();
}

export function handleCallExecuted(event: CallExecuted): void {}

export function handleCallRestricted(event: CallRestricted): void {}

export function handleCollateralAssetDeposited(event: CollateralAssetDeposited): void {
  let accountId = event.params.accountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.asset;
  let from = event.params.from;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.collateralAsset = asset;
  vault.collateralAmount = vault.collateralAmount.plus(amount);
  vault.save();

  // create action entity
  let actionId =
    'DEPOSIT-COLLATERAL-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new DepositCollateralAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // DepositCollaralAction fields
  action.from = from;
  action.asset = asset;
  action.amount = amount;
  action.save();
}

export function handleCollateralAssetWithdrawed(event: CollateralAssetWithdrawed): void {
  let accountId = event.params.AccountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.asset;
  let to = event.params.to;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.collateralAsset = asset;
  vault.collateralAmount = vault.collateralAmount.minus(amount);
  vault.save();

  // create action entity
  let actionId =
    'WITHDRAW-COLLATERAL-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new WithdrawCollateralAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // DepositCollaralAction fields
  action.to = to;
  action.asset = asset;
  action.amount = amount;
  action.save();
}

export function handleFullPauserUpdated(event: FullPauserUpdated): void {}

export function handleLongOtokenDeposited(event: LongOtokenDeposited): void {
  let accountId = event.params.accountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.otoken;
  let from = event.params.from;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.longOToken = asset.toString();
  vault.longAmount = vault.longAmount.plus(amount);
  vault.save();

  // create action entity
  let actionId = 'DEPOSIT-LONG-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new DepositLongAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // DepositLong fields
  action.from = from;
  action.oToken = asset.toString();
  action.amount = amount;
  action.save();
}

export function handleLongOtokenWithdrawed(event: LongOtokenWithdrawed): void {
  let accountId = event.params.AccountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.otoken;
  let to = event.params.to;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.longOToken = asset.toString();
  vault.longAmount = vault.longAmount.minus(amount);
  vault.save();

  // create action entity
  let actionId =
    'WITHDRAW-LONG-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new WithdrawLongAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // WithdrawLong fields
  action.to = to;
  action.oToken = asset.toString();
  action.amount = amount;
  action.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {}

export function handlePartialPauserUpdated(event: PartialPauserUpdated): void {}

export function handleRedeem(event: Redeem): void {}

export function handleShortOtokenBurned(event: ShortOtokenBurned): void {
  let accountId = event.params.AccountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.otoken;
  let from = event.params.from;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.shortOToken = asset.toString(); // convert to id
  vault.shortAmount = vault.shortAmount.minus(amount);
  vault.save();

  // create action entity
  let actionId = 'BURN-SHORT-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new BurnShortAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // DepositLong fields
  action.from = from;
  action.oToken = asset.toString();
  action.amount = amount;
  action.save();
}

export function handleShortOtokenMinted(event: ShortOtokenMinted): void {
  let accountId = event.params.AccountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.otoken;
  let to = event.params.to;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.shortOToken = asset.toString(); // convert to id
  vault.shortAmount = vault.shortAmount.plus(amount);
  vault.save();

  // create action entity
  let actionId = 'MINT-SHORT-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new MintShortAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // MintShort fields
  action.to = to;
  action.oToken = asset.toString();
  action.amount = amount;
  action.save();
}

export function handleSystemFullyPaused(event: SystemFullyPaused): void {}

export function handleSystemPartiallyPaused(event: SystemPartiallyPaused): void {}

export function handleVaultOpened(event: VaultOpened): void {
  let accountId = event.params.accountOwner.toHex();
  let id = event.params.vaultId;

  // update the account entity
  let account = loadOrCreateAccount(accountId);
  account.vaultCount = account.vaultCount.plus(BIGINT_ONE);
  account.save();

  // create and initializd a vault entity
  let vaultId = accountId + '-' + id.toString();
  let vault = new Vault(vaultId);

  vault.owner = accountId;
  vault.vaultId = id!;

  vault.save();

  // create action entity
  let actionId = 'VAULT-OPENED-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new OpenVaultAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  action.save();
}

export function handleVaultSettled(event: VaultSettled): void {}

// function addVaultFields(action:Entity, vaultId:string, event) : any {

// }
