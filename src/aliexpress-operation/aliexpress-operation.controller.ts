import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { AliExpressOperationService } from './aliexpress-operation.service';
import { GenerateAffiliateLinksDto } from './dto/generate-affiliate-links.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { GetProductDetailsDto } from './dto/get-product-details.dto';
import { GetProductSkuDetailsDto } from './dto/get-product-sku-details.dto';
import { SearchProductsDto } from './dto/search-products.dto';
import { AliExpressOperationResponseDto } from './interface/aliexpress-operation-response.dto';

@Controller('aliexpress-operation')
export class AliExpressOperationController {
  constructor(
    private readonly aliExpressOperationService: AliExpressOperationService,
  ) {}

  @UseGuards(AuthGuard)
  @Post('v1/get-categories')
  async getCategories(
    @Body() dto: GetCategoriesDto,
  ): Promise<AliExpressOperationResponseDto> {
    return this.aliExpressOperationService.getCategories(dto);
  }

  @UseGuards(AuthGuard)
  @Post('v1/search-products')
  async searchProducts(
    @Body() dto: SearchProductsDto,
  ): Promise<AliExpressOperationResponseDto> {
    return this.aliExpressOperationService.searchProducts(dto);
  }

  @UseGuards(AuthGuard)
  @Post('v1/get-product-details')
  async getProductDetails(
    @Body() dto: GetProductDetailsDto,
  ): Promise<AliExpressOperationResponseDto> {
    return this.aliExpressOperationService.getProductDetails(dto);
  }

  @UseGuards(AuthGuard)
  @Post('v1/get-product-sku-details')
  async getProductSkuDetails(
    @Body() dto: GetProductSkuDetailsDto,
  ): Promise<AliExpressOperationResponseDto> {
    return this.aliExpressOperationService.getProductSkuDetails(dto);
  }

  @UseGuards(AuthGuard)
  @Post('v1/generate-affiliate-links')
  async generateAffiliateLinks(
    @Body() dto: GenerateAffiliateLinksDto,
  ): Promise<AliExpressOperationResponseDto> {
    return this.aliExpressOperationService.generateAffiliateLinks(dto);
  }
}
