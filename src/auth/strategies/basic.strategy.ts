import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { BasicStrategy as Strategy } from 'passport-http';
import { BpAccessService } from '../bp-access.service';
import { BpAccess } from '../entities/bp-access.entity';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly bpAccessService: BpAccessService) {
    super();
  }

  async validate(username: string, password: string): Promise<BpAccess> {
    const bpAccess = await this.bpAccessService.validateCredentials(username, password);
    
    if (!bpAccess) {
      throw new UnauthorizedException('Invalid credentials');
    }
    
    return bpAccess;
  }
} 