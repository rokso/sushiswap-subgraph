import { Address, ethereum } from '@graphprotocol/graph-ts'

import { BIG_INT_ZERO, KASHI_PAIR_MEDIUM_RISK_TYPE } from '../constants'
import { KashiPair } from '../../../generated/schema'
import { KashiPair as KashiPairContract } from '../../../generated/BentoBox/KashiPair'
import { getToken } from './token'
import { getBentoBox } from './bentobox'
import { getMasterContract } from './master-contract'

export function createKashiPair(address: Address, block: ethereum.Block, type: string): KashiPair {
  const pairContract = KashiPairContract.bind(address)
  const masterContract = KashiPairContract.bind(pairContract.masterContract())

  const bentoBox = getBentoBox()
  const master = getMasterContract(pairContract.masterContract())
  const asset = getToken(pairContract.asset(), block)
  const collateral = getToken(pairContract.collateral(), block)
  const accrueInfo = pairContract.accrueInfo()

  const pair = new KashiPair(address.toHex())

  // TODO: should add props for specific kashi pair types (collateralization rates, etc.)

  pair.bentoBox = bentoBox.id
  pair.type = type
  pair.masterContract = master.id
  pair.owner = masterContract.owner()
  pair.feeTo = masterContract.feeTo()
  pair.name = pairContract.name()
  pair.symbol = pairContract.symbol()
  pair.oracle = pairContract.oracle()
  pair.asset = asset.id
  pair.collateral = collateral.id
  pair.exchangeRate = pairContract.exchangeRate()
  pair.totalAssetBase = BIG_INT_ZERO
  pair.totalAssetElastic = BIG_INT_ZERO
  pair.totalCollateralShare = BIG_INT_ZERO
  pair.totalBorrowBase = BIG_INT_ZERO
  pair.totalBorrowElastic = BIG_INT_ZERO
  pair.interestPerSecond = accrueInfo.value0
  pair.utilization = BIG_INT_ZERO
  // TODO: add borrowInterestPerSecond & supplyInterestPerSecond
  pair.feesEarnedFraction = accrueInfo.value2
  pair.totalFeesEarnedFraction = BIG_INT_ZERO
  pair.lastAccrued = accrueInfo.value1
  pair.block = block.number
  pair.timestamp = block.timestamp

  pair.save()

  return pair as KashiPair
}

export function getKashiPair(address: Address, block: ethereum.Block): KashiPair {
  const id = address.toHex()
  let pair = KashiPair.load(id)

  return pair as KashiPair
}
