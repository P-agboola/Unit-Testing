import { NotFoundException, ConflictException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { Repository } from 'typeorm';
import { ProfilesService } from './profiles.service';
import { Profile } from './profile.entity';
import { User } from '../users/entities/user.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

describe('ProfilesService', () => {
  let service: ProfilesService;
  let profileRepository: Repository<Profile>;
  let userRepository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfilesService,
        {
          provide: getRepositoryToken(Profile),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProfilesService>(ProfilesService);
    profileRepository = module.get<Repository<Profile>>(
      getRepositoryToken(Profile),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('createProfile', () => {
    const createProfileDto: CreateProfileDto = {
      gender: 'male',
      occupation: 'developer',
      phoneNumber: '123456789',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
    };

    it('should create a new profile when the user exists and has no profile', async () => {
      const user = new User();
      user.id = 1;

      userRepository.findOne = jest.fn().mockResolvedValue(user);
      profileRepository.findOneBy = jest.fn().mockResolvedValue(null);
      profileRepository.create = jest.fn().mockReturnValue(createProfileDto);
      profileRepository.save = jest.fn().mockResolvedValue(createProfileDto);

      const result = await service.createProfile(createProfileDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createProfileDto.email },
      });
      expect(profileRepository.findOneBy).toHaveBeenCalledWith({ id: user.id });
      expect(profileRepository.create).toHaveBeenCalledWith({
        id: user.id,
        ...createProfileDto,
        user,
      });
      expect(profileRepository.save).toHaveBeenCalledWith(createProfileDto);
      expect(result).toEqual(createProfileDto);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      userRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(
        service.createProfile(createProfileDto),
      ).rejects.toThrowError(NotFoundException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createProfileDto.email },
      });
    });

    it('should throw ConflictException when the user already has a profile', async () => {
      const user = new User();
      user.id = 1;

      userRepository.findOne = jest.fn().mockResolvedValue(user);
      profileRepository.findOneBy = jest.fn().mockResolvedValue({});

      await expect(
        service.createProfile(createProfileDto),
      ).rejects.toThrowError(ConflictException);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: createProfileDto.email },
      });
    });
  });

  describe('getProfileById', () => {
    const profileId = 1;

    it('should return the profile with the given ID', async () => {
      const profile = new Profile();
      profile.id = profileId;

      profileRepository.findOneBy = jest.fn().mockResolvedValue(profile);

      const result = await service.getProfileById(profileId);

      expect(profileRepository.findOneBy).toHaveBeenCalledWith({
        id: profileId,
      });
      expect(result).toEqual(profile);
    });

    it('should throw NotFoundException when the profile does not exist', async () => {
      profileRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.getProfileById(profileId)).rejects.toThrowError(
        NotFoundException,
      );
      expect(profileRepository.findOneBy).toHaveBeenCalledWith({
        id: profileId,
      });
    });
  });

  describe('getAllProfiles', () => {
    it('should return all profiles', async () => {
      const user: User = {
        id: 1,
        userName: 'johndoe',
        email: 'johndoe@example.com',
        profile: null,
        tasks: [],
        hasId: () => true,
        save: () => Promise.resolve(user),
        remove: () => Promise.resolve(user),
        softRemove: () => Promise.resolve(user),
        recover: () => Promise.resolve(user),
        reload: () => Promise.resolve(),
      };
      const profiles: Profile[] = [
        {
          id: 1,
          gender: 'male',
          occupation: 'developer',
          firstName: 'John',
          lastName: 'Doe',
          phoneNumber: '123',
          user: user,
        },
        {
          id: 2,
          gender: 'female',
          occupation: 'designer',
          firstName: 'Jane',
          lastName: 'Smith',
          phoneNumber: '456',
          user: user,
        },
      ];

      profileRepository.find = jest.fn().mockResolvedValue(profiles);

      const result = await service.getAllProfiles();

      expect(profileRepository.find).toHaveBeenCalled();
      expect(result).toEqual(profiles);
    });
  });

  describe('updateProfile', () => {
    const profileId = 1;
    const updateProfileDto: UpdateProfileDto = {
      occupation: 'new occupation',
      phoneNumber: 'new phone number',
    };

    it('should update the profile with the given ID', async () => {
      const profile = new Profile();
      profile.id = profileId;

      profileRepository.findOneBy = jest.fn().mockResolvedValue(profile);
      profileRepository.save = jest
        .fn()
        .mockResolvedValue({ ...profile, ...updateProfileDto });

      const result = await service.updateProfile(profileId, updateProfileDto);

      expect(profileRepository.findOneBy).toHaveBeenCalledWith({
        id: profileId,
      });
      expect(profileRepository.save).toHaveBeenCalledWith({
        id: profileId,
        ...updateProfileDto,
      });
      expect(result).toEqual({ ...profile, ...updateProfileDto });
    });

    it('should throw NotFoundException when the profile does not exist', async () => {
      profileRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(
        service.updateProfile(profileId, updateProfileDto),
      ).rejects.toThrowError(NotFoundException);
      expect(profileRepository.findOneBy).toHaveBeenCalledWith({
        id: profileId,
      });
    });
  });

  describe('deleteProfile', () => {
    const profileId = 1;

    it('should delete the profile with the given ID', async () => {
      const profile = new Profile();
      profile.id = profileId;

      profileRepository.findOneBy = jest.fn().mockResolvedValue(profile);
      profileRepository.remove = jest.fn().mockResolvedValue(profile);

      const result = await service.deleteProfile(profileId);

      expect(profileRepository.findOneBy).toHaveBeenCalledWith({
        id: profileId,
      });
      expect(profileRepository.remove).toHaveBeenCalledWith(profile);
      expect(result).toBe('Profile deleted');
    });

    it('should throw NotFoundException when the profile does not exist', async () => {
      profileRepository.findOneBy = jest.fn().mockResolvedValue(null);

      await expect(service.deleteProfile(profileId)).rejects.toThrowError(
        NotFoundException,
      );
      expect(profileRepository.findOneBy).toHaveBeenCalledWith({
        id: profileId,
      });
    });
  });
});
