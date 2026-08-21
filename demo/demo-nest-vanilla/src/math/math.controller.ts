import { Controller, Get } from '@nestjs/common';
import { MathService } from './math.service.js';

@Controller()
export class MathController {
  constructor(private readonly mathService: MathService) {}

  @Get('matmul')
  matMul(): number[][] {
    return this.mathService.matMul();
  }
}
