import { Box, Button, Card, Checkbox, Container, Flex, Link, Table, Text, TextArea, TextField } from "@radix-ui/themes";
import { useEffect, useMemo, useRef, useState } from "react";
import Footer from "./components/Footer";
import Parser, { TKBType } from "./core/parser";
import timeRange from "./core/range";
import html2canvas from "html2canvas-pro";

export default function App() {
    const [byWeek, setByWeek] = useState(localStorage.getItem('byWeek') === 'true' || false);
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(localStorage.getItem('showOnlyAvailable') === 'true' || false);
    const [week, setWeek] = useState(0);
    const [data, setData] = useState(localStorage.getItem('data') || '');
    const tableRef = useRef<HTMLTableElement>(null);

    useEffect(() => {
        localStorage.setItem('data', data);
    }, [data]);

    useEffect(() => {
        localStorage.setItem('byWeek', byWeek.toString());
    }, [byWeek]);

    useEffect(() => {
        localStorage.setItem('showOnlyAvailable', showOnlyAvailable.toString());
    }, [showOnlyAvailable]);

    const scheduleData = useMemo<TKBType[]>(() => {
        let d: TKBType[] = [];
        data.replace(/\r\n/g, "\n").split('\n').map((line) => {
            if (line === '') return null;

            const parser = Parser(line);
            if (parser) {
                d.push(parser);
            }
        });

        return d;
    }, [data]);

    const dt = useMemo(() => (
        <>
            {timeRange.filter((_, i) => !showOnlyAvailable || scheduleData.some(d =>
                d.time.some(t => t.lsStart <= i + 1 && t.lsEnd >= i + 1 && (!byWeek || (d.weekRangeFrom <= week && d.weekRangeTo >= week)))
            )).map((time, tr) => (
                <Table.Row key={tr}>
                    <Table.Cell>
                        <Text size="1" color="gray">Tiết {tr + 1}</Text>
                        <br />
                        <Text>{time.start} - {time.end}</Text>
                    </Table.Cell>
                    {Array.from({ length: 7 }, (_, i) => i + 2).map(day => (
                        <Table.Cell key={day}>
                            {scheduleData.filter(d =>
                                d.time.some(t => t.date === day && t.lsStart <= tr + 1 && t.lsEnd >= tr + 1 && (!byWeek || (d.weekRangeFrom <= week && d.weekRangeTo >= week)))
                            ).map((d, ind) => (
                                <Box style={{ background: '#DD813E40', padding: '0.5rem', borderRadius: '0.3rem' }} key={d.id + day + ind}>
                                    <Text>
                                        {d.name}
                                        <br />
                                        <Text size="1" style={{ fontSize: '10px' }} color="gray">{d.instructor}</Text>
                                        <br />
                                        <Text size="1" color="gray">{d.time.filter(t => t.date === day && t.lsStart <= tr + 1 && t.lsEnd >= tr + 1).map(t => t.class).join(', ')}</Text>
                                    </Text>
                                </Box>
                            ))}
                        </Table.Cell>
                    ))}
                </Table.Row>
            ))}
        </>
    ), [timeRange, week, byWeek, scheduleData, showOnlyAvailable]);

    return (
        <>
            <Container>
                <Card style={{ margin: '2rem 1rem', width: 'calc(100% - 2rem)', padding: '1.5rem' }}>
                    <Flex direction="column" gap="1">
                        <Text size='6'>
                            Tạo thời khoá biểu
                            <Text as="span" style={{ marginLeft: '0.5rem' }} size="1" color="gray">for <Link color="gray" href="https://dut.udn.vn">DUT</Link> students</Text>
                        </Text>
                        <Text size='2' color="gray">
                            Truy c&#x1EAD;p v&agrave;o trang <b>Sinh vi&ecirc;n &gt; C&aacute; nh&acirc;n &gt; L&#x1ECB;ch h&#x1ECD;c, thi &amp; kh&#x1EA3;o s&aacute;t &yacute; ki&#x1EBF;n</b>, sau đ&oacute; copy b&#x1EA3;ng l&#x1ECB;ch h&#x1ECD;c v&agrave;o đ&acirc;y. <Link href="https://dut.udn.vn">Xem video hướng dẫn</Link>.
                            <br />
                            Thời khoá biểu đã nhập sẽ tự động lưu vào bộ nhớ của trình duyệt.
                        </Text>
                        <TextArea
                            value={data}
                            onChange={(e) => setData(e.currentTarget.value)}
                            style={{ margin: '1rem 0', fontSize: '12px', height: '200px', fontFamily: 'monospace, Consolas, source-code-pro, Menlo, Monaco, Lucida Console, Courier New, sans-serif' }} resize="vertical" placeholder="Dán bảng đã copy vào đây..." />
                        <Flex align="center" gap="2" style={{ marginBottom: '1rem' }}>
                            <Checkbox
                                checked={byWeek}
                                onCheckedChange={(e) => setByWeek(Boolean(e))}
                            />
                            <Text>Theo tuần</Text>
                            <TextField.Root
                                disabled={!byWeek}
                                style={{ width: '3rem' }}
                                value={week}
                                onChange={(e) => setWeek(Number(e.currentTarget.value))}
                                size="1" type="number" placeholder="Tuần"
                            />
                            <Checkbox
                                checked={showOnlyAvailable}
                                onCheckedChange={(e) => setShowOnlyAvailable(Boolean(e))}
                            />
                            <Text>Chỉ hiển thị mốc thời gian có lịch học</Text>
                        </Flex>
                        <Flex align="center" gap="1">
                            <Button
                                color="red"
                                variant="soft"
                                onClick={() => {
                                    setData('');
                                    setByWeek(false);
                                    setWeek(0);
                                }}
                            >Reset</Button>
                            <Button
                                variant="soft"
                                onClick={() => {
                                    if (!tableRef.current) return;

                                    html2canvas(tableRef.current, {
                                        useCORS: true,
                                    }).then(function (canvas) {
                                        const link = document.createElement('a');
                                        link.download = Date.now() + '.png';
                                        link.href = canvas.toDataURL('image/png');
                                        link.click();
                                        link.remove();
                                    });
                                }}
                            >Lưu lại thành file ảnh</Button>
                        </Flex>
                    </Flex>
                </Card>
                <Box style={{ margin: '2rem 1rem', width: 'calc(100% - 2rem)', overflow: 'auto' }}>
                    <Table.Root variant="surface" style={{ minWidth: '1280px' }} ref={tableRef}>
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeaderCell
                                    style={{ background: '#4769D740', width: '250px' }}
                                ></Table.ColumnHeaderCell>
                                {Array.from({ length: 7 }, (_, i) => i + 2).map((day) => (
                                    <Table.ColumnHeaderCell style={{ background: '#4769D740', width: '250px' }} key={day}>
                                        {day === 8 ? 'Chủ nhật' : `Thứ ${day}`}
                                    </Table.ColumnHeaderCell>
                                ))}
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {dt}
                        </Table.Body>
                    </Table.Root>
                </Box>
                <Footer />
            </Container>
        </>
    )
}