import { UniversityConfig, TimeSlot } from '../config/universities';

export function getUniversityTimeRange(university: UniversityConfig): TimeSlot[] {
    return university.timeSlots;
}

export default getUniversityTimeRange;
