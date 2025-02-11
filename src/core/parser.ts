
export interface TKBType {
    id: string;
    name: string;
    instructor: string;
    time: {
        date: number;
        class: string;
        lsStart: number;
        lsEnd: number;
    }[];
    weekRange: {
        from: number;
        to: number;
    }[]
}

const global = /^(?:(\d+)\t)?(?:([A-Za-z0-9.^\t]+)\t)?([^\t]+)\t(?:[^\t]*\t){3}([^\t]+)\t(Thứ \d+,\d+-\d+,[^\t]+)\t([\d+-;]+)/;

const rgx = {
    id: /^(?=.*\d)(?=.*\.)[A-Za-z0-9.]+$/g,
    dates: /(Thứ \d+,\d+-\d+,[^\t;]+)/gm,
    date: /Thứ (\d+),(\d+)-(\d+),(.+)$/,
    weekRange: /(\d+)-(\d+)/,
    weeksRange: /[\d+-;]+/
};

export default function Parser(s: string): TKBType | null {
    let id = "",
        name = "",
        instructor = "",
        time: TKBType['time'] = [],
        weekRange: TKBType['weekRange'] = []

    const match = global.exec(s);

    if (!match) return null;

    for (let i = 1; i < match.length; i++) {
        if (!match[i]) continue;

        const idMatch = match[i].match(rgx.id);
        if (!idMatch) continue;

        id = idMatch[0];
        name = match[i + 1];
        instructor = match[i + 2];

        const dateMatch = match[i + 3].match(rgx.dates);

        if (!dateMatch) continue;

        for (const date of dateMatch) {
            const dateArr = rgx.date.exec(date);

            if (!dateArr) continue;

            time.push({
                date: parseInt(dateArr[1]),
                class: dateArr[4],
                lsStart: parseInt(dateArr[2]),
                lsEnd: parseInt(dateArr[3])
            });
        }

        const weekRangeMatches = rgx.weeksRange.exec(match[i + 4]);

        if (!weekRangeMatches) continue;

        const weekRangeArr = weekRangeMatches[0].split(';');

        for (const weekRangeStr of weekRangeArr) {
            const weekRangeMatch = rgx.weekRange.exec(weekRangeStr);

            if (!weekRangeMatch) continue;

            weekRange.push({
                from: parseInt(weekRangeMatch[1]),
                to: parseInt(weekRangeMatch[2])
            });
        }
        break;
    }

    return {
        id,
        name,
        instructor,
        time,
        weekRange
    };
}