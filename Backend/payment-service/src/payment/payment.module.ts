import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/jwt.strategy';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentRepository } from './payment.repository';
import { PaymentService } from './payment.service';
import { RevenueController } from './revenue.controller';
import { SubscriptionController } from './subscription.controller';
import { WebhookController } from './webhook.controller';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SubscriptionController, WebhookController, RevenueController],
  providers: [PaymentService, PaymentRepository, PrismaService, JwtStrategy],
})
export class PaymentModule {}
