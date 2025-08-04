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
        // Check if there's a "Giáo dục quốc phòng" subject (National Defense Education)
        const hasNationalDefense = input.toLowerCase().includes('giáo dục quốc phòng');
        
        if (hasNationalDefense) {
            // Parse format like test-ufl.txt (with duplicated data and multiple lines per course)
            return parseNationalDefenseFormat(lines);
        } else {
            // Parse format like test-ufl2.txt (normal format, 2 lines per course)
            return parseNormalFormat(lines);
        }
        
    } catch (error) {
        console.error('Error parsing UFL format:', error);
        return [];
    }
}

function parseNormalFormat(lines: string[]): TKBType[] {
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
        
        // Parse day
        const day = parseInt(dayStr);
        if (day < 2 || day > 7) continue;
        
        // Parse time slot
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
            
            // Calculate week numbers based on semester start
            const semesterStart = new Date(startDate.getFullYear(), 8, 1); // September 1st
            const startWeek = Math.floor((startDate.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
            const endWeek = Math.floor((endDate.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
            
            weekRange.push({
                from: Math.max(1, startWeek),
                to: Math.max(1, endWeek)
            });
        } else {
            weekRange.push({ from: 1, to: 16 });
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
    
    console.log('Parsed UFL courses (normal format):', allCourses);
    return allCourses;
}

function parseNationalDefenseFormat(lines: string[]): TKBType[] {
    const allCourses: TKBType[] = [];
    
    // Process 7 lines at a time (each course takes exactly 7 lines)
    for (let i = 0; i < lines.length; i += 7) {
        // Make sure we have at least 7 lines for this course
        if (i + 6 >= lines.length) break;
        
        // Get the 7 lines for this course
        const courseLine = lines[i];     // Course info
        const dateLine1 = lines[i + 1];  // First date range
        const dateLine2 = lines[i + 2];  // Second date range + day1
        const dayLine2 = lines[i + 3];   // Day2 + time1
        const timeLine2 = lines[i + 4];  // Time2 + room1
        const roomLine2 = lines[i + 5];  // Room2 + instructor1
        const instructorLine2 = lines[i + 6]; // Instructor2
        
        // Skip if not a course start line
        if (!/^\d+\t/.test(courseLine)) continue;
        
        // Parse course info line
        const courseParts = courseLine.split('\t');
        if (courseParts.length < 4) continue;
        
        const name = courseParts[1];
        const id = courseParts[3];
        
        // Parse date ranges
        const dateRange1 = dateLine1.trim();
        const dateLine2Parts = dateLine2.split('\t');
        const dateRange2 = dateLine2Parts[0];
        const day1 = parseInt(dateLine2Parts[1] || '0');
        
        // Parse schedule info
        const dayLine2Parts = dayLine2.split('\t');
        const day2 = parseInt(dayLine2Parts[0] || '0');
        const time1 = dayLine2Parts[1] || '';
        
        const timeLine2Parts = timeLine2.split('\t');
        const time2 = timeLine2Parts[0] || '';
        const room1 = timeLine2Parts[1] || '';
        
        const roomLine2Parts = roomLine2.split('\t');
        const room2 = roomLine2Parts[0] || '';
        const instructor1 = roomLine2Parts[1] || '';
        
        const instructor2 = instructorLine2.trim();
        
        // Create courses for each schedule (we take the first occurrence of each)
        const schedules = [
            { day: day1, time: time1, room: room1, instructor: instructor1 },
            { day: day2, time: time2, room: room2, instructor: instructor2 }
        ].filter(s => s.day >= 2 && s.day <= 7 && s.time.includes('-'));
        
        // Take only the first valid schedule to avoid duplicates
        const schedule = schedules[0];
        if (!schedule) continue;
        
        const timeMatch = schedule.time.match(/^(\d+)-(\d+)$/);
        if (!timeMatch) continue;
        
        const lsStart = parseInt(timeMatch[1]);
        const lsEnd = parseInt(timeMatch[2]);
        
        // Parse date ranges for week calculation
        const weekRange: TKBType['weekRange'] = [];
        const allDateRanges = [dateRange1, dateRange2].filter(d => d && d.includes('/'));
        
        for (const range of allDateRanges) {
            const dateMatch = range.trim().match(/(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/);
            if (dateMatch) {
                const startDate = new Date(dateMatch[1].split('/').reverse().join('-'));
                const endDate = new Date(dateMatch[2].split('/').reverse().join('-'));
                
                // Calculate week numbers based on semester start (February)
                const semesterStart = new Date('2025-02-03');
                const startWeek = Math.floor((startDate.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
                const endWeek = Math.floor((endDate.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
                
                weekRange.push({
                    from: Math.max(1, startWeek),
                    to: Math.max(1, endWeek)
                });
            }
        }
        
        if (weekRange.length === 0) {
            weekRange.push({ from: 1, to: 16 });
        }
        
        const course: TKBType = {
            id: id || name,
            name,
            instructor: schedule.instructor || 'Chưa xác định',
            time: [{
                date: schedule.day,
                class: schedule.room || '',
                lsStart,
                lsEnd
            }],
            weekRange
        };
        
        allCourses.push(course);
    }
    
    console.log('Parsed UFL courses (national defense format):', allCourses);
    console.log('Note: Schedule includes National Defense Education break period');
    return allCourses;
}

export default parseUFLFormat;
