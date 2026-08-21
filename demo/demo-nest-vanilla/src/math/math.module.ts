import { Module } from '@nestjs/common';
import { MathController } from './math.controller.js';
import { MathService } from './math.service.js';

@Module({
  controllers: [MathController],
  providers: [MathService],
})
export class MathModule {}
