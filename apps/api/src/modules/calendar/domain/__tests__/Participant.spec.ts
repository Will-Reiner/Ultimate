import { Participant } from '../value-objects/Participant';
import {
  InvalidParticipantNameError,
  InvalidParticipantEmailError,
} from '../errors/CalendarErrors';

describe('Participant', () => {
  it('deve criar com nome obrigatório', () => {
    const p = Participant.create({ name: 'João' });
    expect(p.name).toBe('João');
    expect(p.email).toBeNull();
    expect(p.status).toBe('pending');
  });

  it('deve rejeitar nome vazio', () => {
    expect(() => Participant.create({ name: '' })).toThrow(InvalidParticipantNameError);
    expect(() => Participant.create({ name: '   ' })).toThrow(InvalidParticipantNameError);
  });

  it('deve permitir email opcional', () => {
    const p = Participant.create({ name: 'João', email: 'joao@email.com' });
    expect(p.email).toBe('joao@email.com');
  });

  it('deve iniciar com status "pending"', () => {
    const p = Participant.create({ name: 'João' });
    expect(p.status).toBe('pending');
  });

  it('deve validar formato de email quando fornecido', () => {
    expect(() => Participant.create({ name: 'João', email: 'invalid' })).toThrow(
      InvalidParticipantEmailError,
    );
    expect(() => Participant.create({ name: 'João', email: 'no-at-sign' })).toThrow(
      InvalidParticipantEmailError,
    );
  });

  it('deve fazer trim no nome', () => {
    const p = Participant.create({ name: '  João  ' });
    expect(p.name).toBe('João');
  });
});
