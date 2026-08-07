import type { TKBType } from './universityParser';

const COURSE_ID_PATTERN = /^(?=.*\d)(?=.*\.)[A-Za-z0-9.^-]+$/;
const ORDINAL_PATTERN = /^\d+$/;
const CREDIT_PATTERN = /^\d+(?:[.,]\d+)?$/;
const TIME_FIELD_PATTERN = /(?:Thứ\s*[2-7]|Chủ\s*nhật|(?:^|;\s*)[2-7])\s*[:,]\s*\d+\s*-\s*\d+\s*,/iu;
const WEEK_FIELD_PATTERN = /^\d+\s*(?:-\s*\d+)?(?:\s*;\s*\d+\s*(?:-\s*\d+)?)*$/;

function normalizeOrdinal(value: string): string {
    return value.replace(/^\uFEFF/, '').replace(/^["'“”]+/, '').trim();
}

function normalizeCourseId(value: string): string {
    return value.replace(/^["'“”]+|["'“”]+$/g, '').trim();
}

function splitRecords(input: string): string[][] {
    const tokens = input
        .split(/[\t\r\n]+/)
        .map(token => token.trim())
        .filter(Boolean);
    const recordStarts: number[] = [];

    for (let index = 0; index < tokens.length - 1; index++) {
        const ordinal = normalizeOrdinal(tokens[index]);
        const courseId = normalizeCourseId(tokens[index + 1]);

        if (ORDINAL_PATTERN.test(ordinal) && COURSE_ID_PATTERN.test(courseId)) {
            recordStarts.push(index);
        }
    }

    return recordStarts.map((start, index) => {
        const end = recordStarts[index + 1] ?? tokens.length;
        return tokens.slice(start, end);
    });
}

function parseTimeSlots(value: string): TKBType['time'] {
    const time: TKBType['time'] = [];

    for (const slot of value.split(/\s*;\s*/)) {
        // Accept both registration-web syntax (`Thứ 2: 1-2,A101`) and
        // student-web syntax (`Thứ 2,1-2,A101`). A bare day number is used
        // by some older registration pages for subsequent time slots.
        const match = slot.match(/^(?:(?:Thứ\s*)?([2-7])|(Chủ\s*nhật))\s*[:,]\s*(\d+)\s*-\s*(\d+)\s*,\s*(.+)$/iu);
        if (!match) continue;

        const date = match[1] ? Number.parseInt(match[1], 10) : 8;
        const lsStart = Number.parseInt(match[3], 10);
        const lsEnd = Number.parseInt(match[4], 10);
        const location = match[5].trim();

        if (!location || lsStart > lsEnd) continue;

        time.push({
            date,
            class: location,
            lsStart,
            lsEnd
        });
    }

    return time;
}

function parseWeekRanges(value: string): TKBType['weekRange'] {
    const weekRange: TKBType['weekRange'] = [];

    for (const range of value.split(/\s*;\s*/)) {
        const match = range.match(/^(\d+)\s*(?:-\s*(\d+))?$/);
        if (!match) continue;

        const from = Number.parseInt(match[1], 10);
        const to = Number.parseInt(match[2] ?? match[1], 10);

        if (from > to) continue;
        weekRange.push({ from, to });
    }

    return weekRange;
}

function parseRecord(fields: string[]): TKBType | null {
    const courseId = normalizeCourseId(fields[1] ?? '');
    const timeIndex = fields.findIndex((field, index) => index >= 3 && TIME_FIELD_PATTERN.test(field));

    if (!COURSE_ID_PATTERN.test(courseId) || timeIndex < 0) return null;

    const weeksIndex = fields.findIndex((field, index) => index > timeIndex && WEEK_FIELD_PATTERN.test(field));
    if (weeksIndex < 0) return null;

    const creditIndex = fields.findIndex((field, index) => (
        index > 2
        && index < timeIndex
        && CREDIT_PATTERN.test(field)
    ));
    const instructorStart = creditIndex >= 0 ? creditIndex + 1 : timeIndex - 1;
    const courseNameEnd = creditIndex >= 0 ? creditIndex : instructorStart;
    const courseName = fields.slice(2, courseNameEnd).join(' ').trim();
    const instructor = fields.slice(instructorStart, timeIndex).join(' ').trim();
    const timeLocation = fields.slice(timeIndex, weeksIndex).join('; ');
    const time = parseTimeSlots(timeLocation);
    const weekRange = parseWeekRanges(fields[weeksIndex]);

    if (!courseName || !instructor || time.length === 0 || weekRange.length === 0) return null;

    return {
        id: courseId,
        name: courseName,
        instructor,
        time,
        weekRange
    };
}

/**
 * Parser for the tab-separated DUT registration format.
 *
 * Older pages put a course on one line. The current page copies the ordinal and
 * ID, course name, and remaining columns onto separate lines. Tokenizing the
 * complete input and detecting `ordinal + course ID` boundaries supports both
 * layouts without depending on unstable metadata columns after the week range.
 */
export function parseDUTPreviewMode(input: string): TKBType[] {
    return splitRecords(input)
        .map(parseRecord)
        .filter((course): course is TKBType => course !== null);
}

export default parseDUTPreviewMode;
