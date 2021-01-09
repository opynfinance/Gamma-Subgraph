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
  let position = loadOrCreatePosition(buyer, oToken)
  position.amount = position.amount.plus(amount);
  let transactions = position.transactions 
  transactions.push(tradeId)
  position.transactions = transactions
  position.save()
}

export function updateSellerPosition(seller: Address, oToken: string, amount: BigInt, tradeId: string): void {
  let position = loadOrCreatePosition(seller, oToken)
  position.amount = position.amount.minus(amount);
  let transactions = position.transactions 
  transactions.push(tradeId)
  position.transactions = transactions
  position.save()
}

export function loadOrCreatePosition(user: Address, oToken: string): Position {
  let id = user.toHex() + '-' + oToken
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