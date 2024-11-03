import { baishakOne, startDateAD, startDateBS, yearMonthDays } from './data';
import { parseDate } from './commons';

type IDate = {
  year: number;
  month: number;
  date: number;
};
const toInt = (value: number) => ~~value;

const yearDivider = 10000;
const monthDivider = 100;

export const padTwo = (v: number) => `${v}`.padStart(2, '0');
export const padFour = (v: number) => `${v}`.padStart(4, '0');
export const padFourNumber = (v: number) => `${v}`.padStart(4, '0');

export const stringDateFormatter = ({ year, month, date }: IDate) =>
  `${padFour(year)}-${padTwo(month)}-${padTwo(date)}`;

export const getDateFromNumber = (n: number) => {
  const year = toInt(n / yearDivider);
  const month = toInt((n % yearDivider) / monthDivider);
  const date = n % (yearDivider / monthDivider);

  const dateData = { year, month, date };
  return {
    ...dateData,
    toString: () => stringDateFormatter(dateData),
  };
};
export const getStartYearAD = () =>
  findADfromBS(getDateFromNumber(startDateBS).toString());
export const getEndYearAD = () =>
  findADfromBS(
    stringDateFormatter({
      year: getDateFromNumber(startDateBS).year + yearMonthDays.length - 1,
      month: 12,
      date: yearMonthDays[yearMonthDays.length - 1][11],
    }),
  );

const getBSYearIndexFromAd = (year: number) => {
  const startADYear = getDateFromNumber(startDateAD).year;
  if (year < startADYear) {
    throw new Error(`Invalid year, year should be greater than ${startADYear}`);
  }
  return year - startADYear;
};

const getBSYearIndexFromBS = (year: number) => {
  const startBSYear = getDateFromNumber(startDateBS).year;
  if (year < startBSYear) {
    throw new Error(`Invalid year, year should be greater than ${startBSYear}`);
  }
  return year - startBSYear;
};

const getDays = (a: Date, b: Date) =>
  (a.getTime() - b.getTime()) / (1000 * 3600 * 24) + 1;

const nepaliDateExtractor = (datestring: string) => {
  if (!datestring) {
    throw new Error('Invalid Date');
  }

  const startBSDate = getDateFromNumber(startDateBS);

  const datesplit = datestring.split('-');

  if (datesplit.length !== 3) {
    throw new Error('Invalid Date');
  }

  const year = parseInt(datesplit[0], 10);
  const month = parseInt(datesplit[1], 10);
  const date = parseInt(datesplit[2], 10);

  if (
    year < startBSDate.year ||
    year > startBSDate.year + yearMonthDays.length - 1 ||
    date <= 0 ||
    date > 32 ||
    month > 12 ||
    month < 0
  ) {
    throw new Error('Invalid Date');
  }

  return { year, month, date };
};

export const findADfromBS = (date: string) => {
  const d = nepaliDateExtractor(date);

  const year = d.year - getDateFromNumber(startDateBS).year;

  let days = 0;
  for (let x = 0; x < d.month - 1; x++) {
    days += yearMonthDays[year][x];
  }

  days += d.date - 1;

  const adIndexDate = getDateFromNumber(baishakOne[year]);
  const currentDate = new Date(stringDateFormatter({ ...adIndexDate }));
  currentDate.setDate(adIndexDate.date + days);
  const dateData = {
    year: currentDate.getFullYear(),
    month: currentDate.getMonth(),
    date: currentDate.getDate(),
  };

  return {
    ...dateData,
    toString: () =>
      stringDateFormatter({ ...dateData, month: dateData.month + 1 }),
  };
};

export const findBSfromAD = (date: string) => {
  const d = new Date(date);
  const adYear = d.getFullYear();

  // get in which nepali year index we are in although this is not fixed here
  let yearIndex = getBSYearIndexFromAd(adYear);

  let baishakOneInADForGivenYear = getDateFromNumber(baishakOne[yearIndex]);

  let dateForBaishakOneInADForGivenYear = new Date(
    baishakOneInADForGivenYear.toString(),
  );
  let days = getDays(d, dateForBaishakOneInADForGivenYear);

  // for nepali year if days are negative it means we are in different quarter of english year, so we need to go to previous quarter
  if (days <= 0) {
    yearIndex -= 1;

    baishakOneInADForGivenYear = getDateFromNumber(baishakOne[yearIndex]);

    dateForBaishakOneInADForGivenYear = new Date(
      baishakOneInADForGivenYear.toString(),
    );
    days = getDays(d, dateForBaishakOneInADForGivenYear);
  }

  const startBSDate = getDateFromNumber(startDateBS);

  if (
    yearIndex + startBSDate.year >
      startBSDate.year + yearMonthDays.length - 1 ||
    yearIndex + startBSDate.year < startBSDate.year
  ) {
    throw new Error('Invalid date');
  }

  const currentBSYearMonths = yearMonthDays[yearIndex];

  let totalMonths = 0;
  let totalDays = 0;

  for (let x = 0; x < days; x++) {
    totalDays += 1;
    if (totalDays > currentBSYearMonths[totalMonths]) {
      totalMonths += 1;
      totalDays = 1;
      continue;
    }
  }

  const dateData = {
    year: yearIndex + getDateFromNumber(startDateBS).year,
    month: totalMonths,
    date: totalDays,
  };

  return {
    ...dateData,
    toString: () =>
      stringDateFormatter({ ...dateData, month: dateData.month + 1 }),
  };
};

export const getCurrentDate = ({ type = 'np' }: { type?: 'en' | 'np' }) => {
  const date = new Date();
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  switch (type) {
    case 'en':
      return {
        year: date.getFullYear(),
        month: date.getMonth(),
        date: date.getDate(),
        day: date.getDay(),
      };
    case 'np':
    default:
      return { ...findBSfromAD(formatDate(date)), day: date.getDay() };
  }
};

const manipulate = (currentDate: string, value: number) => {
  const parsed = parseDate(currentDate);
  if (parsed) {
    return parsed;
  } else {
    throw Error(
      `Invalid date ${currentDate} to ${value < 0 ? 'subtract' : 'add'}.`,
    );
  }
};

export const manipulateDays = (currentDate: string, days: number) => {
  const parsed = manipulate(currentDate, days);
  const ad = findADfromBS(stringDateFormatter(parsed));
  const date = new Date(ad.toString());
  date.setDate(date.getDate() + days);
  try {
    return findBSfromAD(
      stringDateFormatter({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
      }),
    );
  } catch (err) {
    if (days < 0) {
      throw Error(
        `Cannot subtract day(s). Subtracting ${Math.abs(days)} day(s) results in date smaller than ${getDateFromNumber(startDateBS).year}`,
      );
    }
    throw Error(
      `Cannot add day(s). Adding ${Math.abs(days)} day(s) results in date greater than ${getDateFromNumber(startDateBS).year + yearMonthDays.length - 1}`,
    );
  }
};

export const manipulateWeeks = (currentDate: string, weeks: number) => {
  const parsed = manipulate(currentDate, weeks);
  const ad = findADfromBS(stringDateFormatter(parsed));
  const date = new Date(ad.toString());
  date.setDate(date.getDate() + weeks * 7);
  try {
    return findBSfromAD(
      stringDateFormatter({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        date: date.getDate(),
      }),
    );
  } catch (err) {
    if (weeks < 0) {
      throw Error(
        `Cannot subtract week(s). Subtracting ${Math.abs(weeks)} week(s) results in date smaller than ${getDateFromNumber(startDateBS).year}`,
      );
    }
    throw Error(
      `Cannot add week(s). Adding ${Math.abs(weeks)} week(s) results in date greater than ${getDateFromNumber(startDateBS).year + yearMonthDays.length - 1}`,
    );
  }
};

export const manipulateMonths = (currentDate: string, months: number) => {
  const parsed = manipulate(currentDate, months);
  const { year, month, date } = parsed;
  let yearIndex = getBSYearIndexFromBS(year);
  let incMonth = month - 1 + months;

  yearIndex += Math.floor(incMonth / 12);
  if (yearIndex > yearMonthDays.length - 1 || yearIndex < 0) {
    if (months < 0) {
      throw Error(
        `Cannot subtract month(s). Subtracting ${Math.abs(months)} month(s) results in date smaller than ${getDateFromNumber(startDateBS).year}`,
      );
    }
    throw Error(
      `Cannot add month(s). Adding ${Math.abs(months)} month(s) results in date greater than ${getDateFromNumber(startDateBS).year + yearMonthDays.length - 1}`,
    );
  }
  incMonth %= 12;
  if (incMonth < 0) {
    incMonth = 12 + incMonth;
  }
  let incDate = date;

  const daysInIncMonth = yearMonthDays[yearIndex][incMonth];

  if (incDate > daysInIncMonth) {
    incMonth += 1;
    incDate -= daysInIncMonth;
    if (incMonth > 11) {
      incMonth = 0;
      yearIndex += 1;
    }
  }

  if (yearIndex > yearMonthDays.length - 1 || yearIndex < 0) {
    if (months < 0) {
      throw Error(
        `Cannot subtract month(s). Subtracting ${Math.abs(months)} month(s) results in date smaller than ${getDateFromNumber(startDateBS).year}`,
      );
    }
    throw Error(
      `Cannot add month(s). Adding ${Math.abs(months)} month(s) results in date greater than ${getDateFromNumber(startDateBS).year + yearMonthDays.length - 1}`,
    );
  }

  return {
    year: getDateFromNumber(startDateBS).year + yearIndex,
    month: incMonth,
    date: incDate,
  };
};

export const manipulateYears = (currentDate: string, years: number) => {
  const parsed = manipulate(currentDate, years);
  const { year, month, date } = parsed;
  let yearIndex = getBSYearIndexFromBS(year);
  yearIndex += years;
  if (yearIndex > yearMonthDays.length - 1 || yearIndex < 0) {
    if (years < 0) {
      throw Error(
        `Cannot subtract year(s). Subtracting ${Math.abs(years)} year(s) results in date smaller than ${getDateFromNumber(startDateBS).year}`,
      );
    }
    throw Error(
      `Cannot add year(s). Adding ${Math.abs(years)} year(s) results in date greater than ${getDateFromNumber(startDateBS).year + yearMonthDays.length - 1}`,
    );
  }

  let incMonth = month - 1;
  const daysInIncMonth = yearMonthDays[yearIndex][incMonth];
  let incDate = date;
  if (incDate > daysInIncMonth) {
    incMonth += 1;
    incDate -= daysInIncMonth;
    if (incMonth > 11) {
      incMonth = 0;
      yearIndex += 1;
    }
  }

  if (yearIndex > yearMonthDays.length - 1 || yearIndex < 0) {
    if (years < 0) {
      throw Error(
        `Cannot subtract year(s). Subtracting ${Math.abs(years)} year(s) results in date smaller than ${getDateFromNumber(startDateBS).year}`,
      );
    }
    throw Error(
      `Cannot add year(s). Adding ${Math.abs(years)} year(s) results in date greater than ${getDateFromNumber(startDateBS).year + yearMonthDays.length - 1}`,
    );
  }

  return {
    year: getDateFromNumber(startDateBS).year + yearIndex,
    month: incMonth,
    date: incDate,
  };
};
