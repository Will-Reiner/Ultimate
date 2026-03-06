import { ID, Timestamps } from '@shared/types';
import { UserErrors } from '../errors/UserErrors';

export interface UserProps {
  id: ID;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  private constructor(private readonly props: UserProps) {}

  static create(props: UserProps): User {
    if (!props.name || props.name.trim().length < 2) {
      throw UserErrors.invalidName();
    }

    if (!User.isValidEmail(props.email)) {
      throw UserErrors.invalidEmail();
    }

    return new User({ ...props, name: props.name.trim() });
  }

  static restore(props: UserProps): User {
    return new User(props);
  }

  get id(): ID { return this.props.id; }
  get name(): string { return this.props.name; }
  get email(): string { return this.props.email; }
  get avatarUrl(): string | undefined { return this.props.avatarUrl; }
  get createdAt(): Date { return this.props.createdAt; }
  get updatedAt(): Date { return this.props.updatedAt; }

  private static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  toJSON(): UserProps {
    return { ...this.props };
  }
}
