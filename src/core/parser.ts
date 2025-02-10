
interface TKBType {
    id: string;
    name: string;
    instructor: string;
    time: {
        date: number;
        class: string;
        lsStart: number;
        lsEnd: number;
    }[];
    weekRangeFrom: number;
    weekRangeTo: number;
}

const global = /^(?:(\d+)\t)?(?:([A-Za-z0-9.^\t]+)\t)?([^\t]+)\t(?:[^\t]*\t){3}([^\t]+)\t(Thứ \d+,\d+-\d+,[^\t]+)\t(\d+-\d+)/gm;

const rgx = {
    id: /^(?=.*\d)(?=.*\.)[A-Za-z0-9.]+$/g,
    dates: /(Thứ \d+,\d+-\d+,[^\t;]+)/gm,
    date: /Thứ (\d+),(\d+)-(\d+),(.+)$/
};

export default function Parser(s: string): TKBType | null {
    let id = "",
        name = "",
        instructor = "",
        time: TKBType['time'] = [],
        classroom = "",
        weekRangeFrom = 0,
        weekRangeTo = 0;

    const match = global.exec(s);

    if (!match) return null;

    for (let i = 1; i < match.length; i++) {
        const idMatch = match[i].match(rgx.id);
        if (!idMatch) continue;

        id = idMatch[0];
        name = match[i + 1];
        instructor = match[i + 2];

        const dateMatch = match[i + 3].match(rgx.dates);

        if (!dateMatch) continue;

        for (let j = 0; j < dateMatch.length; j++) {
            const dateArr = rgx.date.exec(dateMatch[j]);

            if (!dateArr) continue;

            time.push({
                date: parseInt(dateArr[1]),
                class: dateArr[4],
                lsStart: parseInt(dateArr[2]),
                lsEnd: parseInt(dateArr[3])
            });

            classroom = dateArr[4];
        }

        const weekRange = match[i + 4].split("-");

        weekRangeFrom = parseInt(weekRange[0]);
        weekRangeTo = parseInt(weekRange[1]);
        break;
    }

    return {
        id,
        name,
        instructor,
        time,
        weekRangeFrom,
        weekRangeTo
    };
}