import { expect, test } from 'vitest';
import Parser from './parser';

test('Test with: 6	5070040.2420.24.99	Tiếng Nhật 2 (CNTT)	1			Trần Thị Kim Ngân	Thứ 2,4-5,C128; Thứ 4,4-5,C128; Thứ 6,4-5,C128	29-44', () => {
    expect(Parser("6	5070040.2420.24.99	Tiếng Nhật 2 (CNTT)	1			Trần Thị Kim Ngân	Thứ 2,4-5,C128; Thứ 4,4-5,C128; Thứ 6,4-5,C128	29-44")).toStrictEqual({
        id: "5070040.2420.24.99",
        name: "Tiếng Nhật 2 (CNTT)",
        instructor: "Trần Thị Kim Ngân",
        time: [
            {
                date: 2,
                class: "C128",
                lsStart: 4,
                lsEnd: 5,
            }, {
                date: 4,
                class: "C128",
                lsStart: 4,
                lsEnd: 5,
            }, {
                date: 6,
                class: "C128",
                lsStart: 4,
                lsEnd: 5,
            }
        ],
        weekRangeFrom: 29,
        weekRangeTo: 44,
    });
});