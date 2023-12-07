import { Body, Controller, Post } from '@nestjs/common';
import solc from 'solc';

@Controller('/compile')
export class CompileCode {
  constructor() {}

  @Post()
  async handle(@Body() body: any) {
    const { solidityCode, jsCode } = body;

    const input = {
      language: 'Solidity',
      sources: {
        'Contract.sol': {
          content: solidityCode,
        },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    };

    const compiled = JSON.parse(solc.compile(JSON.stringify(input)));

    return {
      bytecode: compiled.contracts['Contract.sol'].Contract.evm.bytecode.object,
      abi: compiled.contracts['Contract.sol'].Contract.abi,
    };
  }
}
