// master plan section 25 (Customers: top metrics Total customers/Active memberships/New this
// month/Inactive; table columns Avatar/Customer/Membership/Last visit/Classes this month/
// Status; search + filters + pagination). Used by e2e/04-customer-detail.spec.ts.
import type { Locator, Page } from '@playwright/test';
import { CustomerDetailPage } from './customer-detail.page';

export class CustomersPage {
  readonly page: Page;
  readonly searchInput: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchInput = page.getByRole('searchbox');
    this.table = page.getByRole('table', { name: /customers/i });
  }

  async goto(): Promise<void> {
    await this.page.goto('/customers');
  }

  rowByName(name: string): Locator {
    return this.table.getByRole('row', { name: new RegExp(name) });
  }

  async openCustomer(name: string): Promise<CustomerDetailPage> {
    await this.rowByName(name).click();
    return new CustomerDetailPage(this.page);
  }
}
