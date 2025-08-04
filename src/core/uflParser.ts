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
    try {
        console.log('Starting UFL parsing with input length:', input.length);
        
        const lines = input.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);
        if (lines.length < 2) {
            console.log('Not enough lines to parse');
            return [];
        }

        // Filter out LMS3 and URL lines
        const filteredLines = lines.filter(line => {
            // Skip LMS3 lines
            if (line === 'LMS3') return false;
            // Skip URLs (lines starting with http)
            if (line.startsWith('http')) return false;
            return true;
        });
        
        console.log('Filtered lines count:', filteredLines.length);

       const allCourses: TKBType[] = [];
    
        // Process lines dynamically - some courses have 7 lines, some have 2 lines
        for (let i = 0; i < filteredLines.length; i++) {
            const courseLine = filteredLines[i];
            
            // Skip if not a course start line
            if (!/^\d+\t/.test(courseLine)) continue;
            
            // Parse course info line
            const courseParts = courseLine.split('\t');
            if (courseParts.length < 4) continue;
            
            const name = courseParts[1];
            const id = courseParts[3];
            
            // Check if this is a 7-line format, 2-line format, or 12-line format (3 timelines)
            // Look at the next few lines to determine format
            if (i + 1 >= filteredLines.length) continue;
            
            const nextLine = filteredLines[i + 1];
            
            // Count how many consecutive date lines we have after the course line
            let dateLineCount = 0;
            for (let j = i + 1; j < filteredLines.length && j < i + 5; j++) {
                if (filteredLines[j].includes('/') && filteredLines[j].includes('-')) {
                    dateLineCount++;
                } else {
                    break;
                }
            }
            
            // Determine format based on date line count and structure
            if (dateLineCount >= 3) {
                // Handle 12-line format (3 timelines)
                const course = parseThreeTimelineFormat(filteredLines, i, name, id);
                if (course.length > 0) {
                    allCourses.push(...course);
                }
                // Skip to after this 12-line course (approximately)
                i += 11;
                
            } else if (dateLineCount >= 2 || (nextLine.includes('/') && !nextLine.includes('\t')) || 
                      (nextLine.split('\t').length < 3)) {
                // Handle 7-line format (with GDQP breaks) or 6-line format (GDTC)
                // Check if we have enough lines for processing
                if (i + 5 >= filteredLines.length) {
                    // Not enough lines, skip
                    continue;
                }
                
                const dateLine1 = filteredLines[i + 1];  // First date range
                const dateLine2 = filteredLines[i + 2];  // Second date range + day1
                const dayLine2 = filteredLines[i + 3] || '';   // Day2 + time1
                const timeLine2 = filteredLines[i + 4] || '';  // Time2 + room1
                const roomLine2 = filteredLines[i + 5] || '';  // Room2 + instructor1
                const instructorLine2 = filteredLines[i + 6] || ''; // Instructor2 (may not exist for 6-line)
                
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
                const room1 = timeLine2Parts[1] || '-';
                
                const roomLine2Parts = roomLine2.split('\t');
                const room2 = roomLine2Parts[0] || '-';
                const instructor1 = roomLine2Parts[1] || '';
                
                const instructor2 = instructorLine2 ? instructorLine2.trim() : '';
                
                // For 6-line format (like GDTC), if no instructor found in normal positions,
                // take the last line as instructor
                let finalInstructor1 = instructor1;
                let finalInstructor2 = instructor2;
                
                if (!instructor1 && !instructor2 && roomLine2) {
                    // This might be a 6-line format where the last line is instructor
                    finalInstructor1 = roomLine2.trim();
                    finalInstructor2 = roomLine2.trim();
                }
                
                // Create courses for each schedule (take the first valid one)
                const schedules = [
                    { day: day1, time: time1, room: room1, instructor: finalInstructor1 },
                    { day: day2, time: time2, room: room2, instructor: finalInstructor2 }
                ].filter(s => s.day >= 2 && s.day <= 7 && s.time.includes('-'));
                
                const schedule = schedules[0];
                if (schedule) {
                    const timeMatch = schedule.time.match(/^(\d+)-(\d+)$/);
                    if (timeMatch) {
                        const lsStart = parseInt(timeMatch[1]);
                        const lsEnd = parseInt(timeMatch[2]);
                        
                        // Parse date ranges for week calculation
                        const allDateRanges = [dateRange1, dateRange2].filter(d => d && d.includes('/'));
                        
                        // Create separate courses for each date range
                        for (const range of allDateRanges) {
                            const dateMatch = range.trim().match(/(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/);
                            if (dateMatch) {
                                const startDate = new Date(dateMatch[1].split('/').reverse().join('-'));
                                const endDate = new Date(dateMatch[2].split('/').reverse().join('-'));
                                
                                // Calculate week numbers based on semester start
                                const semesterStart = new Date('2025-02-03');
                                const startWeek = Math.floor((startDate.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
                                const endWeek = Math.floor((endDate.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
                                
                                const singleWeekRange = [{
                                    from: Math.max(1, startWeek),
                                    to: Math.max(1, endWeek)
                                }];
                                
                                const course: TKBType = {
                                    id: id || name,
                                    name,
                                    instructor: schedule.instructor || '-',
                                    time: [{
                                        date: schedule.day,
                                        class: schedule.room === '-' ? '-' : (schedule.room || '-'),
                                        lsStart,
                                        lsEnd
                                    }],
                                    weekRange: singleWeekRange,
                                    originalDateRanges: [range.trim()],
                                    displayTimeInfo: ''
                                };
                                
                                allCourses.push(course);
                            }
                        }
                        
                        // If no valid date ranges found, create a default course
                        if (allDateRanges.length === 0) {
                            const course: TKBType = {
                                id: id || name,
                                name,
                                instructor: schedule.instructor || '-',
                                time: [{
                                    date: schedule.day,
                                    class: schedule.room === '-' ? '-' : (schedule.room || '-'),
                                    lsStart,
                                    lsEnd
                                }],
                                weekRange: [{ from: 1, to: 16 }],
                                originalDateRanges: [],
                                displayTimeInfo: ''
                            };
                            
                            allCourses.push(course);
                        }
                    }
                }
                
                // Skip to after this 7-line course (or 6-line for GDTC)
                // Check if instructor2 line exists
                const skipLines = 5;
                i += skipLines;
                
            } else if (i + 1 < filteredLines.length) {
                // Handle 2-line format (normal format)
                const scheduleLine = filteredLines[i + 1];
                const scheduleParts = scheduleLine.split('\t');
                
                if (scheduleParts.length >= 5) {
                    const dateRange = scheduleParts[0];
                    const dayStr = scheduleParts[1];
                    const timeSlot = scheduleParts[2];
                    const room = scheduleParts[3];
                    const instructor = scheduleParts[4] || '';
                    
                    const day = parseInt(dayStr);
                    if (day >= 2 && day <= 7) {
                        const timeMatch = timeSlot.match(/^(\d+)-(\d+)$/);
                        if (timeMatch) {
                            const lsStart = parseInt(timeMatch[1]);
                            const lsEnd = parseInt(timeMatch[2]);
                            
                            // Parse date range for week calculation
                            const weekRange: TKBType['weekRange'] = [];
                            const dateMatch = dateRange.match(/(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/);
                            if (dateMatch) {
                                const startDate = new Date(dateMatch[1].split('/').reverse().join('-'));
                                const endDate = new Date(dateMatch[2].split('/').reverse().join('-'));
                                
                                // Calculate week numbers based on semester start
                                const semesterStart = startDate.getFullYear() === 2024 ? 
                                    new Date('2024-09-01') : new Date('2025-02-03');
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
                                instructor: instructor || '-',
                                time: [{
                                    date: day,
                                    class: room || '-',
                                    lsStart,
                                    lsEnd
                                }],
                                weekRange,
                                originalDateRanges: [dateRange],
                                displayTimeInfo: ''
                            };
                            
                            allCourses.push(course);
                        }
                    }
                }
                
                // Skip to after this 2-line course
                i += 1;
            }
        }
        
        // Add time information to course names instead of deduplicating
        const coursesWithTimeInfo = addTimeInfoToCourses(allCourses);
        
        return coursesWithTimeInfo;
        
    } catch (error) {
        console.error('Error parsing UFL format:', error);
        return [];
    }
}

function addTimeInfoToCourses(courses: TKBType[]): TKBType[] {
    const processedCourses: TKBType[] = [];
    
    for (const course of courses) {
        // Add date range information from original date ranges to separate field
        let timeInfo = '';
        if (course.originalDateRanges && course.originalDateRanges.length > 0) {
            const dateRanges = course.originalDateRanges.map(dateRange => {
                const dateMatch = dateRange.trim().match(/(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/);
                if (dateMatch) {
                    const startDate = dateMatch[1];
                    const endDate = dateMatch[2];
                    return `${formatDateString(startDate)} - ${formatDateString(endDate)}`;
                }
                return dateRange;
            }).join(', ');
            timeInfo = dateRanges;
        }
        
        const updatedCourse: TKBType = {
            ...course,
            displayTimeInfo: timeInfo
        };
        
        processedCourses.push(updatedCourse);
    }
    
    return processedCourses;
}

function formatDateString(dateString: string): string {
    // Convert from dd/mm/yyyy to dd/mm/yy
    const parts = dateString.split('/');
    if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2].slice(-2); // Get last 2 digits
        return `${day}/${month}/${year}`;
    }
    return dateString;
}

function parseThreeTimelineFormat(filteredLines: string[], startIndex: number, name: string, id: string): TKBType[] {
    const courses: TKBType[] = [];
    
    // Structure for 3-timeline format:
    // Line 0: Course info
    // Line 1: Date range 1
    // Line 2: Date range 2  
    // Line 3: Date range 3 + day 1
    // Line 4: Day 2
    // Line 5: Day 3 + time 1
    // Line 6: Time 2
    // Line 7: Time 3 + room 1
    // Line 8: Room 2
    // Line 9: Room 3 + instructor 1
    // Line 10: Instructor 2
    // Line 11: Instructor 3
    
    if (startIndex + 11 >= filteredLines.length) return courses;
    
    // Parse date ranges
    const dateRange1 = filteredLines[startIndex + 1].trim();
    const dateRange2 = filteredLines[startIndex + 2].trim();
    const dateRange3Parts = filteredLines[startIndex + 3].split('\t');
    const dateRange3 = dateRange3Parts[0];
    const day1 = parseInt(dateRange3Parts[1] || '0');
    
    // Parse days
    const day2 = parseInt(filteredLines[startIndex + 4].trim());
    const dayTimeParts = filteredLines[startIndex + 5].split('\t');
    const day3 = parseInt(dayTimeParts[0] || '0');
    const time1 = dayTimeParts[1] || '';
    
    // Parse times
    const time2 = filteredLines[startIndex + 6].trim();
    const timeRoomParts = filteredLines[startIndex + 7].split('\t');
    const time3 = timeRoomParts[0] || '';
    const room1 = timeRoomParts[1] || '';
    
    // Parse rooms
    const room2 = filteredLines[startIndex + 8].trim();
    const roomInstructorParts = filteredLines[startIndex + 9].split('\t');
    const room3 = roomInstructorParts[0] || '';
    const instructor1 = roomInstructorParts[1] || '';
    
    // Parse instructors
    const instructor2 = filteredLines[startIndex + 10].trim();
    const instructor3 = filteredLines[startIndex + 11].trim();
    
    // Create courses for each valid timeline
    const timelines = [
        { day: day1, time: time1, room: room1, instructor: instructor1, dateRange: dateRange1 },
        { day: day2, time: time2, room: room2, instructor: instructor2, dateRange: dateRange2 },
        { day: day3, time: time3, room: room3, instructor: instructor3, dateRange: dateRange3 }
    ];
    
    for (const timeline of timelines) {
        if (timeline.day >= 2 && timeline.day <= 7 && timeline.time.includes('-')) {
            const timeMatch = timeline.time.match(/^(\d+)-(\d+)$/);
            if (timeMatch) {
                const lsStart = parseInt(timeMatch[1]);
                const lsEnd = parseInt(timeMatch[2]);
                
                // Parse date range for week calculation
                const weekRange: TKBType['weekRange'] = [];
                const dateMatch = timeline.dateRange.trim().match(/(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/);
                if (dateMatch) {
                    const startDate = new Date(dateMatch[1].split('/').reverse().join('-'));
                    const endDate = new Date(dateMatch[2].split('/').reverse().join('-'));
                    
                    // Calculate week numbers based on semester start
                    const semesterStart = startDate.getFullYear() === 2024 ? 
                        new Date('2024-12-01') : new Date('2025-02-03');
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
                    instructor: timeline.instructor || '-',
                    time: [{
                        date: timeline.day,
                        class: timeline.room || '-',
                        lsStart,
                        lsEnd
                    }],
                    weekRange,
                    originalDateRanges: [timeline.dateRange],
                    displayTimeInfo: ''
                };
                
                courses.push(course);
            }
        }
    }
    
    return courses;
}

export default parseUFLFormat;
