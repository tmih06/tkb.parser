/*
 * MIT License
 *
 * Copyright (c) 2025 michioxd
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

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
