import type { UniversityConfig } from '../config/universities';
import type { TKBType } from './universityParser';

export interface CalendarExportOptions {
    referenceWeek?: number;
    referenceWeekStart?: string;
    calendarName?: string;
    now?: Date;
}

interface CalendarEvent {
    uid: string;
    summary: string;
    description: string;
    location: string;
    date: Date;
    startHour: number;
    startMinute: number;
    endHour: number;
    endMinute: number;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const TIME_ZONE = 'Asia/Ho_Chi_Minh';

function parseIsoDate(value: string): Date | null {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return null;

    const year = Number.parseInt(match[1], 10);
    const month = Number.parseInt(match[2], 10);
    const day = Number.parseInt(match[3], 10);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year
        || date.getUTCMonth() !== month - 1
        || date.getUTCDate() !== day
    ) return null;

    return date;
}

function parseVietnameseDateRange(value: string): { start: Date; end: Date } | null {
    const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return null;

    const start = parseIsoDate(`${match[3]}-${match[2]}-${match[1]}`);
    const end = parseIsoDate(`${match[6]}-${match[5]}-${match[4]}`);

    return start && end && start <= end ? { start, end } : null;
}

function addDays(date: Date, days: number): Date {
    return new Date(date.getTime() + days * DAY_IN_MS);
}

function formatDate(date: Date): string {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

function formatLocalDateTime(date: Date, hour: number, minute: number): string {
    return `${formatDate(date)}T${String(hour).padStart(2, '0')}${String(minute).padStart(2, '0')}00`;
}

function formatUtcDateTime(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function escapeText(value: string): string {
    return value
        .replace(/\\/g, '\\\\')
        .replace(/\r?\n/g, '\\n')
        .replace(/;/g, '\\;')
        .replace(/,/g, '\\,');
}

function foldLine(line: string): string[] {
    const folded: string[] = [];
    let current = '';

    for (const character of line) {
        const candidate = current + character;
        if (current && new TextEncoder().encode(candidate).length > 75) {
            folded.push(current);
            current = ` ${character}`;
        } else {
            current = candidate;
        }
    }

    folded.push(current);
    return folded;
}

function datesFromWeekRanges(course: TKBType, options: CalendarExportOptions, day: number): Date[] {
    if (!course.weekRange.length) return [];
    if (!Number.isInteger(options.referenceWeek) || !options.referenceWeekStart) {
        throw new Error('Vui lòng nhập tuần tham chiếu và ngày bắt đầu tuần.');
    }

    const referenceDate = parseIsoDate(options.referenceWeekStart);
    if (!referenceDate) throw new Error('Ngày bắt đầu tuần không hợp lệ.');

    const dates = new Map<string, Date>();
    const dayOffset = day - 2;

    for (const range of course.weekRange) {
        for (let week = range.from; week <= range.to; week++) {
            const date = addDays(referenceDate, (week - options.referenceWeek!) * 7 + dayOffset);
            dates.set(formatDate(date), date);
        }
    }

    return [...dates.values()].sort((a, b) => a.getTime() - b.getTime());
}

function datesFromDateRanges(course: TKBType, day: number): Date[] {
    const dates = new Map<string, Date>();
    const targetWeekday = day - 2;

    for (const value of course.originalDateRanges ?? []) {
        const range = parseVietnameseDateRange(value);
        if (!range) continue;

        const startWeekday = (range.start.getUTCDay() + 6) % 7;
        const firstDate = addDays(range.start, (targetWeekday - startWeekday + 7) % 7);

        for (let date = firstDate; date <= range.end; date = addDays(date, 7)) {
            dates.set(formatDate(date), date);
        }
    }

    return [...dates.values()].sort((a, b) => a.getTime() - b.getTime());
}

function createEvents(
    courses: TKBType[],
    university: UniversityConfig,
    options: CalendarExportOptions
): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    for (const course of courses) {
        course.time.forEach((time, timeIndex) => {
            const startSlot = university.timeSlots.find(slot => slot.lessonNumber === time.lsStart);
            const endSlot = university.timeSlots.find(slot => slot.lessonNumber === time.lsEnd);
            if (!startSlot || !endSlot) return;

            const dates = course.weekRange.length > 0
                ? datesFromWeekRanges(course, options, time.date)
                : datesFromDateRanges(course, time.date);

            for (const date of dates) {
                const dateKey = formatDate(date);
                const safeId = course.id.replace(/[^A-Za-z0-9.-]/g, '-');
                events.push({
                    uid: `${safeId}-${timeIndex}-${dateKey}@tkb.parser`,
                    summary: course.name,
                    description: [
                        course.instructor && `Giảng viên: ${course.instructor}`,
                        course.id && `Mã lớp học phần: ${course.id}`
                    ].filter(Boolean).join('\n'),
                    location: time.class,
                    date,
                    startHour: startSlot.startTimeHour,
                    startMinute: startSlot.startTimeMin,
                    endHour: endSlot.endTimeHour,
                    endMinute: endSlot.endTimeMin
                });
            }
        });
    }

    return events.sort((a, b) => (
        a.date.getTime() - b.date.getTime()
        || a.startHour - b.startHour
        || a.startMinute - b.startMinute
    ));
}

export function generateICalendar(
    courses: TKBType[],
    university: UniversityConfig,
    options: CalendarExportOptions = {}
): string {
    const timestamp = formatUtcDateTime(options.now ?? new Date());
    const calendarName = options.calendarName ?? `Thời khóa biểu ${university.shortName}`;
    const lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//tkb.parser//Schedule Export//VI',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${escapeText(calendarName)}`,
        `X-WR-TIMEZONE:${TIME_ZONE}`,
        'BEGIN:VTIMEZONE',
        `TZID:${TIME_ZONE}`,
        `X-LIC-LOCATION:${TIME_ZONE}`,
        'BEGIN:STANDARD',
        'TZOFFSETFROM:+0700',
        'TZOFFSETTO:+0700',
        'TZNAME:+07',
        'DTSTART:19700101T000000',
        'END:STANDARD',
        'END:VTIMEZONE'
    ];

    for (const event of createEvents(courses, university, options)) {
        lines.push(
            'BEGIN:VEVENT',
            `UID:${event.uid}`,
            `DTSTAMP:${timestamp}`,
            `DTSTART;TZID=${TIME_ZONE}:${formatLocalDateTime(event.date, event.startHour, event.startMinute)}`,
            `DTEND;TZID=${TIME_ZONE}:${formatLocalDateTime(event.date, event.endHour, event.endMinute)}`,
            `SUMMARY:${escapeText(event.summary)}`,
            `DESCRIPTION:${escapeText(event.description)}`,
            `LOCATION:${escapeText(event.location)}`,
            'STATUS:CONFIRMED',
            'TRANSP:OPAQUE',
            'END:VEVENT'
        );
    }

    lines.push('END:VCALENDAR');
    return `${lines.flatMap(foldLine).join('\r\n')}\r\n`;
}
