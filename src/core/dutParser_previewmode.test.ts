import { describe, expect, test } from 'vitest';
import { getUniversityById } from '../config/universities';
import { parseDUTInput } from './dutParser';
import parseDUTPreviewMode from './dutParser_previewmode';

const currentRegistrationData = `"1\t1023870.2610.24.16A\t
PBL 4: Dự án Hệ thống thông minh
3\tPhạm Công Thắng\tThứ 2: 6-8,C1.203\t1-16\t7/28/2026 04:44:42 PM\t\t\t\t\t26/23\t1/5\t\t**ĐK thành công**
2\t5070070.2610.24.16\t
Tiếng Nhật 5 (CNTT)
1\tTrần Thị Kim Ngân\tThứ 2: 9-10,C128; Thứ 4: 9-10,C128\t1-16\t7/22/2026 11:47:39 AM\t\t\t\t\t56/54\t1/5\t\t**ĐK thành công**
3\t1020313.2610.24.16\t
Trí tuệ nhân tạo
2\tNguyễn Văn Hiệu\tThứ 3: 4-5,F208\t1-16\t7/22/2026 11:47:39 AM\t\t\t\t\t60/54\t1/5\t\t**ĐK thành công**
4\t1021383.2610.24.16\t
Vi điều khiển
2\tLê Minh Trí\tThứ 4: 4-5,F206\t1-16\t7/22/2026 11:47:39 AM\t\t\t\t\t60/54\t1/5\t\t**ĐK thành công**
5\t2090101.2610.23.46\t
Tư tưởng Hồ Chí Minh
2\tLê Thị Ngọc Hoa\tThứ 4: 6-8,F110\t1-11\t7/27/2026 08:33:05 AM\t\t\t\t\t62/70\t0/0\t\t**ĐK thành công**
6\t1021523.2610.24.12\t
Công nghệ Web
2\tMai Văn Hà\tThứ 5: 3-4,F107\t1-16\t7/31/2026 01:44:30 PM\t\t\t\t\t55/55\t0/0\t\t**ĐK thành công**
7\t1020503.2610.23.99\t
An toàn Thông tin mạng
2\tNguyễn Thế Xuân Ly\tThứ 6: 1-2,E2.106\t1-16\t7/27/2026 08:45:07 AM\t\t\t\t\t44/46\t0/0\t\t**ĐK thành công**
8\t1023610.2610.24.11\t
Điện toán đám mây
2\tNguyễn Thế Xuân Ly\tThứ 7: 1-2,H206\t1-16\t7/28/2026 04:44:49 PM\t\t\t\t\t62/62\t0/0\t\t**ĐK thành công"`;

const expectedCourses = [
    {
        id: '1023870.2610.24.16A',
        name: 'PBL 4: Dự án Hệ thống thông minh',
        instructor: 'Phạm Công Thắng',
        time: [{ date: 2, class: 'C1.203', lsStart: 6, lsEnd: 8 }],
        weekRange: [{ from: 1, to: 16 }]
    },
    {
        id: '5070070.2610.24.16',
        name: 'Tiếng Nhật 5 (CNTT)',
        instructor: 'Trần Thị Kim Ngân',
        time: [
            { date: 2, class: 'C128', lsStart: 9, lsEnd: 10 },
            { date: 4, class: 'C128', lsStart: 9, lsEnd: 10 }
        ],
        weekRange: [{ from: 1, to: 16 }]
    },
    {
        id: '1020313.2610.24.16',
        name: 'Trí tuệ nhân tạo',
        instructor: 'Nguyễn Văn Hiệu',
        time: [{ date: 3, class: 'F208', lsStart: 4, lsEnd: 5 }],
        weekRange: [{ from: 1, to: 16 }]
    },
    {
        id: '1021383.2610.24.16',
        name: 'Vi điều khiển',
        instructor: 'Lê Minh Trí',
        time: [{ date: 4, class: 'F206', lsStart: 4, lsEnd: 5 }],
        weekRange: [{ from: 1, to: 16 }]
    },
    {
        id: '2090101.2610.23.46',
        name: 'Tư tưởng Hồ Chí Minh',
        instructor: 'Lê Thị Ngọc Hoa',
        time: [{ date: 4, class: 'F110', lsStart: 6, lsEnd: 8 }],
        weekRange: [{ from: 1, to: 11 }]
    },
    {
        id: '1021523.2610.24.12',
        name: 'Công nghệ Web',
        instructor: 'Mai Văn Hà',
        time: [{ date: 5, class: 'F107', lsStart: 3, lsEnd: 4 }],
        weekRange: [{ from: 1, to: 16 }]
    },
    {
        id: '1020503.2610.23.99',
        name: 'An toàn Thông tin mạng',
        instructor: 'Nguyễn Thế Xuân Ly',
        time: [{ date: 6, class: 'E2.106', lsStart: 1, lsEnd: 2 }],
        weekRange: [{ from: 1, to: 16 }]
    },
    {
        id: '1023610.2610.24.11',
        name: 'Điện toán đám mây',
        instructor: 'Nguyễn Thế Xuân Ly',
        time: [{ date: 7, class: 'H206', lsStart: 1, lsEnd: 2 }],
        weekRange: [{ from: 1, to: 16 }]
    }
];

describe('parseDUTPreviewMode', () => {
    test('parses the current multiline registration format', () => {
        expect(parseDUTPreviewMode(currentRegistrationData)).toStrictEqual(expectedCourses);
    });

    test('accepts CRLF line endings', () => {
        expect(parseDUTPreviewMode(currentRegistrationData.replace(/\n/g, '\r\n'))).toStrictEqual(expectedCourses);
    });

    test('keeps compatibility with older one-line registration data', () => {
        const input = '1\t2090160.2520.24.16\tChủ nghĩa Xã hội khoa học\t2\tTrương Thị Thu Hiền\tThứ 6: 1-2,F207;4: 7-8,C128; Chủ nhật: 9-10,H101\t22-27;31-40';

        expect(parseDUTPreviewMode(input)).toStrictEqual([{
            id: '2090160.2520.24.16',
            name: 'Chủ nghĩa Xã hội khoa học',
            instructor: 'Trương Thị Thu Hiền',
            time: [
                { date: 6, class: 'F207', lsStart: 1, lsEnd: 2 },
                { date: 4, class: 'C128', lsStart: 7, lsEnd: 8 },
                { date: 8, class: 'H101', lsStart: 9, lsEnd: 10 }
            ],
            weekRange: [
                { from: 22, to: 27 },
                { from: 31, to: 40 }
            ]
        }]);
    });

    test('accepts the comma schedule syntax from the student website', () => {
        const input = '6\t5070040.2420.24.99\tTiếng Nhật 2 (CNTT)\t1\t\t\tTrần Thị Kim Ngân\tThứ 2,4-5,C128; Thứ 4,4-5,C128\t29-44';

        expect(parseDUTPreviewMode(input)).toHaveLength(1);
        expect(parseDUTPreviewMode(input)[0].time).toStrictEqual([
            { date: 2, class: 'C128', lsStart: 4, lsEnd: 5 },
            { date: 4, class: 'C128', lsStart: 4, lsEnd: 5 }
        ]);
    });

    test('skips an incomplete record without consuming the next valid one', () => {
        const input = `1\t1020000.2610.24.01\tBroken course
2\t1020001.2610.24.02\tValid course\t2\tValid Teacher\tThứ 3: 1-2,A101\t5`;

        expect(parseDUTPreviewMode(input)).toStrictEqual([{
            id: '1020001.2610.24.02',
            name: 'Valid course',
            instructor: 'Valid Teacher',
            time: [{ date: 3, class: 'A101', lsStart: 1, lsEnd: 2 }],
            weekRange: [{ from: 5, to: 5 }]
        }]);
    });

    test('ignores populated registration columns (Đ), (K), (T), and (G)', () => {
        const input = '1\t1023870.2610.24.16A\tPBL 4\t3\tPhạm Công Thắng\tThứ 2: 6-8,C1.203\t1-16\t7/28/2026 04:44:42 PM\tĐ\tK\tT\tG\t26/23\t1/5\tCLC\tĐK thành công';

        expect(parseDUTPreviewMode(input)).toStrictEqual([{
            id: '1023870.2610.24.16A',
            name: 'PBL 4',
            instructor: 'Phạm Công Thắng',
            time: [{ date: 2, class: 'C1.203', lsStart: 6, lsEnd: 8 }],
            weekRange: [{ from: 1, to: 16 }]
        }]);
    });
});

describe('parseDUTInput', () => {
    test('keeps both one-line and multiline courses in a mixed paste', () => {
        const oneLineCourse = '6\t5070040.2420.24.99\tTiếng Nhật 2 (CNTT)\t1\t\t\tTrần Thị Kim Ngân\tThứ 2,4-5,C128\t29-44';
        const courses = parseDUTInput(
            `${oneLineCourse}\n${currentRegistrationData}`,
            getUniversityById('dut')
        );

        expect(courses).toHaveLength(9);
        expect(courses.map(course => course.id)).toContain('5070040.2420.24.99');
        expect(courses.map(course => course.id)).toContain('1023870.2610.24.16A');
        expect(courses.find(course => course.id === '5070040.2420.24.99')).toMatchObject({
            instructor: 'Trần Thị Kim Ngân',
            time: [{ date: 2, class: 'C128', lsStart: 4, lsEnd: 5 }]
        });
    });
});
