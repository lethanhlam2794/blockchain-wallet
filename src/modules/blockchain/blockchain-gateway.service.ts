import * as ethers from 'ethers';
import { BlockchainService, types, utils } from 'evm-blockchain-tools';
import { OperationResult } from 'mvc-common-toolkit';

import { Inject, Injectable, Logger } from '@nestjs/common';

import {
  APP_CURRENCY,
  BLOCKCHAIN_NETWORK,
  INJECTION_TOKEN,
} from '@shared/constants';
import { ERC20TransferData } from '@shared/interfaces';

import * as erc20Abi from '../../abis/erc20.json';

@Injectable()
export class BlockChainGatewayService {
  protected logger = new Logger(BlockChainGatewayService.name);

  constructor(
    @Inject(INJECTION_TOKEN.BSC_WEB3_GATEWAY)
    protected bscWeb3Gateway: types.IWeb3Gateway,

    @Inject(INJECTION_TOKEN.BLOCKCHAIN_SERVICE)
    protected blockchainService: BlockchainService,
  ) {}

  protected getGatewayByNetwork(
    network: BLOCKCHAIN_NETWORK,
  ): types.IWeb3Gateway {
    switch (network) {
      case BLOCKCHAIN_NETWORK.BSC:
        return this.bscWeb3Gateway;
      default:
        throw new Error(`network ${network} not supported`);
    }
  }

  public async parseERC20TransferTx(
    hash: string,
    validationData?: Partial<any>,
    network = BLOCKCHAIN_NETWORK.BSC,
  ): Promise<OperationResult<ERC20TransferData>> {
    try {
      const transactionInfo = await this.getTransactionByHash(hash, network);
      const decodedInput = await this.parseTransaction(
        transactionInfo.data,
        erc20Abi,
      );

      const functionName = decodedInput.name;
      const [destinationAddress, amount] = decodedInput.args;

      if (validationData) {
        // TODO: Kiểm tra lại API của evm-blockchain-tools
        // const validationResult = await utils.validateERC20Transfer(
        //   transactionInfo,
        //   validationData,
        //   this.blockchainService,
        // );
        // if (!validationResult.isValid) {
        //   return {
        //     success: false,
        //     message: validationResult.message,
        //     code: validationResult.code,
        //   };
        // }
      }

      return {
        success: true,
        data: {
          functionName,
          destinationAddress,
          amount: ethers.formatEther(amount),
          currency: APP_CURRENCY.EURV,
        },
      };
    } catch (error) {
      this.logger.error(error.message, error.stack);

      return {
        success: false,
        message: error.message,
      };
    }
  }

  public async getTransactionByHash(
    hash: string,
    network = BLOCKCHAIN_NETWORK.BSC,
  ): Promise<any> {
    const gateway = this.getGatewayByNetwork(network);

    try {
      return gateway.provider.getTransaction(hash);
    } catch (error) {
      this.logger.error(error.message, error.stack);

      return null;
    }
  }

  public async isTransactionSuccess(
    hash: string,
    network: BLOCKCHAIN_NETWORK = BLOCKCHAIN_NETWORK.BSC,
  ): Promise<boolean> {
    const gateway = this.getGatewayByNetwork(network);

    try {
      const receipt = await gateway.provider.getTransactionReceipt(hash);

      return receipt?.status === 1;
    } catch (error) {
      this.logger.error(error.message, error.stack);

      return false;
    }
  }

  public async parseTransaction(
    input: string,
    abi = erc20Abi,
    value = '0',
  ): Promise<ethers.TransactionDescription> {
    try {
      const abiInterface = new ethers.Interface(abi);
      const data = abiInterface.parseTransaction({
        data: input,
        value,
      });

      return data;
    } catch (error) {
      this.logger.error(error.message, error.stack);

      return null;
    }
  }
}
