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

import { Box, Button, Card, Container, ContextMenu, Flex, Text, TextArea } from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "./components/Footer";
import UniversitySwitcher from "./components/UniversitySwitcher";
import UniversityFeatures from "./components/UniversityFeatures";
import AddCustomCourse from "./components/AddCustomCourse";
import createUniversityParser, { TKBType } from "./core/universityParser";
import parseUFLFormat from "./core/uflParser";
import getUniversityTimeRange from "./core/universityTimeRange";
import html2canvas from "html2canvas-pro";
import tbCls from "./table.module.scss";
import { useTheme } from "./main";
import { UniversityConfig, getDefaultUniversity } from "./config/universities";
// import NextLession from "./components/NextLesson";

export default function App() {
    const { theme, setTheme } = useTheme();
    const [selectedUniversity, setSelectedUniversity] = useState<UniversityConfig>(() => getDefaultUniversity());
    const [byWeek, setByWeek] = useState(localStorage.getItem('byWeek') === 'true' || false);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(localStorage.getItem('showOnlyAvailable') === 'true' || false);
    const [onlyToday, setOnlyToday] = useState(localStorage.getItem('onlyToday') === 'true' || false);
    const [mergeTimeRanges, setMergeTimeRanges] = useState(localStorage.getItem('mergeTimeRanges') !== 'false'); // Default to true
    const [week, setWeek] = useState(localStorage.getItem('week') ? Number(localStorage.getItem('week')) : 0);
    const [byDateRange, setByDateRange] = useState(localStorage.getItem('byDateRange') === 'true' || false);
    const [dateRangeStart, setDateRangeStart] = useState<string>(localStorage.getItem('dateRangeStart') || '');
    const [dateRangeEnd, setDateRangeEnd] = useState<string>(localStorage.getItem('dateRangeEnd') || '');
    const [data, setData] = useState(localStorage.getItem('data') || '');
    const [customCourses, setCustomCourses] = useState<TKBType[]>(() => {
        const saved = localStorage.getItem(`customCourses_${selectedUniversity.id}`);
        return saved ? JSON.parse(saved) : [];
    });
    const [customFeatures, setCustomFeatures] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('customFeatures');
        return saved ? JSON.parse(saved) : {};
    });
    const [editingCourse, setEditingCourse] = useState<TKBType | null>(null);
    const tableRef = useRef<HTMLTableElement>(null);

    // Save university selection
    useEffect(() => {
        localStorage.setItem('selectedUniversity', selectedUniversity.id);
    }, [selectedUniversity]);

    // Save custom features
    useEffect(() => {
        localStorage.setItem('customFeatures', JSON.stringify(customFeatures));
    }, [customFeatures]);

    // Save custom courses per university
    useEffect(() => {
        localStorage.setItem(`customCourses_${selectedUniversity.id}`, JSON.stringify(customCourses));
    }, [customCourses, selectedUniversity.id]);

    // Load custom courses when university changes
    useEffect(() => {
        const saved = localStorage.getItem(`customCourses_${selectedUniversity.id}`);
        setCustomCourses(saved ? JSON.parse(saved) : []);
    }, [selectedUniversity.id]);

    const handleAddCustomCourse = (course: TKBType) => {
        if (editingCourse) {
            // Update existing course
            setCustomCourses(prev => prev.map(c => c.id === editingCourse.id ? course : c));
            setEditingCourse(null);
        } else {
            // Add new course
            setCustomCourses(prev => [...prev, course]);
        }
    };

    const handleDeleteCourse = (courseId: string) => {
        if (confirm('Bạn có chắc muốn xóa môn học này?')) {
            setCustomCourses(prev => prev.filter(c => c.id !== courseId));
        }
    };

    const handleEditCourse = (course: TKBType) => {
        setEditingCourse(course);
    };

    const handleUniversityChange = (university: UniversityConfig) => {
        setSelectedUniversity(university);
        // Reset features based on new university's capabilities
        setByWeek(university.features.byWeek && byWeek);
        setShowOnlyAvailable(university.features.showOnlyAvailable && showOnlyAvailable);
        setOnlyToday(university.features.onlyToday && onlyToday);
        
        // Initialize custom features with default values
        const newCustomFeatures: Record<string, boolean> = {};
        university.features.customFeatures?.forEach(feature => {
            newCustomFeatures[feature.id] = customFeatures[feature.id] ?? feature.defaultValue;
        });
        setCustomFeatures(newCustomFeatures);
    };

    useEffect(() => {
        localStorage.setItem('data', data);
    }, [data]);

    useEffect(() => {
        localStorage.setItem('byWeek', byWeek.toString());
    }, [byWeek]);

    useEffect(() => {
        localStorage.setItem('showOnlyAvailable', showOnlyAvailable.toString());
    }, [showOnlyAvailable]);

    useEffect(() => {
        localStorage.setItem('week', week.toString());
    }, [week]);

    useEffect(() => {
        localStorage.setItem('onlyToday', onlyToday.toString());
    }, [onlyToday]);

    useEffect(() => {
        localStorage.setItem('mergeTimeRanges', mergeTimeRanges.toString());
    }, [mergeTimeRanges]);

    useEffect(() => {
        localStorage.setItem('byDateRange', byDateRange.toString());
    }, [byDateRange]);

    useEffect(() => {
        localStorage.setItem('dateRangeStart', dateRangeStart);
    }, [dateRangeStart]);

    useEffect(() => {
        localStorage.setItem('dateRangeEnd', dateRangeEnd);
    }, [dateRangeEnd]);

    // Function to merge courses with same name and overlapping time slots
    const mergeSimilarCourses = (courses: TKBType[]): TKBType[] => {
        const merged: TKBType[] = [];
        const processed = new Set<string>();

        for (const course of courses) {
            const courseKey = `${course.name}_${course.instructor}_${course.time.map(t => `${t.date}_${t.lsStart}_${t.lsEnd}`).join('|')}`;
            
            if (processed.has(courseKey)) continue;
            
            // Find all courses with same name, instructor, and time slots
            const similarCourses = courses.filter(c => 
                c.name === course.name && 
                c.instructor === course.instructor &&
                c.time.length === course.time.length &&
                c.time.every((t, i) => 
                    course.time[i] && 
                    t.date === course.time[i].date && 
                    t.lsStart === course.time[i].lsStart && 
                    t.lsEnd === course.time[i].lsEnd
                )
            );

            if (similarCourses.length > 1) {
                // Merge date ranges
                const allOriginalRanges = similarCourses.flatMap(c => c.originalDateRanges || []);
                const allWeekRanges = similarCourses.flatMap(c => c.weekRange);
                
                // Create merged time info
                let mergedTimeInfo = '';
                if (allOriginalRanges.length > 0) {
                    // Sort ranges by start date to find overall range
                    const sortedRanges = allOriginalRanges
                        .map(range => {
                            const match = range.trim().match(/(\d{2}\/\d{2}\/\d{4})-\s*(\d{2}\/\d{2}\/\d{4})/);
                            if (match) {
                                return {
                                    original: range,
                                    startDate: new Date(match[1].split('/').reverse().join('-')),
                                    endDate: new Date(match[2].split('/').reverse().join('-')),
                                    startStr: match[1],
                                    endStr: match[2]
                                };
                            }
                            return null;
                        })
                        .filter(Boolean)
                        .sort((a, b) => a!.startDate.getTime() - b!.startDate.getTime());

                    if (sortedRanges.length > 0) {
                        const firstRange = sortedRanges[0]!;
                        const lastRange = sortedRanges[sortedRanges.length - 1]!;
                        
                        // Format dates from dd/mm/yyyy to dd/mm/yy
                        const formatDate = (dateStr: string) => {
                            const parts = dateStr.split('/');
                            return `${parts[0]}/${parts[1]}/${parts[2].slice(-2)}`;
                        };
                        
                        mergedTimeInfo = `${formatDate(firstRange.startStr)} - ${formatDate(lastRange.endStr)}`;
                    }
                }

                const mergedCourse: TKBType = {
                    ...course,
                    originalDateRanges: allOriginalRanges,
                    weekRange: allWeekRanges,
                    displayTimeInfo: mergedTimeInfo
                };

                merged.push(mergedCourse);
                
                // Mark all similar courses as processed
                similarCourses.forEach(c => {
                    const key = `${c.name}_${c.instructor}_${c.time.map(t => `${t.date}_${t.lsStart}_${t.lsEnd}`).join('|')}`;
                    processed.add(key);
                });
            } else {
                merged.push(course);
                processed.add(courseKey);
            }
        }

        return merged;
    };

    const scheduleData = useMemo<TKBType[]>(() => {
        const d: TKBType[] = [];
        
        if (selectedUniversity.id === 'ufl') {
            // For UFL, parse the entire input at once since each line is a complete course
            const courses = parseUFLFormat(data);
            d.push(...courses);
        } else {
            // For other universities, parse line by line
            const universityParser = createUniversityParser(selectedUniversity);
            
            data.replace(/\r\n/g, "\n").split('\n').map((line) => {
                if (line === '') return null;

                const parser = universityParser(line);
                if (parser) {
                    d.push(parser);
                }
            });
        }

        // Add custom courses
        d.push(...customCourses);

        // Merge courses with same name and time slots if enabled
        if (mergeTimeRanges) {
            return mergeSimilarCourses(d);
        }

        return d;
    }, [data, selectedUniversity, mergeTimeRanges, customCourses]);

    const dt = useMemo(() => {
        const universityTimeRange = getUniversityTimeRange(selectedUniversity);
        
        // Helper function to check if course is in date range
        const isInDateRange = (course: TKBType) => {
            if (!byDateRange || !dateRangeStart || !dateRangeEnd) return true;
            
            const startDate = new Date(dateRangeStart);
            const endDate = new Date(dateRangeEnd);
            
            // For UFL courses with originalDateRanges
            if (course.originalDateRanges && course.originalDateRanges.length > 0) {
                return course.originalDateRanges.some(range => {
                    const match = range.match(/(\d{2})\/(\d{2})\/(\d{4})\s*-\s*(\d{2})\/(\d{2})\/(\d{4})/);
                    if (match) {
                        const courseStart = new Date(`${match[3]}-${match[2]}-${match[1]}`);
                        const courseEnd = new Date(`${match[6]}-${match[5]}-${match[4]}`);
                        // Check if ranges overlap
                        return !(courseEnd < startDate || courseStart > endDate);
                    }
                    return false;
                });
            }
            
            return true;
        };
        
        // Filter time slots based on showOnlyAvailable
        const filteredTimeRange = showOnlyAvailable 
            ? universityTimeRange.filter((timeSlot) => 
                scheduleData.some(course =>
                    course.time.some(t => 
                        t.lsStart <= timeSlot.lessonNumber && 
                        t.lsEnd >= timeSlot.lessonNumber && 
                        (!byWeek || course.weekRange.some(wr => wr.from <= week && wr.to >= week)) &&
                        isInDateRange(course)
                    )
                )
            )
            : universityTimeRange;

        return (
            <>
                {filteredTimeRange.map((time, tr) => (
                    <tr key={tr}>
                        <td>
                            <Text size="1" style={{ fontSize: '12px', color: 'gray' }} color="gray">Tiết {time.lessonNumber}</Text>
                            <br />
                            <Text>{time.start} - {time.end}</Text>
                        </td>
                        {Array.from({ length: 7 }, (_, i) => i + 2).map(day => (onlyToday && (day === (new Date()).getDay() + 1 || (day === 8 && (new Date()).getDay() === 0)) || !onlyToday) && (
                            <td key={day}>
                                {(() => {
                                    const coursesInSlot = scheduleData.filter(d =>
                                        d.time.some(t => t.date === day && t.lsStart <= time.lessonNumber && t.lsEnd >= time.lessonNumber && (!byWeek || d.weekRange.some(wr => wr.from <= week && wr.to >= week))) &&
                                        isInDateRange(d)
                                    );
                                    const hasConflict = coursesInSlot.length > 1;

                                    return coursesInSlot.map((d, ind) => {
                                        const isCustomCourse = d.id.startsWith('custom-');
                                        
                                        const courseCard = (
                                            <Box 
                                                className={tbCls.card}
                                                key={d.id + day + ind}
                                                style={{ 
                                                    marginBottom: hasConflict && ind < coursesInSlot.length - 1 ? '4px' : undefined,
                                                    position: 'relative'
                                                }}
                                            >
                                                {hasConflict && (
                                                    <Box 
                                                        style={{ 
                                                            position: 'absolute',
                                                            top: '4px',
                                                            right: '4px',
                                                            fontSize: '16px',
                                                            cursor: 'help'
                                                        }}
                                                        title="Trùng lịch học"
                                                    >
                                                        ⚠️
                                                    </Box>
                                                )}
                                                <Box style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                                    <Text weight="bold">{d.name}</Text>
                                                    {d.displayTimeInfo && (
                                                        <Text size="1" style={{ fontSize: '12px', color: 'gray' }} color="gray">{d.displayTimeInfo}</Text>
                                                    )}
                                                    <Text size="1" style={{ fontSize: '10px', color: 'grey' }} color="gray">{d.instructor}</Text>
                                                    <Text weight="bold" size="1" style={{ fontSize: '14px'}} color="gray">{d.time.filter(t => t.date === day && t.lsStart <= time.lessonNumber && t.lsEnd >= time.lessonNumber).map(t => t.class).join(', ')}</Text>
                                                </Box>
                                            </Box>
                                        );

                                        if (isCustomCourse) {
                                            return (
                                                <ContextMenu.Root key={d.id + day + ind}>
                                                    <ContextMenu.Trigger>
                                                        {courseCard}
                                                    </ContextMenu.Trigger>
                                                    <ContextMenu.Content>
                                                        <ContextMenu.Item onClick={() => handleEditCourse(d)}>
                                                            ✏️ Chỉnh sửa
                                                        </ContextMenu.Item>
                                                        <ContextMenu.Separator />
                                                        <ContextMenu.Item color="red" onClick={() => handleDeleteCourse(d.id)}>
                                                            🗑️ Xóa
                                                        </ContextMenu.Item>
                                                    </ContextMenu.Content>
                                                </ContextMenu.Root>
                                            );
                                        }

                                        return courseCard;
                                    });
                                })()}
                            </td>
                        ))}
                    </tr>
                ))}
            </>
        );
    }, [week, byWeek, byDateRange, dateRangeStart, dateRangeEnd, scheduleData, showOnlyAvailable, onlyToday, selectedUniversity]);    return (
        <>
            <Container>
                <Card my="3" mx="3" style={{ width: 'calc(100% - 2rem)', padding: '1.5rem' }}>
                    <Flex direction="column" gap="1">
                        <UniversitySwitcher 
                            selectedUniversity={selectedUniversity}
                            onUniversityChange={handleUniversityChange}
                        />
                        <TextArea
                            size="1"
                            value={data}
                            onChange={(e) => setData(e.currentTarget.value)}
                            style={{ margin: '1rem 0', fontSize: '12px', height: '200px', fontFamily: 'monospace, Consolas, source-code-pro, Menlo, Monaco, Lucida Console, Courier New, sans-serif' }} 
                            resize="vertical" 
                            placeholder={selectedUniversity.placeholder} 
                        />
                        <UniversityFeatures
                            selectedUniversity={selectedUniversity}
                            byWeek={byWeek}
                            setByWeek={setByWeek}
                            week={week}
                            setWeek={setWeek}
                            byDateRange={byDateRange}
                            setByDateRange={setByDateRange}
                            dateRangeStart={dateRangeStart}
                            setDateRangeStart={setDateRangeStart}
                            dateRangeEnd={dateRangeEnd}
                            setDateRangeEnd={setDateRangeEnd}
                            showOnlyAvailable={showOnlyAvailable}
                            setShowOnlyAvailable={setShowOnlyAvailable}
                            onlyToday={onlyToday}
                            setOnlyToday={setOnlyToday}
                            mergeTimeRanges={mergeTimeRanges}
                            setMergeTimeRanges={setMergeTimeRanges}
                            customFeatures={customFeatures}
                            setCustomFeatures={setCustomFeatures}
                        />
                        <Flex align="center" gap="1">
                            <AddCustomCourse 
                                onAdd={handleAddCustomCourse} 
                                editingCourse={editingCourse}
                                onEditComplete={() => setEditingCourse(null)}
                                university={selectedUniversity}
                            />
                            <Button
                                color="red"
                                variant="soft"
                                onClick={() => {
                                    setData('');
                                    setCustomCourses([]);
                                    setByWeek(false);
                                    setWeek(0);
                                    setShowOnlyAvailable(false);
                                }}
                            >Reset</Button>
                            <Button
                                variant="soft"
                                disabled={scheduleData.length < 1}
                                onClick={() => {
                                    if (!tableRef.current) return;
                                    tableRef.current.style.transition = 'none';
                                    tableRef.current.style.animation = 'none';
                                    html2canvas(tableRef.current, {
                                        allowTaint: true,
                                        backgroundColor: theme === 'dark' ? '#212225' : '#fff',
                                    }).then(function (canvas) {
                                        const link = document.createElement('a');
                                        link.download = `${selectedUniversity.shortName.toLowerCase()}.tkb.parser-${Date.now()}.png`;
                                        link.href = canvas.toDataURL('image/png');
                                        link.click();
                                        link.remove();
                                    });
                                }}
                            >Lưu lại thành file ảnh</Button>
                            <a href={selectedUniversity.videoUrl} target="_blank" rel="noreferrer">
                                <Button variant="soft" color="cyan">Xem hướng dẫn</Button>
                            </a>
                            <Button
                                variant="soft"
                                className={theme === 'dark' ? tbCls.themeToggleLight : tbCls.themeToggleDark}
                                onClick={() => {
                                    setTheme(theme === 'dark' ? 'light' : 'dark');
                                }}
                            >Đổi giao diện</Button>
                        </Flex>
                    </Flex>
                </Card>
                {/* <Card my="3" mx="3" style={{ width: 'calc(100% - 2rem)', padding: '1.5rem' }}>
                    <NextLession data={scheduleData} />
                </Card> */}
            </Container>
            {scheduleData.length > 0 &&
                <Box mx="3" style={{ width: 'calc(100% - 2rem)', overflow: 'auto' }}>
                    <table className={tbCls.table} ref={tableRef}>
                        <thead>
                            <tr>
                                <th> </th>
                                {onlyToday ? <th>
                                    {new Date().getDay() === 0 ? 'Chủ nhật' : `Thứ ${new Date().getDay() + 1}`}
                                </th> : Array.from({ length: 7 }, (_, i) => i + 2).map((day) => (
                                    <th key={day}>{day === 8 ? 'Chủ nhật' : `Thứ ${day}`}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {dt}
                        </tbody>
                    </table>
                </Box>
            }
            <Footer />
        </>
    )
}