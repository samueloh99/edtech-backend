import { Body, Controller, Post } from '@nestjs/common';
import fs from 'fs';
import { exec } from 'child_process';
import SolidityHardhatOutputParser from './SolidityHardhatOutputParser';

@Controller('/run-test-cairo')
export class RunTestCairo {
  constructor() {}

  getParserFromTechStack() {
    const parser = new SolidityHardhatOutputParser();

    return parser;
  }

  async executeDockerCall(
    userCodeFileName: string,
  ): Promise<{ exitCode: number; stderr: string; stdout: string }> {
    return new Promise((resolve) => {
      const cwd = process.cwd();

      const command = `docker run --rm -v ${cwd}/user_assessments/${userCodeFileName}:/app/script-cairo/src/lib.cairo cairo sh -c "scarb cairo-test"`;

      exec(command, (error: any, stdout: string, stderr: string) => {
        const exitCode = error ? error.code : 0;

        resolve({
          exitCode: exitCode,
          stderr: stderr.toString(),
          stdout: stdout.toString(),
        });
      });
    });
  }

  deleteTmpFile(fileName: string) {
    //Because we generated the file name, it's safe to do it
    fs.unlinkSync('./user_assessments/' + fileName);
  }

  createTmpFile(userAssessmentCode: string): string {
    //Create a random name in order to avoid that different requests could override user codes
    //Use Math.random because it's the fastest, but another method can be used
    //Use Math.floor to remove any point that could cause a file name like "userAssessmentCode456465.6546"
    //Also, with this method, you avoid path traversal vulnerability
    const fileName =
      'userAssessmentCode' +
      Math.floor(Math.random() * (Number.MAX_SAFE_INTEGER - 1));

    //TODO: in a real environment I'd check if string is too long, raise an error in order to avoid fill disk with crap
    fs.writeFileSync('./user_assessments/' + fileName, userAssessmentCode);

    return fileName;
  }

  @Post()
  async handle(@Body() body: any) {
    const { code } = body;

    const fileName = this.createTmpFile(code);

    const executionInfo = await this.executeDockerCall(fileName);

    this.deleteTmpFile(fileName);
    return {
      successful: executionInfo.exitCode === 0,
      output: this.getParserFromTechStack().parseOutput(
        executionInfo.exitCode,
        executionInfo.stdout,
        executionInfo.stderr.trim() !== ''
          ? executionInfo.stderr
          : executionInfo.stdout,
      ),
    };
  }
}
