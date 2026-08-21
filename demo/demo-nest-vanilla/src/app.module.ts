import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { MathModule } from './math/math.module.js';

@Module({
  imports: [MathModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
