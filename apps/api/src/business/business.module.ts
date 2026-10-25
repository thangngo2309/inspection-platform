
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BUSINESS_ENTITIES } from './business-entities.js';

@Module({
  imports: [TypeOrmModule.forFeature([...BUSINESS_ENTITIES])],
  controllers: [],
  providers: [],
  exports: [TypeOrmModule],
})
export class BusinessModule {}
