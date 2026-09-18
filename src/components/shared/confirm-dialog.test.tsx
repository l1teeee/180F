// docs/11-TEST-PLAN.md section 3: the safe action (Cancel) must take focus on open, never the
// destructive action, so an Enter keypress right after the dialog opens can never confirm it.
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfirmDialog } from './confirm-dialog';

describe('ConfirmDialog', () => {
  it('focuses the Cancel button on open for a non-destructive confirmation', async () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Cancel booking"
        confirmLabel="Confirm"
        onConfirm={() => {}}
      />,
    );
    const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
    await waitFor(() => expect(cancelButton).toHaveFocus());
  });

  it('focuses the Cancel button on open for a destructive confirmation, never the destructive action', async () => {
    render(
      <ConfirmDialog
        open
        onOpenChange={() => {}}
        title="Delete customer"
        confirmLabel="Delete"
        destructive
        onConfirm={() => {}}
      />,
    );
    const cancelButton = await screen.findByRole('button', { name: 'Cancel' });
    const deleteButton = screen.getByRole('button', { name: 'Delete' });
    await waitFor(() => expect(cancelButton).toHaveFocus());
    expect(deleteButton).not.toHaveFocus();
  });

  it('does not render dialog content when closed', () => {
    render(
      <ConfirmDialog open={false} onOpenChange={() => {}} title="Delete customer" destructive onConfirm={() => {}} />,
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onConfirm and closes when the confirm action is activated', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    const onOpenChange = vi.fn();
    render(
      <ConfirmDialog open onOpenChange={onOpenChange} title="Delete customer" confirmLabel="Delete" destructive onConfirm={onConfirm} />,
    );
    const deleteButton = await screen.findByRole('button', { name: 'Delete' });
    deleteButton.click();
    await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });
});
