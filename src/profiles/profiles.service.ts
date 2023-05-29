import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
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
    const userId = user.id;
    const userProfile = await this.profileRespository.findOneBy({ userId });
    if (userProfile) {
      throw new ConflictException('User already has a profile');
    }
    const profile = await this.profileRespository.create({
      ...createProfile,
      userId: userId,
    });
    user.profile = profile;
    await user.save();
    const createdProfile = await this.profileRespository.save(profile);
    return createdProfile;
  }

  async getProfileById(id: number, email: string): Promise<Profile> {
    const user = await this.userRespository.findOne({
      where: { email: email },
    });
    const profile = await this.profileRespository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const VerifyUser = user.id === profile.userId;
    if (!VerifyUser) {
      throw new UnauthorizedException('you are not authorized');
    }
    return profile;
  }

  async updateProfile(
    id: number,
    updateProfile: UpdateProfileDto,
  ): Promise<Profile> {
    const user = await this.userRespository.findOne({
      where: { email: updateProfile.email },
    });
    const profile = await this.profileRespository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const VerifyUser = user.id === profile.userId;
    if (!VerifyUser) {
      throw new UnauthorizedException('you are not authorized');
    }
    const updatedProfile = await this.profileRespository.save({
      id,
      ...updateProfile,
    });
    return updatedProfile;
  }

  async deleteProfile(id: number, email: string): Promise<string> {
    const user = await this.userRespository.findOne({
      where: { email: email },
    });
    const profile = await this.profileRespository.findOneBy({ id });
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    const VerifyUser = user.id === profile.userId;
    if (!VerifyUser) {
      throw new UnauthorizedException('you are not authorized');
    }
    await this.profileRespository.remove(profile);
    return 'Profile deleted';
  }
}
