import {
  InvalidParticipantNameError,
  InvalidParticipantEmailError,
} from '../errors/CalendarErrors';

export type ParticipantStatus = 'pending' | 'accepted' | 'declined';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Participant {
  private constructor(
    private readonly _name: string,
    private readonly _email: string | null,
    private readonly _status: ParticipantStatus,
  ) {}

  static create(props: { name: string; email?: string | null }): Participant {
    const trimmed = props.name.trim();
    if (trimmed.length === 0) {
      throw new InvalidParticipantNameError();
    }

    const email = props.email ?? null;
    if (email && !EMAIL_REGEX.test(email)) {
      throw new InvalidParticipantEmailError();
    }

    return new Participant(trimmed, email, 'pending');
  }

  get name(): string { return this._name; }
  get email(): string | null { return this._email; }
  get status(): ParticipantStatus { return this._status; }
}
