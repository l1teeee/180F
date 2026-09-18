// docs/05-MOCK-DATA-STRATEGY.md amendment A3 (Codex M2): a customer created through the
// public booking flow has no membership yet, so it defaults to the single-class plan. Single
// source of truth - the repository layer and any store that needs the default both import
// this instead of each re-declaring the literal.
export const PUBLIC_DEFAULT_PLAN_ID = 'plan-day-pass';
