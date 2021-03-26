import { Fill } from '../generated/zxExchange/ZxExchange';
import { Whitelist as WhitelistContract } from '../generated/Whitelist/Whitelist';
import { AddressBook as AddressBookContract } from '../generated/AddressBook/AddressBook';
import { FillOrder, Controller, OTokenTrade, ERC20 } from '../generated/schema';
import { Address } from '@graphprotocol/graph-ts';
import { checkERC20Entity } from './Whitelist';
// import { updateBuyerPosition, updateSellerPosition } from './helper';

export function handleFillOrder(event: Fill): void {
  let id = event.params.orderHash.toHex() + '-' + event.transaction.hash.toHex();

  let makerAssetAddr = '0x' + event.params.makerAssetData.toHex().substr(-40);
  let takerAssetAddr = '0x' + event.params.takerAssetData.toHex().substr(-40);

  // get addressBook address
  let controller = Controller.load('1');

  let makerAssetIsOToken = false;
  let takerAssetIsOToken = false;

  let addressBook = AddressBookContract.bind(Address.fromString(controller.addressBook.toHex()));
  let whitelistAddr = addressBook.getWhitelist();
  let whitelistContract = WhitelistContract.bind(whitelistAddr);

  makerAssetIsOToken = whitelistContract.isWhitelistedOtoken(Address.fromString(makerAssetAddr));
  takerAssetIsOToken = whitelistContract.isWhitelistedOtoken(Address.fromString(takerAssetAddr));

  if (!makerAssetIsOToken && !takerAssetIsOToken) return;

  // Record Fill event

  let fill = new FillOrder(id);
  fill.transactionHash = event.transaction.hash;
  fill.timestamp = event.block.timestamp;
  fill.makerAddress = event.params.makerAddress;
  fill.takerAddress = event.params.takerAddress;
  fill.senderAddress = event.params.senderAddress;
  fill.makerAssetAmount = event.params.makerAssetFilledAmount;
  fill.takerAssetAmount = event.params.takerAssetFilledAmount;
  fill.protocolFeePaid = event.params.protocolFeePaid;
  fill.makerAssetData = event.params.makerAssetData.toHex();
  fill.takerAssetData = event.params.takerAssetData.toHex();

  fill.makerAsset = makerAssetAddr;
  fill.takerAsset = takerAssetAddr;

  fill.save();

  // convert to an OTokenTrade entity
  let trade = new OTokenTrade(id);
  trade.exchange = 'ZeroX';
  trade.timestamp = event.block.timestamp;
  trade.transactionHash = event.transaction.hash;

  let seller: Address;
  let buyer: Address;

  if (makerAssetIsOToken) {
    // maker asset is oToken, maker is seller

    let paymentToken = ERC20.load(takerAssetAddr)
    if (paymentToken == null) return

    // checkERC20Entity(Address.fromString(takerAssetAddr));

    seller = event.params.makerAddress;
    buyer = event.params.takerAddress;

    trade.oToken = makerAssetAddr;
    trade.oTokenAmount = event.params.makerAssetFilledAmount;

    trade.paymentToken = takerAssetAddr;
    trade.paymentTokenAmount = event.params.takerAssetFilledAmount;
  } else {
    // taker asset is oToken. Taker is seller

    let paymentToken = ERC20.load(makerAssetAddr)
    if (paymentToken == null) return
    // checkERC20Entity(Address.fromString(makerAssetAddr));

    seller = event.params.takerAddress;
    buyer = event.params.makerAddress;

    trade.oToken = takerAssetAddr;
    trade.oTokenAmount = event.params.takerAssetFilledAmount;

    trade.paymentToken = makerAssetAddr;
    trade.paymentTokenAmount = event.params.makerAssetFilledAmount;
  }

  trade.seller = seller;
  trade.buyer = buyer;

  trade.save();

  // updateBuyerPosition(buyer, trade.oToken, trade.oTokenAmount, id);
  // updateSellerPosition(seller, trade.oToken, trade.oTokenAmount, id);
}
