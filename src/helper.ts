import { BigDecimal, BigInt, TypedMap, Address } from '@graphprotocol/graph-ts'


export let BIGINT_ONE = BigInt.fromI32(1)
export let BIGINT_ZERO = BigInt.fromI32(0)
export let BIGDECIMAL_ZERO = BigDecimal.fromString('0')
export let BIGDECIMAL_ONE = BigDecimal.fromString('1')


export let ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'

export function isZeroAddress(value: Address): boolean {
  return value.toHex() == ZERO_ADDRESS
}