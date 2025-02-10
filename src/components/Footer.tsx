import { Flex, Link, Text } from "@radix-ui/themes";
import MainIcon from "./Etc";

export default function Footer() {
    return (
        <Flex justify="center" align="center" direction="column" style={{ margin: '2rem 0' }} gap="4">
            <MainIcon fontSize={50} />
            <Text size="1" color="gray" style={{ textAlign: 'center' }}>
                <Link target="_blank" color="gray" href="https://github.com/michioxd/dut.tkb.parser">GitHub</Link> - <Link target="_blank" color="gray" href="https://github.com/michioxd/dut.tkb.parser/blob/main/LICENSE">MIT License</Link>
                <br />
                &copy; {(new Date()).getUTCFullYear()} <Link target="_blank" color="gray" href="https://michioxd.ch">michioxd</Link> powered.
            </Text>
        </Flex>
    )
}