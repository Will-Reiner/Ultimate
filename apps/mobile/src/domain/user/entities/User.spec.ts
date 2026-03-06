import { User } from '../entities/User';
import { UserErrors } from '../errors/UserErrors';

describe('User entity', () => {
  const validProps = {
    id: 'user-1',
    name: 'João Silva',
    email: 'joao@example.com',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
  };

  it('should create a user with valid props', () => {
    const user = User.create(validProps);
    expect(user.id).toBe('user-1');
    expect(user.name).toBe('João Silva');
    expect(user.email).toBe('joao@example.com');
  });

  it('should trim the name on creation', () => {
    const user = User.create({ ...validProps, name: '  Ana  ' });
    expect(user.name).toBe('Ana');
  });

  it('should throw INVALID_NAME if name has less than 2 characters', () => {
    expect(() => User.create({ ...validProps, name: 'J' })).toThrow(
      expect.objectContaining({ code: 'INVALID_NAME' }),
    );
  });

  it('should throw INVALID_EMAIL for malformed email', () => {
    expect(() => User.create({ ...validProps, email: 'not-an-email' })).toThrow(
      expect.objectContaining({ code: 'INVALID_EMAIL' }),
    );
  });

  it('should restore a user without validation', () => {
    // restore is used when loading from persistence — should not throw
    const user = User.restore({ ...validProps, name: 'X' });
    expect(user.name).toBe('X');
  });

  it('should serialize to JSON correctly', () => {
    const user = User.create(validProps);
    const json = user.toJSON();
    expect(json.id).toBe('user-1');
    expect(json.email).toBe('joao@example.com');
  });
});
