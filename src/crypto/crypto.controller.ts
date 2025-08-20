// crypto.controller.ts
import { Controller, Post, Body, Get } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly service: CryptoService) {}

  @Post('main')
  createMain(@Body() dto: CreateAddressDto) {
    return this.service.createAddress(dto, true);
  }

  @Post('secondary')
  createSecondary(@Body() dto: CreateAddressDto) {
    return this.service.createAddress(dto, false);
  }

  @Post('faucet')
  faucet(@Body() body: { address: string }) {
    return this.service.faucet(body.address);
  }

  @Post('transfer')
  transfer(@Body() dto: TransferDto) {
    return this.service.transfer(dto);
  }

  @Get('addresses')
  list() {
    return this.service.listAddresses();
  }

  @Post('balance')
  balance(@Body() body: { address: string }) {
    return this.service.getBalance(body.address);
  }
}
