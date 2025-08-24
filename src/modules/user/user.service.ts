import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

// In-memory storage for demo purposes
// In production, replace this with a proper database
const users: any[] = [];

@Injectable()
export class UserService {
  async create(createUserDto: CreateUserDto) {
    const user = {
      id: Date.now().toString(),
      ...createUserDto,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    users.push(user);
    return user;
  }

  async findAll() {
    return users;
  }

  async findById(id: string) {
    const user = users.find(u => u.id === id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string) {
    return users.find(u => u.email === email);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateUserDto,
      updatedAt: new Date(),
    };

    return users[userIndex];
  }

  async updateGoogleInfo(id: string, googleInfo: { picture?: string; providerId?: string }) {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...googleInfo,
      updatedAt: new Date(),
    };

    return users[userIndex];
  }

  async remove(id: string) {
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const user = users[userIndex];
    users.splice(userIndex, 1);
    return user;
  }
}
