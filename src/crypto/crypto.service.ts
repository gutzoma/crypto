import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { TransferDto } from './dto/transfer.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CryptoService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectRepository(Address)
    private readonly repo: Repository<Address>,
  ) {}

  async createAddress(dto: CreateAddressDto, isMain = false) {
    const network = this.config.get('TATUM_NETWORK');
    const baseUrl = this.config.get('TATUM_BASE_URL');
    const apiKey = this.config.get('TATUM_API_KEY');

    if ( network === 'solana' ) {
      const { data } = await this.http.axiosRef.get(
        `${baseUrl}/v3/${network}/wallet`,
        { headers: { 'x-api-key': apiKey } },
      );

      const address = this.repo.create({
      label: dto.label,
      address: data.address,
      privateKey: data.privateKey,
      isMain,
    });

    return this.repo.save(address);
    }

    // 1. Generar wallet (XPUB)
    const walletRes = await this.http.axiosRef.get(
      `${baseUrl}/v3/${network}/wallet`,
      { headers: { 'x-api-key': apiKey } },
    );
    const xpub = walletRes.data.xpub;
 
    // 2. Derivar dirección pública desde XPUB
    const index = 0;
    const addressRes = await this.http.axiosRef.get(
      `${baseUrl}/v3/${network}/address/${xpub}/${index}`,
      { headers: { 'x-api-key': apiKey } },
    );
    const address = addressRes.data.address;

    // 3. Obtener private key
    const privRes = await this.http.axiosRef.post(
      `${baseUrl}/v3/${network}/wallet/priv`,
      { mnemonic: walletRes.data.mnemonic, index },
      { headers: { 'x-api-key': apiKey } },
    );
    const privateKey = privRes.data.key;

    // 4. Guardar en base de datos
    const entity = this.repo.create({
      label: dto.label,
      address,
      privateKey,
      isMain,
    });

    return this.repo.save(entity);
  }

  async getBalance(address: string) {
    const network = this.config.get('TATUM_NETWORK');
    const baseUrl = this.config.get('TATUM_BASE_URL');
    const apiKey = this.config.get('TATUM_API_KEY');

    const { data } = await this.http.axiosRef.get(
      `${baseUrl}/v3/${network}/address/balance/${address}`,
      { headers: { 'x-api-key': apiKey } },
    );
    return data;
  }

  async transfer(dto: TransferDto) {
    const network = this.config.get('TATUM_NETWORK');
    const baseUrl = this.config.get('TATUM_BASE_URL');
    const apiKey = this.config.get('TATUM_API_KEY');

    const sender = await this.repo.findOneBy({ address: dto.fromAddress });

    if (!sender) {
      throw new Error(`Sender address not found: ${dto.fromAddress}`);
    }

    const body = {
      fromAddress: [{ address: sender.address, privateKey: sender.privateKey }],
      to: [{ address: dto.toAddress, value: dto.amount }],
    };

    const { data } = await this.http.axiosRef.post(
      `${baseUrl}/v3/${network}/transaction`,
      body,
      { headers: { 'x-api-key': apiKey } },
    );

    return data;
  }

  async faucet(address: string) {
    const network = this.config.get('TATUM_NETWORK');
    const baseUrl = this.config.get('TATUM_BASE_URL');
    const apiKey = this.config.get('TATUM_API_KEY');

    const { data } = await this.http.axiosRef.post(
      `${baseUrl}/v3/faucet`,
      { address, network },
      { headers: { 'x-api-key': apiKey } },
    );
    return data;
  }

  async listAddresses() {
    return this.repo.find();
  }
}
