import api from './api';

describe('api request interceptor', () => {
  beforeEach(() => {
    localStorage.setItem('token', 'logged-in-user-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('keeps an explicit reset token when one is provided', () => {
    const config = {
      headers: {
        Authorization: 'Bearer reset-password-token'
      }
    };

    const result = api.interceptors.request.handlers[0].fulfilled(config);

    expect(result.headers.Authorization).toBe('Bearer reset-password-token');
  });
});
