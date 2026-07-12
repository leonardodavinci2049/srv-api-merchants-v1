import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { ShopeeConfiguration } from '../core/interfaces/shopee-configuration.interface';
import { GenerateAffiliateLinkDto } from './dto/generate-affiliate-link.dto';
import { GetProductOffersDto } from './dto/get-product-offers.dto';
import { GetShopeeApiOffersDto } from './dto/get-shopee-api-offers.dto';
import { ProductOffersResponseDto } from './dto/product-offers-response.dto';
import { ShopeeApiOffersResponseDto } from './dto/shopee-api-offers-response.dto';
import { ShopeeApiService } from './shopee-api.service';

@Controller('shopee-api')
export class ShopeeApiController {
  constructor(private readonly shopeeApiService: ShopeeApiService) {}

  @Get()
  getHello() {
    return {
      name: 'SAAS API',
      status: 'online',
      version: '1.0.1',
      documentation: '/',
      timestamp: new Date().toISOString(),
      endpoints: {
        base: '/api',
        auth: '/shopee-api',
      },
    };
  }

  @UseGuards(AuthGuard)
  @Post('generate-affiliate-link')
  async generateAffiliateLink(@Body() dto: GenerateAffiliateLinkDto) {
    // Criar configuração a partir do DTO
    const shopeeConfig: ShopeeConfiguration = {
      credential: dto.credential,
      secretKey: dto.secretKey,
      affiliateEndpoint: dto.affiliateEndpoint,
      affiliateSubids: dto.affiliateSubids,
      affiliateTimeout: dto.affiliateTimeout || '5000',
    };

    return {
      affiliateLink: await this.shopeeApiService.generateAffiliateLink(
        dto.originUrl,
        shopeeConfig,
      ),
    };
  }

  @UseGuards(AuthGuard)
  @Post('get-product-offers')
  async getProductOffers(@Body() dto: GetProductOffersDto) {
    try {
      // Criar configuração a partir do DTO
      const shopeeConfig: ShopeeConfiguration = {
        credential: dto.credential,
        secretKey: dto.secretKey,
        affiliateEndpoint: dto.affiliateEndpoint,
        affiliateSubids: dto.affiliateSubids ?? 'ALINY',
        affiliateTimeout: '5000',
      };

      // Criar parâmetros de busca
      const searchParams = {
        keyword: dto.keyword,
        shopId: dto.shopId,
        itemId: dto.itemId,
        productCatId: dto.productCatId,
        listType: dto.listType,
        sortType: dto.sortType,
        page: dto.page || 1,
        limit: dto.limit || 10,
        isAMSOffer: dto.isAMSOffer,
        isKeySeller: dto.isKeySeller,
      };

      // Chamar o serviço
      const result = await this.shopeeApiService.getProductOffers(
        searchParams,
        shopeeConfig,
      );

      // Retornar resposta formatada
      if (result.success) {
        if (!result.data) {
          return ProductOffersResponseDto.error(
            'Resposta inválida',
            'Serviço retornou sucesso sem dados de ofertas de produtos',
          );
        }

        return ProductOffersResponseDto.success(
          result.data.products,
          result.data.pageInfo,
        );
      } else {
        return ProductOffersResponseDto.error(
          result.error || 'Erro desconhecido',
          result.message,
        );
      }
    } catch (error) {
      return ProductOffersResponseDto.error(
        'Erro interno do servidor',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('get-shopee-api-offers')
  async getShopeeApiOffers(@Body() dto: GetShopeeApiOffersDto) {
    try {
      // Criar configuração a partir do DTO
      const shopeeConfig: ShopeeConfiguration = {
        credential: dto.credential,
        secretKey: dto.secretKey,
        affiliateEndpoint: dto.affiliateEndpoint,
        affiliateSubids: dto.affiliateSubids ?? 'ALINY',
        affiliateTimeout: dto.affiliateTimeout || '5000',
      };

      // Criar parâmetros de busca
      const searchParams = {
        keyword: dto.keyword,
        sortType: dto.sortType,
        page: dto.page || 1,
        limit: dto.limit || 10,
      };

      // Chamar o serviço
      const result = await this.shopeeApiService.getShopeeApiOffers(
        searchParams,
        shopeeConfig,
      );

      // Retornar resposta formatada
      if (result.success) {
        if (!result.data) {
          return ShopeeApiOffersResponseDto.error(
            'Resposta inválida',
            'Serviço retornou sucesso sem dados de ofertas Shopee',
          );
        }

        return ShopeeApiOffersResponseDto.success(
          result.data.offers,
          result.data.pageInfo,
        );
      } else {
        return ShopeeApiOffersResponseDto.error(
          result.error || 'Erro desconhecido',
          result.message,
        );
      }
    } catch (error) {
      return ShopeeApiOffersResponseDto.error(
        'Erro interno do servidor',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }
}
