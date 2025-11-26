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

import { TKBType } from './universityParser';

/**
 * Parser for DUT preview mode format (tab-separated format)
 * Format: ID | CourseID | CourseName | Credits | Instructor | Time&Location | Weeks | ...
 * Example: 1	2090160.2520.24.16	Chủ nghĩa Xã hội khoa học	2	Trương Thị Thu Hiền	Thứ 6: 1-2,F207	22-27;31-40
 */
export function parseDUTPreviewMode(input: string): TKBType[] {
    const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    const courses: TKBType[] = [];

    // Day name to number mapping
    const dayMap: { [key: string]: number } = {
        'Thứ 2': 2,
        'Thứ 3': 3,
        'Thứ 4': 4,
        'Thứ 5': 5,
        'Thứ 6': 6,
        'Thứ 7': 7,
        'Chủ nhật': 8
    };

    for (const line of lines) {
        const columns = line.split('\t').map(col => col.trim());
        
        // Need at least 7 columns
        if (columns.length < 7) continue;

        const courseId = columns[1];
        const courseName = columns[2];
        const instructor = columns[4];
        const timeLocationStr = columns[5];
        const weeksStr = columns[6];

        // Skip if essential data is missing
        if (!courseName || !instructor || !timeLocationStr || !weeksStr) continue;

        const time: TKBType['time'] = [];
        const weekRange: TKBType['weekRange'] = [];

        // Parse time and location
        // Format: "Thứ 6: 1-2,F207" or "Thứ 3: 2-3,C128;4: 7-8,C128;6: 9-10,C128"
        const timeSlots = timeLocationStr.split(';');
        
        for (const slot of timeSlots) {
            // Match pattern: "Thứ X: Y-Z,Location" or "X: Y-Z,Location"
            const fullDayMatch = slot.match(/(Thứ \d|Chủ nhật):\s*(\d+)-(\d+),([^;]+)/);
            const shortDayMatch = slot.match(/(\d):\s*(\d+)-(\d+),([^;]+)/);
            
            if (fullDayMatch) {
                const dayName = fullDayMatch[1];
                const dayNumber = dayMap[dayName] || 8;
                const lsStart = parseInt(fullDayMatch[2], 10);
                const lsEnd = parseInt(fullDayMatch[3], 10);
                const location = fullDayMatch[4].trim();

                time.push({
                    date: dayNumber,
                    class: location,
                    lsStart,
                    lsEnd
                });
            } else if (shortDayMatch) {
                // This is a continuation from previous day pattern (e.g., "4: 7-8,C128")
                // Use the day number directly
                const dayNumber = parseInt(shortDayMatch[1], 10);
                const lsStart = parseInt(shortDayMatch[2], 10);
                const lsEnd = parseInt(shortDayMatch[3], 10);
                const location = shortDayMatch[4].trim();

                time.push({
                    date: dayNumber,
                    class: location,
                    lsStart,
                    lsEnd
                });
            }
        }

        // Parse week ranges
        // Format: "22-27;31-40"
        const weekRanges = weeksStr.split(';');
        for (const range of weekRanges) {
            const weekMatch = range.match(/(\d+)-(\d+)/);
            if (weekMatch) {
                weekRange.push({
                    from: parseInt(weekMatch[1], 10),
                    to: parseInt(weekMatch[2], 10)
                });
            }
        }

        // Only add course if we have valid time and week data
        if (time.length > 0 && weekRange.length > 0) {
            courses.push({
                id: courseId,
                name: courseName,
                instructor,
                time,
                weekRange
            });
        }
    }

    return courses;
}

export default parseDUTPreviewMode;
