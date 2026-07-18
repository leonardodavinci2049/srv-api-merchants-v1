import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { GenerateAffiliateLinkDto } from './dto/generate-affiliate-link.dto';
import { GetItemFeedDataDto } from './dto/get-item-feed-data.dto';
import { GetProductOffersDto } from './dto/get-product-offers.dto';
import { GetShopeeOffersDto } from './dto/get-shopee-offers.dto';
import { ListItemFeedsDto } from './dto/list-item-feeds.dto';
import { GenerateAffiliateLinkResponseDto } from './interface/generate-affiliate-link-response.dto';
import { ItemFeedDataResponseDto } from './interface/item-feed-data-response.dto';
import { ItemFeedListResponseDto } from './interface/item-feed-list-response.dto';
import { ProductOffersResponseDto } from './interface/product-offers-response.dto';
import { ShopeeOffersResponseDto } from './interface/shopee-offers-response.dto';
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
    const result = await this.shopeeOperationService.generateAffiliateLink(dto);

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
    }
    return GenerateAffiliateLinkResponseDto.error(
      result.error || 'Erro desconhecido',
      result.message,
    );
  }

  @UseGuards(AuthGuard)
  @Post('v1/get-product-offers')
  async getProductOffers(@Body() dto: GetProductOffersDto) {
    const result = await this.shopeeOperationService.getProductOffers(dto);

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
    }
    return ProductOffersResponseDto.error(
      result.error || 'Erro desconhecido',
      result.message,
    );
  }

  @UseGuards(AuthGuard)
  @Post('v1/get-shopee-offers')
  async getShopeeOffers(@Body() dto: GetShopeeOffersDto) {
    const result = await this.shopeeOperationService.getShopeeOffers(dto);

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
    }
    return ShopeeOffersResponseDto.error(
      result.error || 'Erro desconhecido',
      result.message,
    );
  }

  @UseGuards(AuthGuard)
  @Post('v1/list-item-feeds')
  async listItemFeeds(@Body() dto: ListItemFeedsDto) {
    const result = await this.shopeeOperationService.listItemFeeds(dto);

    if (result.success) {
      if (!result.data) {
        return ItemFeedListResponseDto.error(
          'Dados não encontrados',
          'Resposta de sucesso sem lista de feeds',
        );
      }

      return ItemFeedListResponseDto.success(result.data.feeds);
    }
    return ItemFeedListResponseDto.error(
      result.error || 'Erro desconhecido',
      result.message,
    );
  }

  @UseGuards(AuthGuard)
  @Post('v1/item-feed-data')
  async getItemFeedData(@Body() dto: GetItemFeedDataDto) {
    const result = await this.shopeeOperationService.getItemFeedData(dto);

    if (result.success) {
      if (!result.data) {
        return ItemFeedDataResponseDto.error(
          'Dados não encontrados',
          'Resposta de sucesso sem dados do feed',
        );
      }

      return ItemFeedDataResponseDto.success(
        result.data.rows,
        result.data.pageInfo,
      );
    }
    return ItemFeedDataResponseDto.error(
      result.error || 'Erro desconhecido',
      result.message,
    );
  }
}
