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

import { Button, Dialog, Flex, Text, TextField } from "@radix-ui/themes";
import { useState, useEffect } from "react";
import { TKBType } from "../core/universityParser";
import { UniversityConfig } from "../config/universities";

interface AddCustomCourseProps {
    onAdd: (course: TKBType) => void;
    editingCourse?: TKBType | null;
    onEditComplete?: () => void;
    university: UniversityConfig;
}

export default function AddCustomCourse({ onAdd, editingCourse, onEditComplete, university }: AddCustomCourseProps) {
    const [open, setOpen] = useState(false);
    const [courseName, setCourseName] = useState("");
    const [instructor, setInstructor] = useState("");
    const [room, setRoom] = useState("");
    const [dayOfWeek, setDayOfWeek] = useState("2");
    const [lessonStart, setLessonStart] = useState("1");
    const [lessonEnd, setLessonEnd] = useState("10");
    const [weekStart, setWeekStart] = useState("1");
    const [weekEnd, setWeekEnd] = useState("2");
    const [dateStart, setDateStart] = useState("");
    const [dateEnd, setDateEnd] = useState("");
    
    const usesDates = university.features.byDateRange || false;

    // Load editing course data when editingCourse changes
    useEffect(() => {
        if (editingCourse) {
            setCourseName(editingCourse.name);
            setInstructor(editingCourse.instructor || "");
            setRoom(editingCourse.time[0]?.class || "");
            setDayOfWeek(editingCourse.time[0]?.date.toString() || "2");
            setLessonStart(editingCourse.time[0]?.lsStart.toString() || "1");
            setLessonEnd(editingCourse.time[0]?.lsEnd.toString() || "10");
            
            if (usesDates && editingCourse.originalDateRanges && editingCourse.originalDateRanges.length > 0) {
                const match = editingCourse.originalDateRanges[0].match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);
                if (match) {
                    setDateStart(`${match[3]}-${match[2]}-${match[1]}`);
                    setDateEnd(`${match[6]}-${match[5]}-${match[4]}`);
                }
            } else {
                setWeekStart(editingCourse.weekRange[0]?.from.toString() || "1");
                setWeekEnd(editingCourse.weekRange[0]?.to.toString() || "2");
            }
            
            setOpen(true);
        }
    }, [editingCourse, usesDates]);

    const validateAndClamp = (value: string, min: number, max: number, defaultValue: string): string => {
        // Remove any non-numeric characters except minus sign
        const cleaned = value.replace(/[^0-9-]/g, '');
        
        // If empty, return default
        if (cleaned === '' || cleaned === '-') {
            return defaultValue;
        }

        const num = parseInt(cleaned, 10);
        
        // Handle NaN
        if (isNaN(num)) {
            return defaultValue;
        }

        // Clamp to range
        if (num < min) return min.toString();
        if (num > max) return max.toString();
        
        return num.toString();
    };

    const handleDayChange = (value: string) => {
        setDayOfWeek(validateAndClamp(value, 2, 8, "2"));
    };

    const handleLessonStartChange = (value: string) => {
        setLessonStart(validateAndClamp(value, 1, 10, "1"));
    };

    const handleLessonEndChange = (value: string) => {
        setLessonEnd(validateAndClamp(value, 1, 10, "10"));
    };

    const handleWeekStartChange = (value: string) => {
        setWeekStart(validateAndClamp(value, 1, 52, "1"));
    };

    const handleWeekEndChange = (value: string) => {
        setWeekEnd(validateAndClamp(value, 1, 52, "2"));
    };

    const handleAdd = () => {
        // Validate course name
        if (!courseName.trim()) {
            alert("Vui lòng nhập tên môn học");
            return;
        }

        // Parse and validate all numeric inputs
        const day = parseInt(dayOfWeek, 10);
        const lsStart = parseInt(lessonStart, 10);
        const lsEnd = parseInt(lessonEnd, 10);

        // Validate ranges
        if (isNaN(day) || day < 2 || day > 8) {
            alert("Thứ phải từ 2 đến 8");
            return;
        }

        if (isNaN(lsStart) || lsStart < 1 || lsStart > 15) {
            alert("Tiết bắt đầu phải từ 1 đến 15");
            return;
        }

        if (isNaN(lsEnd) || lsEnd < 1 || lsEnd > 15) {
            alert("Tiết kết thúc phải từ 1 đến 15");
            return;
        }

        if (lsStart > lsEnd) {
            alert("Tiết bắt đầu phải nhỏ hơn hoặc bằng tiết kết thúc");
            return;
        }

        let courseData: TKBType;

        if (usesDates) {
            // For date-based universities (like UFL)
            if (!dateStart || !dateEnd) {
                alert("Vui lòng chọn khoảng ngày");
                return;
            }

            const startDate = new Date(dateStart);
            const endDate = new Date(dateEnd);

            if (startDate > endDate) {
                alert("Ngày bắt đầu phải nhỏ hơn hoặc bằng ngày kết thúc");
                return;
            }

            // Format dates as dd/mm/yyyy
            const formatDate = (date: Date) => {
                const dd = String(date.getDate()).padStart(2, '0');
                const mm = String(date.getMonth() + 1).padStart(2, '0');
                const yyyy = date.getFullYear();
                return `${dd}/${mm}/${yyyy}`;
            };

            const dateRange = `${formatDate(startDate)} - ${formatDate(endDate)}`;

            courseData = {
                id: editingCourse ? editingCourse.id : `custom-${Date.now()}`,
                name: courseName.trim(),
                instructor: instructor.trim(),
                time: [
                    {
                        date: day,
                        class: room.trim(),
                        lsStart: lsStart,
                        lsEnd: lsEnd
                    }
                ],
                weekRange: [],
                originalDateRanges: [dateRange],
                displayTimeInfo: dateRange
            };
        } else {
            // For week-based universities (like DUT)
            const wkStart = parseInt(weekStart, 10);
            const wkEnd = parseInt(weekEnd, 10);

            if (isNaN(wkStart) || wkStart < 1) {
                alert("Tuần bắt đầu phải lớn hơn 0");
                return;
            }

            if (isNaN(wkEnd) || wkEnd < 1) {
                alert("Tuần kết thúc phải lớn hơn 0");
                return;
            }

            if (wkStart > wkEnd) {
                alert("Tuần bắt đầu phải nhỏ hơn hoặc bằng tuần kết thúc");
                return;
            }

            courseData = {
                id: editingCourse ? editingCourse.id : `custom-${Date.now()}`,
                name: courseName.trim(),
                instructor: instructor.trim(),
                time: [
                    {
                        date: day,
                        class: room.trim(),
                        lsStart: lsStart,
                        lsEnd: lsEnd
                    }
                ],
                weekRange: [
                    {
                        from: wkStart,
                        to: wkEnd
                    }
                ]
            };
        }

        onAdd(courseData);
        
        // Reset form
        setCourseName("");
        setInstructor("");
        setRoom("");
        setDayOfWeek("2");
        setLessonStart("1");
        setLessonEnd("10");
        setWeekStart("1");
        setWeekEnd("2");
        setDateStart("");
        setDateEnd("");
        setOpen(false);
        
        if (editingCourse && onEditComplete) {
            onEditComplete();
        }
    };

    const handleReset = () => {
        setCourseName("");
        setInstructor("");
        setRoom("");
        setDayOfWeek("2");
        setLessonStart("1");
        setLessonEnd("10");
        setWeekStart("1");
        setWeekEnd("2");
    };

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger>
                <Button variant="soft" color="green">
                    Thêm lịch tùy chỉnh
                </Button>
            </Dialog.Trigger>

            <Dialog.Content maxWidth="450px">
                <Dialog.Title>{editingCourse ? 'Chỉnh sửa lịch học' : 'Thêm lịch tùy chỉnh'}</Dialog.Title>
                
                <Flex direction="column" gap="3">
                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Tên môn học
                        </Text>
                        <TextField.Root
                            placeholder="Tên môn học"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Tên giảng viên
                        </Text>
                        <TextField.Root
                            placeholder="Tên giảng viên"
                            value={instructor}
                            onChange={(e) => setInstructor(e.target.value)}
                        />
                    </label>

                    <label>
                        <Text as="div" size="2" mb="1" weight="bold">
                            Phòng
                        </Text>
                        <TextField.Root
                            placeholder="Phòng"
                            value={room}
                            onChange={(e) => setRoom(e.target.value)}
                        />
                    </label>

                    <Flex gap="3">
                        <label style={{ flex: 1 }}>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Thứ (2-8)
                            </Text>
                            <TextField.Root
                                type="text"
                                inputMode="numeric"
                                value={dayOfWeek}
                                onChange={(e) => handleDayChange(e.target.value)}
                                onBlur={(e) => handleDayChange(e.target.value)}
                                onFocus={(e) => e.target.select()}
                            />
                        </label>

                        <label style={{ flex: 1 }}>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Từ tiết (1-15)
                            </Text>
                            <TextField.Root
                                type="text"
                                inputMode="numeric"
                                value={lessonStart}
                                onChange={(e) => handleLessonStartChange(e.target.value)}
                                onBlur={(e) => handleLessonStartChange(e.target.value)}
                                onFocus={(e) => e.target.select()}
                            />
                        </label>

                        <label style={{ flex: 1 }}>
                            <Text as="div" size="2" mb="1" weight="bold">
                                Đến (1-15)
                            </Text>
                            <TextField.Root
                                type="text"
                                inputMode="numeric"
                                value={lessonEnd}
                                onChange={(e) => handleLessonEndChange(e.target.value)}
                                onBlur={(e) => handleLessonEndChange(e.target.value)}
                                onFocus={(e) => e.target.select()}
                            />
                        </label>
                    </Flex>

                    {usesDates ? (
                        <Flex gap="3">
                            <label style={{ flex: 1 }}>
                                <Text as="div" size="2" mb="1" weight="bold">
                                    Từ ngày
                                </Text>
                                <TextField.Root
                                    type="date"
                                    value={dateStart}
                                    onChange={(e) => setDateStart(e.target.value)}
                                />
                            </label>

                            <label style={{ flex: 1 }}>
                                <Text as="div" size="2" mb="1" weight="bold">
                                    Đến ngày
                                </Text>
                                <TextField.Root
                                    type="date"
                                    value={dateEnd}
                                    onChange={(e) => setDateEnd(e.target.value)}
                                />
                            </label>
                        </Flex>
                    ) : (
                        <Flex gap="3">
                            <label style={{ flex: 1 }}>
                                <Text as="div" size="2" mb="1" weight="bold">
                                    Từ tuần
                                </Text>
                                <TextField.Root
                                    type="text"
                                    inputMode="numeric"
                                    value={weekStart}
                                    onChange={(e) => handleWeekStartChange(e.target.value)}
                                    onBlur={(e) => handleWeekStartChange(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                />
                            </label>

                            <label style={{ flex: 1 }}>
                                <Text as="div" size="2" mb="1" weight="bold">
                                    Đến tuần
                                </Text>
                                <TextField.Root
                                    type="text"
                                    inputMode="numeric"
                                    value={weekEnd}
                                    onChange={(e) => handleWeekEndChange(e.target.value)}
                                    onBlur={(e) => handleWeekEndChange(e.target.value)}
                                    onFocus={(e) => e.target.select()}
                                />
                            </label>
                        </Flex>
                    )}
                </Flex>

                <Flex gap="3" mt="4" justify="end">
                    <Dialog.Close>
                        <Button variant="soft" color="gray">
                            Hủy
                        </Button>
                    </Dialog.Close>
                    <Button variant="soft" color="red" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button onClick={handleAdd}>
                        {editingCourse ? 'Cập nhật' : 'Thêm'}
                    </Button>
                </Flex>
            </Dialog.Content>
        </Dialog.Root>
    );
}
