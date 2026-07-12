import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/core/guards/auth.guard';
import { DbOperationService } from './db.operation.service';
import { FindConfigSelectIdDto } from './dto/find-config-select-id.dto';

@Controller('dboperation')
export class DbOperationController {
  constructor(private readonly dbOperationService: DbOperationService) {}

  @Get()
  getHello() {
    return {
      name: 'DbOperation API',
      status: 'online',
      version: '1.0.1',
      documentation: '/',
      timestamp: new Date().toISOString(),
      endpoints: {
        base: '/api',
        auth: '/api/dboperation',
      },
    };
  }

  // -- dasbord  ---
  @UseGuards(AuthGuard)
  @Post('v1/find-config-select-id')
  FindConfigSelectId(@Body() dataJsonDto: FindConfigSelectIdDto) {
    return this.dbOperationService.tskFindConfigSelectId(dataJsonDto);
  }
}
