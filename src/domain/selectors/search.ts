// docs/08-STATE-MANAGEMENT.md section 4. Results are grouped by kind (customers, then
// classes, then instructors) and, within a kind, prefix matches rank before substring
// matches (master plan section 41's grouped-dropdown example).
import type { ClassType, Customer, Instructor, SearchResult } from '@/domain/types';

// An item can match on more than one field (an instructor by their own name or their specialty).
// It ranks as a prefix match if any field is a prefix match, otherwise a substring match if any
// field contains the query, so "find by own name" only adds a field - it never demotes a match
// that already worked through another field.
function rankByQuery<T>(items: T[], query: string, getLabels: (item: T) => string[]): T[] {
  const prefixMatches: T[] = [];
  const substringMatches: T[] = [];
  for (const item of items) {
    const labels = getLabels(item).map((label) => label.toLowerCase());
    if (labels.some((label) => label.startsWith(query))) {
      prefixMatches.push(item);
    } else if (labels.some((label) => label.includes(query))) {
      substringMatches.push(item);
    }
  }
  return [...prefixMatches, ...substringMatches];
}

export function selectGlobalSearch(
  query: string,
  customers: Customer[],
  classTypes: ClassType[],
  instructors: Instructor[],
): SearchResult[] {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  const customerResults: SearchResult[] = rankByQuery(customers, trimmed, (customer) => [customer.name]).map(
    (customer) => ({
      id: customer.id,
      kind: 'customer',
      label: customer.name,
      sublabel: customer.email,
      href: `/customers/${customer.id}`,
    }),
  );

  const classResults: SearchResult[] = rankByQuery(classTypes, trimmed, (classType) => [classType.name]).map(
    (classType) => ({
      id: classType.id,
      kind: 'class',
      label: classType.name,
      sublabel: `${classType.durationMinutes} min`,
      href: `/classes/${classType.id}`,
    }),
  );

  // Instructor names are generic ('Instructor 03', the privacy rule from docs/04 section 2), but
  // they must still be findable by that name - a studio owner also searches by specialty
  // ("yoga"), so both fields feed the match.
  const instructorResults: SearchResult[] = rankByQuery(instructors, trimmed, (instructor) => [
    instructor.name,
    instructor.specialty,
  ]).map((instructor) => ({
    id: instructor.id,
    kind: 'instructor',
    label: instructor.name,
    sublabel: instructor.specialty,
    href: `/instructors/${instructor.id}`,
  }));

  return [...customerResults, ...classResults, ...instructorResults];
}
