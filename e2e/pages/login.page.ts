// docs/11-TEST-PLAN.md e2e/01-login-to-dashboard.spec.ts; master plan section 16 (fields:
// Email, Password, Remember me; CTA: Sign in) and section 44 (demo credentials).
import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly signInButton: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByLabel(/password/i);
    // "Remember me" is a shadcn Switch, not a checkbox primitive (src/components/auth/
    // login-form.tsx's own header comment explains why) - its ARIA role is "switch".
    this.rememberMeCheckbox = page.getByRole('switch', { name: /remember me/i });
    this.signInButton = page.getByRole('button', { name: /sign in/i });
    // A plain <button type="button">, not an <a> - there is nowhere for it to link to in this
    // demo (it only ever shows a toast), so it never got an href.
    this.forgotPasswordLink = page.getByRole('button', { name: /forgot password/i });
    // Master plan does not specify a role for the invalid-credentials message; `alert` is the
    // conventional accessible role for a form-level error banner. Next.js also renders its own
    // permanent, empty #__next-route-announcer__ with role="alert" on every page - filtering to
    // one that actually has text excludes it.
    this.errorMessage = page.getByRole('alert').filter({ hasText: /.+/ });
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async signIn(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
