import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';<% if (config) { %>
import { ConfigModule, ConfigService } from '@devon4node/config';
import { Config } from '../../shared/model/config/config.model';<% } %>

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),<% if(config) { %>
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService<Config>) => config.values.jwtConfig,
      inject: [ConfigService],
    }),
    <% } else { %>
    JwtModule.register({
      secret: 'SECRET',
      signOptions: { expiresIn: '60s' },
    }),<% } %>
  ],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, PassportModule],
  controllers: [AuthController],
})
export class AuthModule {}
