import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { GoogleUser } from './interfaces/google-user.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async validateGoogleUser(googleUser: GoogleUser) {
    const { email, firstName, lastName, picture } = googleUser;
    
    // Check if user exists
    let user = await this.userService.findByEmail(email);
    
    if (!user) {
      // Create new user if doesn't exist
      user = await this.userService.create({
        email,
        firstName,
        lastName,
        picture,
        provider: 'google',
        providerId: googleUser.id,
      });
    } else {
      // Update existing user's Google info
      await this.userService.updateGoogleInfo(user.id, {
        picture,
        providerId: googleUser.id,
      });
    }

    return user;
  }

  async generateJwtToken(user: any) {
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        picture: user.picture,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      const user = await this.userService.findById(payload.sub);
      
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      
      return user;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
