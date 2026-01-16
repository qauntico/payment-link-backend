import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { PaymentsModule } from './payments/payments.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [ConfigModule.forRoot(), UsersModule, ProductsModule, PaymentsModule, AdminModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
