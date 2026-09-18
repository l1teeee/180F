// ADR-010. jsdom (vitest.config.ts) provides window.localStorage.
import { beforeEach, describe, expect, it } from 'vitest';
import { DemoAuthProvider } from './demo-auth-provider';

describe('DemoAuthProvider', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('accepts the demo credentials', async () => {
    const provider = new DemoAuthProvider();
    const user = await provider.signIn('admin@demo.com', 'demo1234');
    expect(user.email).toBe('admin@demo.com');
  });

  it('accepts the demo email case-insensitively and with surrounding whitespace', async () => {
    const provider = new DemoAuthProvider();
    const user = await provider.signIn('  Admin@Demo.com  ', 'demo1234');
    expect(user.email).toBe('admin@demo.com');
  });

  it('rejects a wrong password', async () => {
    const provider = new DemoAuthProvider();
    await expect(provider.signIn('admin@demo.com', 'wrong-password')).rejects.toThrow();
  });

  it('rejects an email that is not the demo account', async () => {
    const provider = new DemoAuthProvider();
    await expect(provider.signIn('someone@else.com', 'demo1234')).rejects.toThrow();
  });

  it('persists the session so getSession resolves it after sign-in', async () => {
    const provider = new DemoAuthProvider();
    await provider.signIn('admin@demo.com', 'demo1234');
    const session = await provider.getSession();
    expect(session?.email).toBe('admin@demo.com');
  });

  it('getSession resolves null when nothing was signed in', async () => {
    const provider = new DemoAuthProvider();
    const session = await provider.getSession();
    expect(session).toBeNull();
  });

  it('signOut clears the persisted session', async () => {
    const provider = new DemoAuthProvider();
    await provider.signIn('admin@demo.com', 'demo1234');
    await provider.signOut();
    const session = await provider.getSession();
    expect(session).toBeNull();
  });
});
