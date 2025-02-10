
interface TKBType {
    id: string;
    name: string;
    subject: string;
    teacher: string;
    date: number;
    classroom: string;
    weekRangeFrom: number;
    weekRangeTo: number;
}

const global = /^(?:(\d+)\t)?(?:([A-Za-z0-9.^\t]+)\t)?([^\t]+)\t(?:[^\t]*\t){3}([^\t]+)\t(Thứ \d+,\d+-\d+,[^\t]+)\t(\d+-\d+)/gm;

const rgx = {
    id: /[A-Za-z0-9.^\t]+/g,
    dates: /(Thứ \d+,\d+-\d+,[^\t;]+)/gm,
    date: /Thứ (\d+),(\d+)-(\d+),([^\t]+)/gm
};

export default function Parser(s: string): TKBType | null {
    let id = "",
        name = "",
        subject = "",
        teacher = "",
        date = 0,
        classroom = "",
        lsStart = 0,
        lsEnd = 0,
        weekRangeFrom = 0,
        weekRangeTo = 0;

    const match = global.exec(s);

    if (!match) return null;

    for (let i = 0; i < match.length; i++) {
        const idMatch = match[i].match(rgx.id);
        if (!idMatch) continue;

        id = idMatch[0];
        name = match[i + 1];
        subject = match[i + 2];
        teacher = match[i + 3];

        const dateMatch = match[i + 4].match(rgx.date);

        if (!dateMatch) continue;

        for (let j = 0; j < dateMatch.length; j++) {
            const dateArr = rgx.date.exec(dateMatch[j]);

            if (!dateArr) continue;

            date = parseInt(dateArr[1]);
            lsStart = parseInt(dateArr[2]);
            lsEnd = parseInt(dateArr[3]);
            classroom = dateArr[4];
        }

        const weekRange = match[i + 5].split("-");

        weekRangeFrom = parseInt(weekRange[0]);
        weekRangeTo = parseInt(weekRange[1]);
    }

    return {
        id,
        name,
        subject,
        teacher,
        date,
        classroom,
        weekRangeFrom,
        weekRangeTo
    };
}