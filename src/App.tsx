import { Button, Card, Checkbox, Container, Flex, Link, Text, TextArea, TextField } from "@radix-ui/themes";
import { useState } from "react";
import Footer from "./components/Footer";

export default function App() {
    const [byWeek, setByWeek] = useState(false);
    const [week, setWeek] = useState(0);


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
                        </Text>
                        <TextArea style={{ margin: '1rem 0', fontSize: '12px', height: '200px', fontFamily: 'monospace, Consolas, source-code-pro, Menlo, Monaco, Lucida Console, Courier New, sans-serif' }} resize="vertical" placeholder="Dán bảng đã copy vào đây..." />
                        <Flex align="center" gap="2">
                            <Checkbox
                                checked={byWeek}
                                onCheckedChange={(e) => setByWeek(Boolean(e))}
                            />
                            <Text>Theo tuần</Text>
                            <TextField.Root
                                disabled={!byWeek}
                                value={week}
                                onChange={(e) => setWeek(Number(e.currentTarget.value))}
                                size="1" type="number" placeholder="Tuần"
                            />
                        </Flex>
                        <Button style={{ marginTop: '1rem' }}>Tạo thời khoá biểu</Button>
                    </Flex>
                </Card>
                <Footer />
            </Container>
        </>
    )
}