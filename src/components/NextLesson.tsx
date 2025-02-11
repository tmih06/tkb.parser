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