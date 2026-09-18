// docs/08-STATE-MANAGEMENT.md section 1.
import { create } from 'zustand';
import type { Instructor, InstructorStatus } from '@/domain/types';

interface InstructorState {
  instructors: Instructor[];
  setInstructors: (instructors: Instructor[]) => void;
  setInstructorStatus: (instructorId: string, status: InstructorStatus) => void;
}

export const useInstructorStore = create<InstructorState>()((set) => ({
  instructors: [],

  setInstructors: (instructors) => set({ instructors }),

  setInstructorStatus: (instructorId, status) =>
    set((state) => ({
      instructors: state.instructors.map((instructor) =>
        instructor.id === instructorId ? { ...instructor, status } : instructor,
      ),
    })),
}));
