import { UniversityConfig } from '../config/universities';
import parseUFLFormat from './uflParser';
import parseDUTFormat from './dutParser';
import parseDUTPreviewMode from './dutParser_previewmode';

export interface TKBType {
    id: string;
    name: string;
    instructor: string;
    time: {
        date: number;
        class: string;
        lsStart: number;
        lsEnd: number;
    }[];
    weekRange: {
        from: number;
        to: number;
    }[];
    originalDateRanges?: string[]; // Store original date ranges from input
    displayTimeInfo?: string; // Time info to display on separate line
}

export function createUniversityParser(university: UniversityConfig) {
    return function parseSchedule(s: string): TKBType | null {
        // Use specialized parser for UFL
        if (university.id === 'ufl') {
            const courses = parseUFLFormat(s);
            // For now, return the first course or null if no courses found
            // In the future, you might want to handle multiple courses differently
            return courses.length > 0 ? courses[0] : null;
        }
        
        // Use DUT parser for DUT university
        if (university.id === 'dut') {
            // Try standard DUT format first
            const result = parseDUTFormat(s, university);
            if (result) {
                return result;
            }
            
            // If standard format fails, try preview mode format
            const previewResults = parseDUTPreviewMode(s);
            return previewResults.length > 0 ? previewResults[0] : null;
        }
        
        // Default: use DUT parser for other universities with similar format
        return parseDUTFormat(s, university);
    };
}

export default createUniversityParser;
