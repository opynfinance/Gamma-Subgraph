import { LimitOrderFilled } from "../generated/zxExchange/ZxExchange"
import { Whitelist as WhitelistContract } from "../generated/Whitelist/Whitelist"
import { AddressBook as AddressBookContract } from "../generated/AddressBook/AddressBook"
import { FillOrder, Controller, OTokenTrade } from '../generated/schema'
import { Address } from "@graphprotocol/graph-ts"
import { checkERC20Entity } from "./Whitelist"
import { updateBuyerPosition, updateSellerPosition } from './helper'

export function handleFillOrder(event: LimitOrderFilled): void {
  let id = event.params.orderHash.toHex() + '-' + event.transaction.hash.toHex()

  let makerAssetAddr = event.params.makerToken
  let takerAssetAddr = event.params.takerToken

  // get addressBook address
  let controller = Controller.load('1')

  let makerAssetIsOToken = false
  let takerAssetIsOToken = false

  let addressBook = AddressBookContract.bind(Address.fromString(controller.addressBook.toHex()))
    let whitelistAddr = addressBook.getWhitelist()
    let whitelistContract = WhitelistContract.bind(whitelistAddr)

    makerAssetIsOToken = whitelistContract.isWhitelistedOtoken(makerAssetAddr)
    takerAssetIsOToken = whitelistContract.isWhitelistedOtoken(takerAssetAddr)
  
  if (!makerAssetIsOToken && !takerAssetIsOToken) return

  // Record Fill event

  let fill = new FillOrder(id)
  fill.transactionHash = event.transaction.hash;
  fill.timestamp = event.block.timestamp
  fill.makerAddress = event.params.maker
  fill.takerAddress = event.params.taker
  // fill.senderAddress = event.params.sender
  fill.makerAssetAmount = event.params.makerTokenFilledAmount
  fill.takerAssetAmount = event.params.takerTokenFilledAmount
  fill.protocolFeePaid = event.params.protocolFeePaid
  fill.makerAsset = makerAssetAddr.toString();
  fill.takerAsset = takerAssetAddr.toString();
  
  fill.save()

  // convert to an OTokenTrade entity
  let trade = new OTokenTrade(id)
  trade.exchange = 'ZeroX'
  trade.timestamp = event.block.timestamp
  trade.transactionHash = event.transaction.hash;

  let seller: Address
  let buyer: Address

  if(makerAssetIsOToken) { // maker asset is oToken, maker is seller
    seller = event.params.maker
    buyer = event.params.taker

    trade.oToken = makerAssetAddr.toString()
    trade.oTokenAmount = event.params.makerTokenFilledAmount
    checkERC20Entity(takerAssetAddr)
    trade.paymentToken = takerAssetAddr.toString()
    trade.paymentTokenAmount = event.params.takerTokenFilledAmount
  } else { // taker asset is oToken. Taker is seller
    
    seller = event.params.taker
    buyer = event.params.maker

    trade.oToken = takerAssetAddr.toString();
    trade.oTokenAmount = event.params.takerTokenFilledAmount
    checkERC20Entity(makerAssetAddr)
    trade.paymentToken = makerAssetAddr.toString();
    trade.paymentTokenAmount = event.params.makerTokenFilledAmount
  }

  trade.seller = seller
  trade.buyer = buyer

  trade.save()

  // updateBuyerPosition(buyer, trade.oToken, trade.oTokenAmount, id);
  // updateSellerPosition(seller, trade.oToken, trade.oTokenAmount, id);

}