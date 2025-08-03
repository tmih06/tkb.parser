/*
 * Test file for UFL parser
 */

import parseUFLFormat from './uflParser';

const testData = `1	Cơ sở văn hóa Việt Nam	2	Cơ sở văn hóa Việt Nam- 09	
16/09/2024- 29/12/2024	3	6-7	DB303	Phạm Thị Tú Trinh
2	Kỹ năng học đại học	2	Kỹ năng học đại học-02	
16/09/2024- 29/12/2024	5	4-5	DC202	Thái Lê Phương Thảo`;

const result = parseUFLFormat(testData);
console.log('UFL Parser Test Result:', result);
console.log('Number of courses parsed:', result.length);
