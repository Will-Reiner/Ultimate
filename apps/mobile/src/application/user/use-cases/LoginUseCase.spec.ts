import { LoginUseCase } from './LoginUseCase';
import { IUserRepository, AuthResult } from '@domain/user/repositories/IUserRepository';
import { User } from '@domain/user/entities/User';
import { UserErrors } from '@domain/user/errors/UserErrors';

const now = new Date('2026-01-01');

const mockUser = User.create({
  id: 'user-1',
  name: 'João Silva',
  email: 'joao@example.com',
  createdAt: now,
  updatedAt: now,
});

const mockAuthResult: AuthResult = {
  user: mockUser,
  accessToken: 'access-token-abc',
  refreshToken: 'refresh-token-xyz',
};

const mockUserRepository: jest.Mocked<IUserRepository> = {
  findByEmail: jest.fn(),
  findById: jest.fn(),
  save: jest.fn(),
  authenticate: jest.fn().mockResolvedValue(mockAuthResult),
  register: jest.fn(),
};

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new LoginUseCase(mockUserRepository);
  });

  it('should return AuthResultDTO on valid credentials', async () => {
    const result = await useCase.execute({ email: 'joao@example.com', password: 'secret123' });

    expect(result.user.id).toBe('user-1');
    expect(result.user.email).toBe('joao@example.com');
    expect(result.accessToken).toBe('access-token-abc');
    expect(result.refreshToken).toBe('refresh-token-xyz');
    expect(mockUserRepository.authenticate).toHaveBeenCalledWith('joao@example.com', 'secret123');
  });

  it('should throw INVALID_CREDENTIALS if email is empty', async () => {
    await expect(useCase.execute({ email: '', password: 'secret' })).rejects.toThrow(
      expect.objectContaining({ code: 'INVALID_CREDENTIALS' }),
    );
    expect(mockUserRepository.authenticate).not.toHaveBeenCalled();
  });

  it('should throw INVALID_CREDENTIALS if password is empty', async () => {
    await expect(useCase.execute({ email: 'joao@example.com', password: '' })).rejects.toThrow(
      expect.objectContaining({ code: 'INVALID_CREDENTIALS' }),
    );
  });

  it('should propagate errors thrown by the repository', async () => {
    mockUserRepository.authenticate.mockRejectedValueOnce(UserErrors.invalidCredentials());
    await expect(
      useCase.execute({ email: 'joao@example.com', password: 'wrong' }),
    ).rejects.toThrow(expect.objectContaining({ code: 'INVALID_CREDENTIALS' }));
  });
});
