import { Test, TestingModule } from '@nestjs/testing';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from './profiles.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { Profile } from './profile.entity';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';

describe('ProfilesController', () => {
  let controller: ProfilesController;
  const testProfile: CreateProfileDto = {
    firstName: 'John',
    lastName: 'Doe',
    gender: 'male',
    occupation: 'Software Engineer',
    phoneNumber: '1234567890',
    email: 'johndoe@example.com',
  };
  const updateTestProfile: UpdateProfileDto = {
    occupation: 'Software Engineer',
    phoneNumber: '1234567890',
  };
  const user: User = {
    id: 1,
    userName: 'johndoe',
    email: 'johndoe@example.com',
    profile: null,
    tasks: [],
    hasId: () => true, // Assuming these methods exist in the User entity
    save: () => Promise.resolve(user),
    remove: () => Promise.resolve(user),
    softRemove: () => Promise.resolve(user),
    recover: () => Promise.resolve(user),
    reload: () => Promise.resolve(),
  };
  const profile: Profile = {
    id: 1,
    ...testProfile,
    user: user,
  };
  const mockUserRepository = {
    findOne: jest.fn((query) => {
      if (query.where.email === user.email) {
        return Promise.resolve(user);
      }
      return Promise.resolve(null); // Return null when email doesn't match
    }),
  };
  const mockProfileService = {
    createProfile: jest.fn(async (createProfile: CreateProfileDto) => {
      console.log('Mock createProfile called with:', createProfile);
      await Promise.resolve(
        mockUserRepository.findOne({ where: { email: createProfile.email } }),
      );
      console.log('Mock createProfile is being called');
      return Promise.resolve({
        id: 1,
        ...createProfile,
        user: user,
      });
    }),

    getProfileById: jest.fn((id: number) => {
      if (id === profile.id) {
        return Promise.resolve(profile);
      }
      throw new NotFoundException('Profile id not found');
    }),

    getAllProfiles: jest.fn(() => {
      return Promise.resolve([profile]);
    }),

    updateProfile: jest.fn((id: number, updateProfile: UpdateProfileDto) => {
      if (id === profile.id) {
        return Promise.resolve({ id: profile.id, ...updateProfile });
      }
      throw new NotFoundException('Profile id not found');
    }),

    deleteProfile: jest.fn((id: number) => {
      if (id === profile.id) {
        return Promise.resolve('Profile deleted');
      }
      throw new NotFoundException('Profile id not found');
    }),
  };

  // const mockRepository = {
  //   findOne: jest.fn((query: any) => {
  //     return Promise.resolve(query);
  //   }),

  //   find: jest.fn(() => {
  //     return Promise.resolve([profile]);
  //   }),
  // findOneBy: jest.fn((query: any) => {
  //   return Promise.resolve(query);
  // }),
  // };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProfilesController],
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useValue: mockProfileService,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    controller = module.get<ProfilesController>(ProfilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a profile', async () => {
    const createdProfile = await controller.createProfile(testProfile);
    expect(createdProfile).toEqual({ id: 1, ...testProfile, user: user });
    expect(mockProfileService.createProfile).toHaveBeenCalledWith(testProfile);
    console.log('Controller createProfile method called');
  });

  // it('should get a profile by id', async () => {
  //   const retrievedProfile = await controller.getProfilesById(1);
  //   expect(retrievedProfile).toEqual(profile);
  //   expect(mockProfileService.getProfileById).toHaveBeenCalledWith(1);
  // });

  // it('should throw NotFoundException when getting a non-existent profile by id', async () => {
  //   await expect(controller.getProfilesById(2)).rejects.toThrowError(
  //     NotFoundException,
  //   );
  //   expect(mockProfileService.getProfileById).toHaveBeenCalledWith(2);
  // });

  // it('should get all profiles', async () => {
  //   const allProfiles = await controller.getAllProfiles();
  //   expect(allProfiles).toEqual([profile]);
  //   expect(mockProfileService.getAllProfiles).toHaveBeenCalled();
  // });

  // it('should update a profile', async () => {
  //   const updatedProfile = await controller.updateProfile(1, updateTestProfile);
  //   expect(updatedProfile).toEqual({ id: 1, ...updateTestProfile });
  //   expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
  //     1,
  //     updateTestProfile,
  //   );
  // });

  // it('should throw NotFoundException when updating a non-existent profile', async () => {
  //   await expect(
  //     controller.updateProfile(2, updateTestProfile),
  //   ).rejects.toThrowError(NotFoundException);
  //   expect(mockProfileService.updateProfile).toHaveBeenCalledWith(
  //     2,
  //     updateTestProfile,
  //   );
  // });

  // it('should delete a profile', async () => {
  //   const result = await controller.deleteProfile(1);
  //   expect(result).toEqual('Profile deleted');
  //   expect(mockProfileService.deleteProfile).toHaveBeenCalledWith(1);
  // });

  // it('should throw NotFoundException when deleting a non-existent profile', async () => {
  //   await expect(controller.deleteProfile(2)).rejects.toThrowError(
  //     NotFoundException,
  //   );
  //   expect(mockProfileService.deleteProfile).toHaveBeenCalledWith(2);
  // });
});
