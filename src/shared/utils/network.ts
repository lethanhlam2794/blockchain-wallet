import { BLOCKCHAIN_NETWORK } from '@shared/constants';

export function getNetworkFromChainId(chainId: number): BLOCKCHAIN_NETWORK {
  switch (chainId) {
    case 56:
      return BLOCKCHAIN_NETWORK.BSC;
    case 97:
      return BLOCKCHAIN_NETWORK.BSC_TESTNET;
    case 8678671:
      return BLOCKCHAIN_NETWORK.VNC;
    default:
      return null;
  }
}
