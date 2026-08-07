

import { UniversityConfig } from '../config/universities';
import parseDUTPreviewMode from './dutParser_previewmode';
import type { TKBType } from './universityParser';

export function parseDUTFormat(s: string, university: UniversityConfig): TKBType | null {
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
}

function isCompleteCourse(course: TKBType | null): course is TKBType {
    return course !== null
        && Boolean(course.id)
        && Boolean(course.name)
        && Boolean(course.instructor)
        && course.time.length > 0
        && course.weekRange.length > 0;
}

/** Parse a complete DUT paste while retaining all supported one-line formats. */
export function parseDUTInput(input: string, university: UniversityConfig): TKBType[] {
    const singleLineCourses = input
        .replace(/\r\n/g, '\n')
        .split('\n')
        .map(line => parseDUTFormat(line, university))
        .filter(isCompleteCourse);
    const multilineCourses = parseDUTPreviewMode(input);
    const singleLineById = new Map(singleLineCourses.map(course => [course.id, course]));
    const addedIds = new Set<string>();
    const courses: TKBType[] = [];

    // Prefer the established parser when both formats recognize the same row.
    // The bulk parser contributes records that exist only in the multiline data.
    for (const course of multilineCourses) {
        if (addedIds.has(course.id)) continue;
        courses.push(singleLineById.get(course.id) ?? course);
        addedIds.add(course.id);
    }

    for (const course of singleLineCourses) {
        if (addedIds.has(course.id)) continue;
        courses.push(course);
        addedIds.add(course.id);
    }

    return courses;
}

export default parseDUTFormat;
