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

import { Box, Button, Card, Container, Flex, Text, TextArea } from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "./components/Footer";
import UniversitySwitcher from "./components/UniversitySwitcher";
import UniversityFeatures from "./components/UniversityFeatures";
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
    const [week, setWeek] = useState(localStorage.getItem('week') ? Number(localStorage.getItem('week')) : 0);
    const [data, setData] = useState(localStorage.getItem('data') || '');
    const [customFeatures, setCustomFeatures] = useState<Record<string, boolean>>(() => {
        const saved = localStorage.getItem('customFeatures');
        return saved ? JSON.parse(saved) : {};
    });
    const tableRef = useRef<HTMLTableElement>(null);

    // Save university selection
    useEffect(() => {
        localStorage.setItem('selectedUniversity', selectedUniversity.id);
    }, [selectedUniversity]);

    // Save custom features
    useEffect(() => {
        localStorage.setItem('customFeatures', JSON.stringify(customFeatures));
    }, [customFeatures]);

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

        return d;
    }, [data, selectedUniversity]);

    const dt = useMemo(() => {
        const universityTimeRange = getUniversityTimeRange(selectedUniversity);
        
        return (
            <>
                {universityTimeRange.filter((tra) => !showOnlyAvailable || scheduleData.some(d =>
                    d.time.some(t => t.lsStart <= tra.lessonNumber && t.lsEnd >= tra.lessonNumber && (!byWeek || d.weekRange.some(wr => wr.from <= week && wr.to >= week)))
                )).map((time, tr) => (
                    <tr key={tr}>
                        <td>
                            <Text size="1" style={{ fontSize: '12px', color: 'gray' }} color="gray">Tiết {time.lessonNumber}</Text>
                            <br />
                            <Text>{time.start} - {time.end}</Text>
                    </td>
                    {Array.from({ length: 7 }, (_, i) => i + 2).map(day => (onlyToday && (day === (new Date()).getDay() + 1 || (day === 8 && (new Date()).getDay() === 0)) || !onlyToday) && (
                        <td key={day}>
                            {scheduleData.filter(d =>
                                d.time.some(t => t.date === day && t.lsStart <= time.lessonNumber && t.lsEnd >= time.lessonNumber && (!byWeek || d.weekRange.some(wr => wr.from <= week && wr.to >= week)))
                            ).map((d, ind) => (
                                <Box className={tbCls.card}
                                    key={d.id + day + ind}>
                                    <Box style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
                                        <Text>{d.name}</Text>
                                        <Text size="1" style={{ fontSize: '10px', color: 'grey' }} color="gray">{d.instructor}</Text>
                                        <Text size="1" style={{ fontSize: '12px', color: 'gray' }} color="gray">{d.time.filter(t => t.date === day && t.lsStart <= time.lessonNumber && t.lsEnd >= time.lessonNumber).map(t => t.class).join(', ')}</Text>
                                    </Box>
                                </Box>
                            ))}
                        </td>
                    ))}
                </tr>
                ))}
            </>
        );
    }, [week, byWeek, scheduleData, showOnlyAvailable, onlyToday, selectedUniversity]);    return (
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
                            showOnlyAvailable={showOnlyAvailable}
                            setShowOnlyAvailable={setShowOnlyAvailable}
                            onlyToday={onlyToday}
                            setOnlyToday={setOnlyToday}
                            customFeatures={customFeatures}
                            setCustomFeatures={setCustomFeatures}
                        />
                        <Flex align="center" gap="1">
                            <Button
                                color="red"
                                variant="soft"
                                onClick={() => {
                                    setData('');
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
                            <a href="https://youtu.be/wiavNgTzB9o" target="_blank" rel="noreferrer">
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