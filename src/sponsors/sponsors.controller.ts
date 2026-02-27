import { Body, Controller, Delete, Get, Param, Patch, Post, ParseUUIDPipe, Query, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { SponsorsService } from './sponsors.service';
import { CreateSponsorDto } from './dto/create-sponsor.dto';
import { UpdateSponsorDto } from './dto/update-sponsor.dto';

@Controller('sponsors')
@UseGuards(AuthGuard('jwt'))
export class SponsorsController {
  constructor(private readonly sponsorsService: SponsorsService) {}

  @Post()
  create(@Body() createSponsorDto: CreateSponsorDto, @Req() req: any) {
    return this.sponsorsService.create(createSponsorDto, req.user);
  }

  @Get('search')
  search(@Query('q') query: string) {
    return this.sponsorsService.search(query);
  }

  @Get()
  findAll() {
    return this.sponsorsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sponsorsService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sponsorsService.remove(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSponsorDto: UpdateSponsorDto, @Req() req: any) {
    return this.sponsorsService.update(id, updateSponsorDto, req.user);
  }

  

}
