// docs/08-STATE-MANAGEMENT.md section 4 / docs/11-TEST-PLAN.md section 3.
import { describe, expect, it } from 'vitest';
import type { ClassType, Customer, Instructor } from '@/domain/types';
import { selectGlobalSearch } from './search';

const CUSTOMERS: Customer[] = [
  { id: 'cus-0001', name: 'Yoga Fan', email: 'yf@demo.180fitness.app', phone: '+57 300 000 0001', avatar: null, status: 'active', membershipId: 'plan-basic', joinedAt: '2024-01-01' },
  { id: 'cus-0002', name: 'Ana Yolanda', email: 'ay@demo.180fitness.app', phone: '+57 300 000 0002', avatar: null, status: 'active', membershipId: 'plan-basic', joinedAt: '2024-01-01' },
];

const CLASS_TYPES: ClassType[] = [
  { id: 'ct-yoga', name: 'Yoga', description: 'd', durationMinutes: 60, defaultCapacity: 18, category: 'mind_body', accent: 'green', icon: 'Flower2' },
];

const INSTRUCTORS: Instructor[] = [
  { id: 'ins-03', name: 'Instructor 03', avatar: null, specialty: 'Yoga', rating: 4.9, status: 'available', bio: 'b' },
];

describe('selectGlobalSearch', () => {
  it('returns [] for an empty query', () => {
    expect(selectGlobalSearch('', CUSTOMERS, CLASS_TYPES, INSTRUCTORS)).toEqual([]);
    expect(selectGlobalSearch('   ', CUSTOMERS, CLASS_TYPES, INSTRUCTORS)).toEqual([]);
  });

  it('a query matching more than one kind returns all of them, grouped by kind', () => {
    const results = selectGlobalSearch('yo', CUSTOMERS, CLASS_TYPES, INSTRUCTORS);
    const kinds = results.map((r) => r.kind);
    expect(kinds).toContain('customer');
    expect(kinds).toContain('class');
    expect(kinds).toContain('instructor');
    // grouped: every 'customer' entry appears before any 'class' entry, before any 'instructor' entry
    const firstClassIndex = kinds.indexOf('class');
    const lastCustomerIndex = kinds.lastIndexOf('customer');
    expect(lastCustomerIndex).toBeLessThan(firstClassIndex);
    const firstInstructorIndex = kinds.indexOf('instructor');
    const lastClassIndex = kinds.lastIndexOf('class');
    expect(lastClassIndex).toBeLessThan(firstInstructorIndex);
  });

  it('ranks an exact prefix match before a substring match within the same kind', () => {
    const results = selectGlobalSearch('yo', CUSTOMERS, [], []);
    // "Yoga Fan" starts with "yo"; "Ana Yolanda" only contains "yo" mid-string
    expect(results.map((r) => r.label)).toEqual(['Yoga Fan', 'Ana Yolanda']);
  });

  it('each result href resolves to that entity detail route', () => {
    const results = selectGlobalSearch('yoga', CUSTOMERS, CLASS_TYPES, INSTRUCTORS);
    const classResult = results.find((r) => r.kind === 'class');
    expect(classResult?.href).toBe('/classes/ct-yoga');
    const instructorResult = results.find((r) => r.kind === 'instructor');
    expect(instructorResult?.href).toBe('/instructors/ins-03');
  });
});
