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
        
        // Use standard parser for other universities (like DUT)
        let id = "",
            name = "",
            instructor = "";
        const time: TKBType['time'] = [],
            weekRange: TKBType['weekRange'] = []

        const match = university.parserConfig.globalRegex.exec(s);

        if (!match) return null;

        // Find ID, name, and instructor based on university-specific patterns
        for (let i = 1; i < match.length; i++) {
            if (!match[i]) continue;

            const idMatch = match[i].match(university.parserConfig.patterns.id);
            if (!idMatch) continue;

            id = idMatch[0];
            name = match[i + 1];
            instructor = match[i + 2];

            const dateMatch = match[i + 3].match(university.parserConfig.patterns.dates);

            if (!dateMatch) continue;

            // Parse dates and time slots
            for (const date of dateMatch) {
                // Reset regex state
                university.parserConfig.patterns.date.lastIndex = 0;
                const dateArr = university.parserConfig.patterns.date.exec(date);

                if (!dateArr) continue;

                time.push({
                    date: dateArr[1] ? parseInt(dateArr[1], 10) : 8, // Default to Sunday if not found
                    class: dateArr[4],
                    lsStart: parseInt(dateArr[2]),
                    lsEnd: parseInt(dateArr[3])
                });
            }

            // Parse week ranges
            university.parserConfig.patterns.weeksRange.lastIndex = 0;
            const weekRangeMatches = university.parserConfig.patterns.weeksRange.exec(match[i + 4]);

            if (!weekRangeMatches) continue;

            const weekRangeArr = weekRangeMatches[0].split(';');

            for (const weekRangeStr of weekRangeArr) {
                university.parserConfig.patterns.weekRange.lastIndex = 0;
                const weekRangeMatch = university.parserConfig.patterns.weekRange.exec(weekRangeStr);

                if (!weekRangeMatch) continue;

                weekRange.push({
                    from: parseInt(weekRangeMatch[1]),
                    to: parseInt(weekRangeMatch[2])
                });
            }
            break;
        }

        return {
            id,
            name,
            instructor,
            time,
            weekRange
        };
    };
}

export default createUniversityParser;
