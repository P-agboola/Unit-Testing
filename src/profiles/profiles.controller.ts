import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { Profile } from './profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('users/profiles')
@Controller('users/profiles')
export class ProfilesController {
  constructor(private profileService: ProfilesService) {}

  @ApiOkResponse({ description: `Profile id found and return` })
  @ApiNotFoundResponse({ description: `Profile id not found` })
  @Get(':id')
  async getProfilesById(
    @Param('id') id: number,
    @Body() email: string,
  ): Promise<Profile> {
    return await this.profileService.getProfileById(id, email);
  }

  @ApiCreatedResponse({ description: 'profile created successfully' })
  @Post()
  async createProfile(
    @Body() createProfile: CreateProfileDto,
  ): Promise<Profile> {
    return await this.profileService.createProfile(createProfile);
  }

  @ApiOkResponse({ description: `Profile id found and deleted` })
  @ApiNotFoundResponse({ description: `Profile id not found` })
  @Delete(':id')
  async deleteProfile(
    @Param('id') id: number,
    @Body() email: string,
  ): Promise<string> {
    return await this.profileService.deleteProfile(id, email);
  }

  @ApiOkResponse({ description: `Profile id found and updated` })
  @ApiNotFoundResponse({ description: `Profile id not found` })
  @Patch(':id')
  async updateProfile(
    @Param('id') id: number,
    @Body() updateProfile: UpdateProfileDto,
  ): Promise<Profile> {
    return await this.profileService.updateProfile(id, updateProfile);
  }
}
  