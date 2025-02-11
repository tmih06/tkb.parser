import { Card, Flex, Text } from "@radix-ui/themes";
import { useEffect, useMemo, useState } from "react"

export default function NextLession() {
    const [time, setTime] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now());
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const nDate = useMemo(() => new Date(time), [time]);

    return (
        <>
            <Flex direction="column" align="center" justify="center">
                <Text align="center" size="9">
                    {nDate.toLocaleTimeString('vi-VN')}
                </Text>
                <Text align="center" size="2" color="gray">
                    Thứ {nDate.getDay() + 1}, ngày {nDate.getDate()} tháng {nDate.getMonth() + 1} năm {nDate.getFullYear()}
                </Text>
                <Flex direction={{
                    md: 'row',
                    initial: 'column'
                }} style={{ width: '100%' }} mt="3" gap="2">
                    <Flex style={{ width: '100%' }} direction="column" gap="2">
                        <Text size="1" color="gray">TRƯỚC ĐÓ</Text>
                        <Card>

                        </Card>
                    </Flex>
                    <Flex style={{ width: '100%' }} direction="column" gap="2">
                        <Text size="1" color="gray">HIỆN TẠI</Text>
                        <Card>

                        </Card>
                    </Flex>
                    <Flex style={{ width: '100%' }} direction="column" gap="2">
                        <Text size="1" color="gray">SẮP TỚI</Text>
                        <Card>

                        </Card>
                    </Flex>
                </Flex>
            </Flex >

        </>
    )
}