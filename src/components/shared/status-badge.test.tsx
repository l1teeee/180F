// docs/11-TEST-PLAN.md section 3 / docs/03-DESIGN-SYSTEM.md section 10: "status conveyed by
// label + shape, never colour alone".
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatusBadge, type StatusBadgeProps } from './status-badge';

// One row per distinct status value the component accepts (BookingStatus, CustomerStatus,
// InstructorStatus, AutomationStatus, OccupancyState) - 'active'/'paused' resolve identically
// across the unions that share them, so each unique value is exercised once.
const STATUSES: Array<{ status: StatusBadgeProps['status']; label: string }> = [
  { status: 'confirmed', label: 'Confirmed' },
  { status: 'pending', label: 'Pending' },
  { status: 'cancelled', label: 'Cancelled' },
  { status: 'waitlist', label: 'Waitlist' },
  { status: 'active', label: 'Active' },
  { status: 'paused', label: 'Paused' },
  { status: 'inactive', label: 'Inactive' },
  { status: 'available', label: 'Available' },
  { status: 'in_class', label: 'In class' },
  { status: 'off_today', label: 'Off today' },
  { status: 'almost_full', label: 'Almost full' },
  { status: 'full', label: 'Full' },
  { status: 'draft', label: 'Draft' },
];

describe('StatusBadge', () => {
  it.each(STATUSES)('renders the "$label" label as visible text for status "$status"', ({ status, label }) => {
    render(<StatusBadge status={status} />);
    expect(screen.getByText(label)).toBeVisible();
  });

  it.each(STATUSES)('renders a non-colour cue (icon) alongside the label for status "$status"', ({ status, label }) => {
    const { container } = render(<StatusBadge status={status} />);
    const badge = screen.getByText(label).closest('[data-slot="badge"]');
    expect(badge).not.toBeNull();
    const icon = badge!.querySelector('svg[aria-hidden="true"]');
    expect(icon).toBeInTheDocument();
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });

  it('renders a caller-supplied label override instead of the default status label', () => {
    render(<StatusBadge status="confirmed" label="Checked in" />);
    expect(screen.getByText('Checked in')).toBeVisible();
    expect(screen.queryByText('Confirmed')).not.toBeInTheDocument();
  });
});
