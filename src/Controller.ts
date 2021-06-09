import { BigInt, store } from '@graphprotocol/graph-ts';
import {
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
  VaultOpened1,
  VaultSettled,
  VaultSettled1,
  VaultLiquidated,
} from '../generated/Controller/Controller';

import { BIGINT_ONE, BIGINT_ZERO, loadOrCreateAccount } from './helper';

import {
  Controller,
  Operator,
  AccountOperator,
  Vault,
  OpenVaultAction,
  DepositCollateralAction,
  WithdrawCollateralAction,
  DepositLongAction,
  WithdrawLongAction,
  BurnShortAction,
  MintShortAction,
  SettleAction,
  RedeemAction,
  OToken,
  Liquidation
} from '../generated/schema';

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

/**
 * System Settings
 */

export function handleCallRestricted(event: CallRestricted): void {
  let controller = Controller.load('1');
  controller.callRestricted = event.params.isRestricted;
  controller.save();
}

export function handleOwnershipTransferred(event: OwnershipTransferred): void {
  let controller = Controller.load('1');
  controller.owner = event.params.newOwner;
  controller.save();
}

export function handlePartialPauserUpdated(event: PartialPauserUpdated): void {
  let controller = Controller.load('1');
  controller.partialPauser = event.params.newPartialPauser;
  controller.save();
}

export function handleFullPauserUpdated(event: FullPauserUpdated): void {
  let controller = Controller.load('1');
  controller.fullPauser = event.params.newFullPauser;
  controller.save();
}

export function handleSystemFullyPaused(event: SystemFullyPaused): void {
  let controller = Controller.load('1');
  // Todo: update the event parameter name {isActive}
  controller.systemPartiallyPaused = event.params.isPaused;
  controller.save();
}

export function handleSystemPartiallyPaused(event: SystemPartiallyPaused): void {
  let controller = Controller.load('1');
  // Todo: update the event parameter name {isActive}
  controller.systemFullyPaused = event.params.isPaused;
  controller.save();
}

/**
 * Vault Actions
 */

export function handleCollateralAssetDeposited(event: CollateralAssetDeposited): void {
  let accountId = event.params.accountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.asset;
  let from = event.params.from;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.collateralAsset = asset.toHex();
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
  action.asset = asset.toHex();
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

  vault.collateralAsset = vault.collateralAmount.minus(amount).isZero() ? null : asset.toHex();
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
  action.asset = asset.toHex();
  action.amount = amount;
  action.save();
}

export function handleLiquidation(event: VaultLiquidated):void {
  let accountId = event.params.vaultOwner.toHex();
  let id = event.params.vaultId;
  
  let collateralPayout = event.params.collateralPayout
  let debtAmount = event.params.debtAmount

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.shortAmount = vault.shortAmount.minus(debtAmount)
  vault.collateralAmount = vault.collateralAmount.minus(collateralPayout)

  vault.save();

  // create action entity
  let actionId = 'LIQUIDATION' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new Liquidation(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // Liquidation fields
  action.auctionPrice = event.params.auctionPrice;
  action.auctionStartingRound = event.params.auctionStartingRound;
  action.collateralPayout = collateralPayout
  action.debtAmount = debtAmount
  action.liquidator = event.params.liquidator
  action.save();
}

export function handleLongOtokenDeposited(event: LongOtokenDeposited): void {
  let accountId = event.params.accountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.otoken;
  let from = event.params.from;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);
  vault.longOToken = asset.toHex();
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
  action.oToken = asset.toHex();
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
  // if amount = 0, set the longOtoken back to null
  vault.longOToken = vault.longAmount.minus(amount).isZero() ? null : asset.toHex();
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
  action.oToken = asset.toHex();
  action.amount = amount;
  action.save();
}

export function handleRedeem(event: Redeem): void {
  // Create Redeem Action to keep track of this event.
  let actionId = 'REDEEM-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new RedeemAction(actionId);
  action.id = actionId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  action.messageSender = event.transaction.from;
  action.oToken = event.params.otoken.toHex();
  action.otokenBurned = event.params.otokenBurned;
  action.payoutAsset = event.params.collateralAsset.toHex();
  action.payoutAmount = event.params.payout;
  action.receiver = event.params.receiver;
  action.save();
}

export function handleShortOtokenBurned(event: ShortOtokenBurned): void {
  let accountId = event.params.AccountOwner.toHex();
  let id = event.params.vaultId;
  let asset = event.params.otoken;
  let from = event.params.from;
  let amount = event.params.amount;

  // update vault struct
  let vaultId = accountId + '-' + id.toString();
  let vault = Vault.load(vaultId);

  // if amount = 0, set the longOtoken back to null
  vault.shortOToken = vault.shortAmount.minus(amount).isZero() ? null : asset.toHex(); // convert to id
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
  action.oToken = asset.toHex();
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
  vault.shortOToken = asset.toHex(); // convert to id
  // if this is the first time creating a short position, mark the timestamp
  if (vault.shortAmount == null || vault.shortAmount.isZero()) {
    vault.firstMintTimestamp = event.block.timestamp;
  }
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
  action.oToken = asset.toHex();
  action.amount = amount;
  action.save();
}

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
  vault.vaultId = id;
  // old vault always has type 0
  vault.type = BIGINT_ZERO;
  vault.firstMintTimestamp = BIGINT_ZERO;

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

export function handleVaultOpenedV2(event: VaultOpened1): void {
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
  vault.vaultId = id;
  vault.type = event.params.vaultType;
  vault.firstMintTimestamp = BIGINT_ZERO;

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

export function handleVaultSettledV2(event: VaultSettled1): void {
  let id = event.params.vaultId;
  let accountId = event.params.accountOwner.toHex();

  let vaultId = accountId + '-' + id.toString();

  // create action entity
  let actionId = 'SETTLE-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new SettleAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  
  let vault = Vault.load(vaultId);

  action.long = vault.longOToken;
  action.short = vault.shortOToken;
  action.longAmount = vault.longAmount;
  action.shortAmount = vault.shortAmount;
  action.collateral = vault.collateralAsset;
  action.collateralAmount = vault.collateralAmount;

  action.to = event.params.to;
  action.amount = event.params.payout;
  action.save();

  // update vault struct
  vault.collateralAsset = null;
  vault.collateralAmount = BIGINT_ZERO;
  vault.shortOToken = null;
  vault.shortAmount = BIGINT_ZERO;
  vault.longOToken = null;
  vault.longAmount = BIGINT_ZERO;
  vault.save();
}

export function handleVaultSettled(event: VaultSettled): void {
  let id = event.params.vaultId;
  let accountId = event.params.AccountOwner.toHex();

  let vaultId = accountId + '-' + id.toString();

  // create action entity
  let actionId = 'SETTLE-' + event.transaction.hash.toHex() + '-' + event.logIndex.toString();
  let action = new SettleAction(actionId);
  action.messageSender = event.transaction.from;
  action.vault = vaultId;
  action.block = event.block.number;
  action.transactionHash = event.transaction.hash;
  action.timestamp = event.block.timestamp;
  // Settle fields
  let otoken = OToken.load(event.params.otoken.toHex());

  let vault = Vault.load(vaultId);

  action.long = vault.longOToken;
  action.short = vault.shortOToken;
  action.longAmount = vault.longAmount;
  action.shortAmount = vault.shortAmount;
  action.collateral = vault.collateralAsset;
  action.collateralAmount = vault.collateralAmount;

  action.to = event.params.to;
  action.amount = event.params.payout;
  action.save();

  // update vault struct
  vault.collateralAsset = null;
  vault.collateralAmount = BIGINT_ZERO;
  vault.shortOToken = null;
  vault.shortAmount = BIGINT_ZERO;
  vault.longOToken = null;
  vault.longAmount = BIGINT_ZERO;
  vault.save();
}
