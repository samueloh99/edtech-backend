import { Module } from '@nestjs/common';
import { CompileCode } from './controller/compile-code.controller';
import { RunTest } from './controller/run-test.controller';
import { RunTestCairo } from './controller/run-test-cairo.controller';

@Module({
  controllers: [CompileCode, RunTest, RunTestCairo],
  providers: [],
})
export class AppModule {}
