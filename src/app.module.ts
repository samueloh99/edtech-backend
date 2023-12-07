import { Module } from '@nestjs/common';
import { CompileCode } from './controller/compile-code.controller';
import { RunTest } from './controller/run-test.controller';

@Module({
  controllers: [CompileCode, RunTest],
  providers: [],
})
export class AppModule {}
