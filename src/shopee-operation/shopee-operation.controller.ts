import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { ShopeeConfiguration } from 'src/core/interfaces/shopee-configuration.interface';
import { GenerateAffiliateLinkDto } from './dto/generate-affiliate-link.dto';
import { GenerateAffiliateLinkResponseDto } from './dto/generate-affiliate-link-response.dto';
import { GetProductOffersDto } from './dto/get-product-offers.dto';
import { GetShopeeOffersDto } from './dto/get-shopee-offers.dto';
import { ProductOffersResponseDto } from './dto/product-offers-response.dto';
import { ShopeeOffersResponseDto } from './dto/shopee-offers-response.dto';
import { ShopeeOperationService } from './shopee-operation.service';

@Controller('shopee-operation')
export class ShopeeOperationController {
  constructor(
    private readonly shopeeOperationService: ShopeeOperationService,
  ) {}

  @Get()
  getHello() {
    return {
      name: 'SRV API MERCHANTS',
      status: 'online',
      version: '1.0.1',
      documentation: '/',
      timestamp: new Date().toISOString(),
      endpoints: {
        base: '/api',
        auth: '/api/shopee-operation',
      },
    };
  }

  @UseGuards(AuthGuard)
  @Post('v1/generate-affiliate-link')
  async generateAffiliateLink(@Body() dto: GenerateAffiliateLinkDto) {
    try {
      // Criar configuração a partir do DTO
      // Usar endpoint GraphQL de afiliados como padrão
      const defaultGraphQLEndpoint =
        'https://open-api.affiliate.shopee.com.br/graphql';
      const shopeeConfig: ShopeeConfiguration = {
        credential: dto.credential,
        secretKey: dto.secretKey,
        affiliateEndpoint: dto.affiliateEndpoint?.includes('graphql')
          ? dto.affiliateEndpoint
          : defaultGraphQLEndpoint,
        affiliateSubids: dto.affiliateSubids,
        affiliateTimeout: dto.affiliateTimeout || '5000',
      };

      // Chamar o serviço aprimorado
      const result = await this.shopeeOperationService.generateAffiliateLink(
        dto.originUrl,
        shopeeConfig,
      );

      // Retornar resposta formatada
      if (result.success) {
        if (!result.affiliateLink) {
          return GenerateAffiliateLinkResponseDto.error(
            'Erro ao gerar link',
            'Resposta de sucesso sem link de afiliado',
          );
        }

        return GenerateAffiliateLinkResponseDto.success(
          result.affiliateLink,
          result.productInfo,
          result.databaseRecord,
        );
      } else {
        return GenerateAffiliateLinkResponseDto.error(
          result.error || 'Erro desconhecido',
          result.message,
        );
      }
    } catch (error) {
      return GenerateAffiliateLinkResponseDto.error(
        'Erro interno do servidor',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }

  @UseGuards(AuthGuard)
  @Post('v1/get-product-offers')
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
      const result = await this.shopeeOperationService.getProductOffers(
        searchParams,
        shopeeConfig,
      );

      // Retornar resposta formatada
      if (result.success) {
        if (!result.data) {
          return ProductOffersResponseDto.error(
            'Dados não encontrados',
            'Resposta de sucesso sem dados de produtos',
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
  @Post('v1/get-shopee-offers')
  async getShopeeOffers(@Body() dto: GetShopeeOffersDto) {
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
      const result = await this.shopeeOperationService.getShopeeOffers(
        searchParams,
        shopeeConfig,
      );

      // Retornar resposta formatada
      if (result.success) {
        if (!result.data) {
          return ShopeeOffersResponseDto.error(
            'Dados não encontrados',
            'Resposta de sucesso sem dados de ofertas',
          );
        }

        return ShopeeOffersResponseDto.success(
          result.data.offers,
          result.data.pageInfo,
        );
      } else {
        return ShopeeOffersResponseDto.error(
          result.error || 'Erro desconhecido',
          result.message,
        );
      }
    } catch (error) {
      return ShopeeOffersResponseDto.error(
        'Erro interno do servidor',
        error instanceof Error ? error.message : 'Erro desconhecido',
      );
    }
  }
}
