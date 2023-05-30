import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { Repository } from 'typeorm';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProfilesService {
  constructor(
    @InjectRepository(Profile) private profileRespository: Repository<Profile>,
    @InjectRepository(User) private userRespository: Repository<User>,
  ) {}

  async createProfile(createProfile: CreateProfileDto): Promise<Profile> {
    const user = await this.userRespository.findOne({
      where: { email: createProfile.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const id = user.id;
    const userProfile = await this.profileRespository.findOneBy({ id });
    if (userProfile) {
      throw new ConflictException('User already has a profile');
    }
    const profile = await this.profileRespository.create({
      id: user.id,
      ...createProfile,
      user: user,
    });
    return await this.profileRespository.save(profile);
  }

  async getProfileById(id: number): Promise<Profile> {
    const profile = await this.profileRespository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundException('User Profile not found');
    }
    return profile;
  }

  async getAllProfiles() {
    return await this.profileRespository.find();
  }

  async updateProfile(
    id: number,
    updateProfile: UpdateProfileDto,
  ): Promise<Profile> {
    const profile = await this.profileRespository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundException('User Profile not found');
    }
    const updatedProfile = await this.profileRespository.save({
      id,
      ...updateProfile,
    });
    return updatedProfile;
  }

  async deleteProfile(id: number): Promise<string> {
    const profile = await this.profileRespository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    await this.profileRespository.remove(profile);
    return 'Profile deleted';
  }
}
