import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';

import { CryptoController } from './crypto.controller';
import { CryptoService } from './crypto.service';
import { Address } from './entities/address.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Address]),
    HttpModule,
    ConfigModule,
  ],
  controllers: [CryptoController],
  providers: [CryptoService],
})
export class CryptoModule {}