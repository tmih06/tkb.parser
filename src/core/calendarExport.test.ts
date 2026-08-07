import { describe, expect, test } from 'vitest';
import { getUniversityById } from '../config/universities';
import { generateICalendar } from './calendarExport';
import type { TKBType } from './universityParser';

describe('generateICalendar', () => {
    test('exports every academic week using the selected reference date', () => {
        const course: TKBType = {
            id: '2090101.2610.23.46',
            name: 'Tư tưởng Hồ Chí Minh',
            instructor: 'Lê Thị Ngọc Hoa',
            time: [{ date: 2, class: 'F110', lsStart: 6, lsEnd: 8 }],
            weekRange: [{ from: 35, to: 50 }]
        };
        const calendar = generateICalendar([course], getUniversityById('dut'), {
            referenceWeek: 35,
            referenceWeekStart: '2026-04-06',
            now: new Date('2026-01-01T00:00:00Z')
        });

        expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(16);
        expect(calendar).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20260406T123000');
        expect(calendar).toContain('DTEND;TZID=Asia/Ho_Chi_Minh:20260406T152000');
        expect(calendar).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20260720T123000');
        expect(calendar).toContain('SUMMARY:Tư tưởng Hồ Chí Minh');
        expect(calendar).toContain('LOCATION:F110');
    });

    test('escapes calendar text and exports date-based courses', () => {
        const course: TKBType = {
            id: 'custom-1',
            name: 'Web, API; thực hành',
            instructor: 'Giảng viên A',
            time: [{ date: 4, class: 'A1, tầng 2', lsStart: 1, lsEnd: 2 }],
            weekRange: [],
            originalDateRanges: ['01/04/2026 - 15/04/2026']
        };
        const calendar = generateICalendar([course], getUniversityById('ufl'), {
            now: new Date('2026-01-01T00:00:00Z')
        });

        expect(calendar.match(/BEGIN:VEVENT/g)).toHaveLength(3);
        expect(calendar).toContain('SUMMARY:Web\\, API\\; thực hành');
        expect(calendar).toContain('LOCATION:A1\\, tầng 2');
        expect(calendar).toContain('DTSTART;TZID=Asia/Ho_Chi_Minh:20260401T070000');
    });

    test('requires a reference for week-based courses', () => {
        const course: TKBType = {
            id: 'course-1',
            name: 'Môn học',
            instructor: '',
            time: [{ date: 2, class: '', lsStart: 1, lsEnd: 1 }],
            weekRange: [{ from: 1, to: 2 }]
        };

        expect(() => generateICalendar([course], getUniversityById('dut'))).toThrow(
            'Vui lòng nhập tuần tham chiếu và ngày bắt đầu tuần.'
        );
    });
});
