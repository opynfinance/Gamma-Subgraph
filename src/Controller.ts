import { BigInt } from "@graphprotocol/graph-ts"
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


export function handleAccountOperatorUpdated(
  event: AccountOperatorUpdated
): void {}

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
