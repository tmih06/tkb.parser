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

export function parseUFLFormat(input: string): TKBType[] {
    const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length < 2) return [];

    try {
        const allCourses: TKBType[] = [];
        
        // Process lines in pairs (each course takes 2 lines)
        for (let i = 0; i < lines.length - 1; i += 2) {
            const line1 = lines[i];
            const line2 = lines[i + 1];
            
            // Skip lines that don't look like course entries
            if (!line1.includes('\t') || !line2.includes('\t')) continue;
            
            // Parse first line: number, name, credits, code
            const parts1 = line1.split('\t');
            if (parts1.length < 4) continue;
            
            const name = parts1[1];
            const id = parts1[3];
            
            // Parse second line: date, day, time, room, instructor
            const parts2 = line2.split('\t');
            if (parts2.length < 5) continue;
            
            const dateRange = parts2[0];
            const dayStr = parts2[1];
            const timeSlot = parts2[2];
            const room = parts2[3];
            const instructor = parts2[4] || '';
            
            // Parse day (3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday, 2=Monday)
            const day = parseInt(dayStr);
            if (day < 2 || day > 7) continue;
            
            // Parse time slot (e.g., "6-7", "1-4", "7-10")
            const timeMatch = timeSlot.match(/^(\d+)-(\d+)$/);
            if (!timeMatch) continue;
            
            const lsStart = parseInt(timeMatch[1]);
            const lsEnd = parseInt(timeMatch[2]);
            
            // Parse date range for week calculation
            const weekRange: TKBType['weekRange'] = [];
            const dateMatch = dateRange.match(/(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) {
                const startDate = new Date(dateMatch[1].split('/').reverse().join('-'));
                const endDate = new Date(dateMatch[2].split('/').reverse().join('-'));
                
                // Calculate week numbers (simplified)
                const startWeek = Math.ceil(startDate.getTime() / (7 * 24 * 60 * 60 * 1000)) % 52;
                const endWeek = Math.ceil(endDate.getTime() / (7 * 24 * 60 * 60 * 1000)) % 52;
                
                weekRange.push({
                    from: Math.max(1, startWeek),
                    to: Math.max(1, endWeek)
                });
            } else {
                weekRange.push({ from: 1, to: 16 }); // Default
            }
            
            const course: TKBType = {
                id: id || name,
                name,
                instructor: instructor || 'Chưa xác định',
                time: [{
                    date: day,
                    class: room || '',
                    lsStart,
                    lsEnd
                }],
                weekRange
            };
            
            allCourses.push(course);
        }
        
        console.log('Parsed UFL courses:', allCourses);
        return allCourses;
        
    } catch (error) {
        console.error('Error parsing UFL format:', error);
        return [];
    }
}

export default parseUFLFormat;
