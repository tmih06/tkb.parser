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

export interface TimeSlot {
  lessonNumber: number;
  start: string;
  end: string;
  startTimeHour: number;
  startTimeMin: number;
  endTimeHour: number;
  endTimeMin: number;
}

export interface ParserConfig {
  globalRegex: RegExp;
  patterns: {
    id: RegExp;
    dates: RegExp;
    date: RegExp;
    weekRange: RegExp;
    weeksRange: RegExp;
  };
}

export interface UniversityFeatures {
  byWeek: boolean;
  showOnlyAvailable: boolean;
  onlyToday: boolean;
  customFeatures?: {
    id: string;
    label: string;
    defaultValue: boolean;
  }[];
}

export interface UniversityConfig {
  id: string;
  name: string;
  shortName: string;
  displayNumber: string; // For fallback if logo fails
  logoPath: string; // Path to the university logo
  url: string;
  instructions: string;
  videoUrl?: string;
  placeholder: string;
  features: UniversityFeatures;
  timeSlots: TimeSlot[];
  parserConfig: ParserConfig;
  theme?: {
    primary: string;
    secondary: string;
  };
}

export const UNIVERSITIES: UniversityConfig[] = [
  {
    id: 'dut',
    name: 'Đại học Bách khoa - Đại học Đà Nẵng',
    shortName: 'DUT',
    displayNumber: '1',
    logoPath: '	https://github.com/tmih06/tkb.parser/blob/main/public/logos/dut-logo.png?raw=true',
    url: 'https://dut.udn.vn',
    instructions: 'Truy cập vào trang <b>Sinh viên > Cá nhân > Lịch học, thi & khảo sát ý kiến</b>, sau đó copy bảng lịch học vào đây.',
    videoUrl: 'https://youtu.be/wiavNgTzB9o',
    placeholder: 'Dán bảng đã copy từ trang sinh viên DUT vào đây...',
    features: {
      byWeek: true,
      showOnlyAvailable: true,
      onlyToday: true,
    },
    timeSlots: [
      { lessonNumber: 1, start: '7:00', end: '7:50', startTimeHour: 7, startTimeMin: 0, endTimeHour: 7, endTimeMin: 50 },
      { lessonNumber: 2, start: '8:00', end: '8:50', startTimeHour: 8, startTimeMin: 0, endTimeHour: 8, endTimeMin: 50 },
      { lessonNumber: 3, start: '9:00', end: '9:50', startTimeHour: 9, startTimeMin: 0, endTimeHour: 9, endTimeMin: 50 },
      { lessonNumber: 4, start: '10:00', end: '10:50', startTimeHour: 10, startTimeMin: 0, endTimeHour: 10, endTimeMin: 50 },
      { lessonNumber: 5, start: '11:00', end: '11:50', startTimeHour: 11, startTimeMin: 0, endTimeHour: 11, endTimeMin: 50 },
      { lessonNumber: 6, start: '12:30', end: '13:20', startTimeHour: 12, startTimeMin: 30, endTimeHour: 13, endTimeMin: 20 },
      { lessonNumber: 7, start: '13:30', end: '14:20', startTimeHour: 13, startTimeMin: 30, endTimeHour: 14, endTimeMin: 20 },
      { lessonNumber: 8, start: '14:30', end: '15:20', startTimeHour: 14, startTimeMin: 30, endTimeHour: 15, endTimeMin: 20 },
      { lessonNumber: 9, start: '15:30', end: '16:20', startTimeHour: 15, startTimeMin: 30, endTimeHour: 16, endTimeMin: 20 },
      { lessonNumber: 10, start: '16:30', end: '17:20', startTimeHour: 16, startTimeMin: 30, endTimeHour: 17, endTimeMin: 20 },
      { lessonNumber: 11, start: '17:30', end: '18:15', startTimeHour: 17, startTimeMin: 30, endTimeHour: 18, endTimeMin: 15 },
      { lessonNumber: 12, start: '18:15', end: '19:00', startTimeHour: 18, startTimeMin: 15, endTimeHour: 19, endTimeMin: 0 },
      { lessonNumber: 13, start: '19:10', end: '19:55', startTimeHour: 19, startTimeMin: 10, endTimeHour: 19, endTimeMin: 55 },
      { lessonNumber: 14, start: '19:55', end: '20:40', startTimeHour: 19, startTimeMin: 55, endTimeHour: 20, endTimeMin: 40 }
    ],
    parserConfig: {
      globalRegex: /^(?:(\d+)\t)?(?:([A-Za-z0-9.^\t]+)\t)?([^\t]+)\t(?:[^\t]*\t){3}([^\t]+)\t((?:Thứ \d+|[Cc][Hh][Ủủ][ ]?[Nn][Hh][Ậậ][Tt]),\d+-\d+,[^\t]+)\t([\d+-;]+)/,
      patterns: {
        id: /^(?=.*\d)(?=.*\.)[A-Za-z0-9.]+$/g,
        dates: /((?:Thứ \d+|[Cc][Hh][Ủủ][ ]?[Nn][Hh][Ậậ][Tt]),\d+-\d+,[^\t;]+)/gm,
        date: /(?:Thứ (\d+)|[Cc][Hh][Ủủ][ ]?[Nn][Hh][Ậậ][Tt]),(\d+)-(\d+),(.+)$/,
        weekRange: /(\d+)-(\d+)/,
        weeksRange: /[\d+-;]+/
      }
    },
    theme: {
      primary: '#0a3cff',
      secondary: '#667eea'
    }
  },
  {
    id: 'ufl',
    name: 'Đại học Ngoại Ngữ - Đại học Đà Nẵng',
    shortName: 'UFL',
    displayNumber: '2',
    logoPath: '	https://github.com/tmih06/tkb.parser/blob/main/public/logos/ufl-logo.png?raw=true',
    url: 'https://ufl.udn.vn/',
    instructions: 'Truy cập vào hệ thống quản lý học tập, tìm phần lịch học và copy bảng thời khóa biểu.',
    videoUrl: 'https://youtu.be/Us4TbauKPA8',
    placeholder: 'Dán bảng đã copy từ trang sinh viên UFL vào đây...',
    features: {
      byWeek: false, // UFL uses dates, not weeks
      showOnlyAvailable: true,
      onlyToday: true,
    },
    timeSlots: [
      { lessonNumber: 1, start: '7:00', end: '7:50', startTimeHour: 7, startTimeMin: 0, endTimeHour: 7, endTimeMin: 50 },
      { lessonNumber: 2, start: '7:50', end: '8:40', startTimeHour: 7, startTimeMin: 50, endTimeHour: 8, endTimeMin: 40 },
      { lessonNumber: 3, start: '8:50', end: '9:40', startTimeHour: 8, startTimeMin: 50, endTimeHour: 9, endTimeMin: 40 },
      { lessonNumber: 4, start: '9:45', end: '10:35', startTimeHour: 9, startTimeMin: 45, endTimeHour: 10, endTimeMin: 35 },
      { lessonNumber: 5, start: '10:35', end: '11:25', startTimeHour: 10, startTimeMin: 35, endTimeHour: 11, endTimeMin: 25 },
      { lessonNumber: 6, start: '11:30', end: '12:20', startTimeHour: 11, startTimeMin: 30, endTimeHour: 12, endTimeMin: 20 },
      { lessonNumber: 7, start: '13:00', end: '13:50', startTimeHour: 13, startTimeMin: 0, endTimeHour: 13, endTimeMin: 50 },
      { lessonNumber: 8, start: '14:50', end: '15:40', startTimeHour: 14, startTimeMin: 50, endTimeHour: 15, endTimeMin: 40 },
      { lessonNumber: 9, start: '15:45', end: '16:35', startTimeHour: 15, startTimeMin: 45, endTimeHour: 16, endTimeMin: 35 },
      { lessonNumber: 10, start: '16:35', end: '17:25', startTimeHour: 16, startTimeMin: 35, endTimeHour: 17, endTimeMin: 25 },
      { lessonNumber: 11, start: '17:30', end: '18:20', startTimeHour: 17, startTimeMin: 30, endTimeHour: 18, endTimeMin: 20 },
      { lessonNumber: 12, start: '18:20', end: '19:10', startTimeHour: 18, startTimeMin: 20, endTimeHour: 19, endTimeMin: 10 },
      { lessonNumber: 12, start: '19:20', end: '20:10', startTimeHour: 19, startTimeMin: 20, endTimeHour: 20, endTimeMin: 10 },
      { lessonNumber: 12, start: '20:10', end: '21:00', startTimeHour: 20, startTimeMin: 10, endTimeHour: 21, endTimeMin: 0 }
    ],
    parserConfig: {
      globalRegex: /^(\d+)\t([^\t]+)\t(\d+)\t([^\t]+)\t([^\t]+)\t(\d+)\t(\d+-\d+)\t([^\t]+)\t(.+)$/,
      patterns: {
        id: /^[^\t]+$/g,
        dates: /(\d+)/gm,
        date: /^(\d+)$/,
        weekRange: /(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/,
        weeksRange: /[\d\/\-\s]+/
      }
    },
    theme: {
      primary: '#10b981',
      secondary: '#34d399'
    }
  },
];

export const getUniversityById = (id: string): UniversityConfig => {
  return UNIVERSITIES.find(university => university.id === id) || UNIVERSITIES[0];
};

export const getDefaultUniversity = (): UniversityConfig => {
  const saved = localStorage.getItem('selectedUniversity');
  if (saved) {
    const found = UNIVERSITIES.find(university => university.id === saved);
    if (found) return found;
  }
  return UNIVERSITIES[0]; // Default to DUT
};
