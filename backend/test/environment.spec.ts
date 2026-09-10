import { validateEnvironment } from '../src/config/environment';
const valid = { DATABASE_URL: 'postgresql://localhost/outdoor' };
describe('environment configuration', () => {
  it('uses safe development defaults', () => {
    expect(validateEnvironment(valid)).toMatchObject({ port: 3000, host: '127.0.0.1', nodeEnv: 'development' });
  });
  it.each(['', '0', '65536', '3.5', 'abc', ' 3000', '1e3'])('rejects invalid port %s', PORT => {
    expect(() => validateEnvironment({ ...valid, PORT })).toThrow('PORT');
  });
  it.each([undefined, '', 'secret', 'https://host/db', 'postgresql:///db', 'postgresql://host'])('rejects invalid database configuration', DATABASE_URL => {
    expect(() => validateEnvironment({ DATABASE_URL })).toThrow('DATABASE_URL');
  });
  it('does not expose database credentials in errors', () => {
    expect(() => validateEnvironment({ DATABASE_URL: 'https://user:private-password@host/db' })).toThrow('DATABASE_URL must include a PostgreSQL host and database');
  });
  it('rejects invalid mode and empty host', () => {
    expect(() => validateEnvironment({ ...valid, NODE_ENV: 'prod' })).toThrow('NODE_ENV');
    expect(() => validateEnvironment({ ...valid, HOST: '' })).toThrow('HOST');
  });
});
