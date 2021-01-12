import { BigDecimal, BigInt, Bytes, Address } from '@graphprotocol/graph-ts'

import {
  Account,
  Position
} from '../generated/schema';

export let BIGINT_ONE = BigInt.fromI32(1)
export let BIGINT_ZERO = BigInt.fromI32(0)
export let BIGDECIMAL_ZERO = BigDecimal.fromString('0')
export let BIGDECIMAL_ONE = BigDecimal.fromString('1')


export let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function isZeroAddress(value: Address): boolean {
  return value.toHex() == ZERO_ADDRESS
}

export function updateBuyerPosition(buyer: Address, oToken: string, amount: BigInt, tradeId: string): void {
  let initPositionId = BIGINT_ZERO
  let position = loadOrCreatePosition(buyer, oToken, initPositionId)
  // get the first active position for this otoken.
  while (!position.active) {
    initPositionId = initPositionId.plus(BIGINT_ONE)
    position = loadOrCreatePosition(buyer, oToken, initPositionId)
  }
  position.amount = position.amount.plus(amount);
  // set position to inactive (closed) whenever we get back to amount = 0 
  if (position.amount.isZero()) position.active = false

  let transactions = position.transactions 
  transactions.push(tradeId)
  position.transactions = transactions
  position.save()
}

export function updateRedeemerPosition(redeemer: Address, oToken: string, amount: BigInt, tradeId: string): void {
  let initPositionId = BIGINT_ZERO
  let position = loadOrCreatePosition(redeemer, oToken, initPositionId)
  // get the first active position for this otoken.
  while (!position.active) {
    initPositionId = initPositionId.plus(BIGINT_ONE)
    position = loadOrCreatePosition(redeemer, oToken, initPositionId)
  }
  let neg = position.amount.lt(amount)
  position.amount = neg ? amount.minus(position.amount).neg() : position.amount.minus(amount);
  // set position to inactive (closed) whenever we get back to amount = 0 
  

  let redeemActions = position.redeemActions 
  redeemActions.push(tradeId)
  position.redeemActions = redeemActions
  position.save()
}


export function updateSettlerPosition(settler: Address, oToken: string, amount: BigInt, settleId: string): void {
  let initPositionId = BIGINT_ZERO
  let position = loadOrCreatePosition(settler, oToken, initPositionId)
  // get the first active position for this otoken.
  while (!position.active) {
    initPositionId = initPositionId.plus(BIGINT_ONE)
    position = loadOrCreatePosition(settler, oToken, initPositionId)
  }
  
  let neg = position.amount.lt(amount)
  position.amount = neg ? amount.minus(position.amount).neg() : position.amount.minus(amount);
  if (position.amount.isZero()) position.active = false

  let settleActions = position.settleActions 
  settleActions.push(settleId)
  position.settleActions = settleActions
  position.save()
}

export function updateSellerPosition(seller: Address, oToken: string, amount: BigInt, tradeId: string): void {
  let initPositionId = BIGINT_ZERO
  let position = loadOrCreatePosition(seller, oToken, initPositionId)
  // get the first active position for this otoken.
  while (!position.active) {
    initPositionId = initPositionId.plus(BIGINT_ONE)
    position = loadOrCreatePosition(seller, oToken, initPositionId)
  }

  let neg = position.amount.lt(amount)
  position.amount = neg ? amount.minus(position.amount).neg() : position.amount.minus(amount);
  // set position to inactive (closed) whenever we get back to amount = 0 
  if (position.amount.isZero()) position.active = false

  let transactions = position.transactions 
  transactions.push(tradeId)
  position.transactions = transactions
  position.save()
}

export function loadOrCreatePosition(user: Address, oToken: string, numId: BigInt): Position {
  let id = user.toHex() + '-' + oToken + '-' + numId.toString()
  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    // make sure there's an account enitity
    let account = loadOrCreateAccount(user.toHex())
    account.save()
    position.account = user.toHex();

    position.oToken = oToken;
    position.amount = BIGINT_ZERO;
    position.active = true;
    position.transactions = [];
    position.settleActions = []
    position.redeemActions = []

  }
  return position as Position;
}

export function loadOrCreateAccount(accountId: string): Account {
  let account = Account.load(accountId);
  // if no account, create new entity
  if (account == null) {
    account = new Account(accountId);
    account.operatorCount = new BigInt(0);
    account.vaultCount = new BigInt(0);
  }
  return account as Account;
}