import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { LinkGenerationCreateV2Dto } from './dto/link-generation-create-v2.dto';
import { LinkGenerationFindAllV2Dto } from './dto/link-generation-find-all-v2.dto';
import { PromoLinkFindAllV2Dto } from './dto/promo-link-find-all_v2.dto';
import { PromolinksService } from './promolinks.service';

@Controller('promolinks')
export class PromolinksController {
  constructor(private readonly promolinksService: PromolinksService) {}
  @Get()
  getHello() {
    return {
      name: 'Srv Telegram',
      status: 'online',
      version: '1.0.1',
      documentation: '/',
      timestamp: new Date().toISOString(),
      endpoints: {
        base: '/api',
        auth: '/api/promolinks',
      },
    };
  }
  @Post()
  create() {
    return this.promolinksService.create();
  }

  @UseGuards(AuthGuard)
  @Post('v2/link-generation-create')
  LinkGenerationCreateV2(@Body() dataJsonDto: LinkGenerationCreateV2Dto) {
    return this.promolinksService.taskLinkGenerationCreateV2(dataJsonDto);
  }

  @UseGuards(AuthGuard)
  @Post('v2/link-generation-find-all')
  LinkGenerationFindAllV2(@Body() dataJsonDto: LinkGenerationFindAllV2Dto) {
    return this.promolinksService.taskLinkGenerationFindAllV2(dataJsonDto);
  }

  @UseGuards(AuthGuard)
  @Post('v2/promo-link-find-all')
  PromoLinkFindAllV2(@Body() dataJsonDto: PromoLinkFindAllV2Dto) {
    return this.promolinksService.taskPromoLinkFindAllV2(dataJsonDto);
  }
}
