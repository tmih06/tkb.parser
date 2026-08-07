import { Button, Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { useEffect, useMemo, useState } from 'react';
import type { UniversityConfig } from '../config/universities';
import { generateICalendar } from '../core/calendarExport';
import type { TKBType } from '../core/universityParser';

interface DownloadCalendarProps {
    courses: TKBType[];
    university: UniversityConfig;
}

function getUpcomingMonday(): string {
    const date = new Date();
    const daysUntilMonday = (8 - date.getDay()) % 7;
    date.setDate(date.getDate() + daysUntilMonday);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

export default function DownloadCalendar({ courses, university }: DownloadCalendarProps) {
    const [open, setOpen] = useState(false);
    const [referenceWeek, setReferenceWeek] = useState('1');
    const [referenceWeekStart, setReferenceWeekStart] = useState(getUpcomingMonday);
    const [error, setError] = useState('');
    const usesAcademicWeeks = university.features.byWeek;
    const firstAcademicWeek = useMemo(() => {
        const weeks = courses.flatMap(course => course.weekRange.map(range => range.from));
        return weeks.length > 0 ? Math.min(...weeks) : 1;
    }, [courses]);

    useEffect(() => {
        if (open) {
            setReferenceWeek(String(firstAcademicWeek));
            setError('');
        }
    }, [firstAcademicWeek, open]);

    const handleDownload = () => {
        try {
            const parsedReferenceWeek = Number.parseInt(referenceWeek, 10);
            if (usesAcademicWeeks && (!Number.isInteger(parsedReferenceWeek) || parsedReferenceWeek < 1)) {
                setError('Tuần tham chiếu phải là một số nguyên lớn hơn 0.');
                return;
            }

            const calendar = generateICalendar(courses, university, usesAcademicWeeks ? {
                referenceWeek: parsedReferenceWeek,
                referenceWeekStart,
                calendarName: `Thời khóa biểu ${university.shortName}`
            } : {
                calendarName: `Thời khóa biểu ${university.shortName}`
            });

            if (!calendar.includes('BEGIN:VEVENT')) {
                setError('Không tìm thấy buổi học hợp lệ để xuất lịch.');
                return;
            }

            const blob = new Blob([calendar], { type: 'text/calendar;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${university.shortName.toLowerCase()}-schedule.ics`;
            link.click();
            link.remove();
            window.setTimeout(() => URL.revokeObjectURL(url), 0);
            setOpen(false);
        } catch (downloadError) {
            setError(downloadError instanceof Error ? downloadError.message : 'Không thể tạo tệp lịch.');
        }
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button variant="soft" disabled={courses.length === 0}>
                    Down Calendar (.ics)
                </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="480px">
                <Dialog.Title>Xuất thời khóa biểu ra Calendar</Dialog.Title>
                <Dialog.Description size="2" color="gray">
                    Tệp .ics có thể nhập vào Google Calendar, Apple Calendar hoặc Outlook.
                </Dialog.Description>

                {usesAcademicWeeks ? (
                    <Flex direction="column" gap="3" mt="4">
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Tuần tham chiếu trong dữ liệu
                            </Text>
                            <TextField.Root
                                type="number"
                                min="1"
                                value={referenceWeek}
                                onChange={(event) => setReferenceWeek(event.currentTarget.value)}
                            />
                        </label>
                        <label>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Ngày Thứ 2 của tuần tham chiếu
                            </Text>
                            <TextField.Root
                                type="date"
                                value={referenceWeekStart}
                                onChange={(event) => setReferenceWeekStart(event.currentTarget.value)}
                            />
                        </label>
                        <Text size="1" color="gray">
                            Ví dụ: dữ liệu bắt đầu từ tuần 35 thì chọn tuần 35 và ngày Thứ 2 tương ứng.
                            Mỗi môn sẽ được xuất đúng các tuần trong cột “Tuần học”.
                        </Text>
                    </Flex>
                ) : (
                    <Text as="div" size="2" mt="4">
                        Lịch sẽ được tạo trực tiếp từ khoảng ngày của từng môn học.
                    </Text>
                )}

                {error && (
                    <Text as="div" size="2" color="red" mt="3">
                        {error}
                    </Text>
                )}

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">Hủy</Button>
                    </Dialog.Close>
                    <Button onClick={handleDownload}>Tải tệp .ics</Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
