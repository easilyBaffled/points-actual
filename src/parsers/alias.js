const aliasSectionMatcher = /(?<=## Aliases\s*).*?(?=---)/s;
const aliasMatcher =
  /#(?<alias>\w+) (?<firstDate>\d+\/\d+)-?(?<lastDate>\d+\/\d+)/s;

export const getAlias = (pointsMarkdown) => {
  return pointsMarkdown
    .match(aliasSectionMatcher)[0]
    .trim()
    .split("\n")
    .filter(Boolean);
};

const isShortHand = (date) => {
  if (date instanceof Date) return false;
  return typeof date === "string" && /\d+\/\d+/.test(date);
};

const shortHandToDate = (date) => {
  const year = new Date().getFullYear();
  return new Date(`${date}/${year}`);
};

export const dateToShortHand = (date) =>
  date.toLocaleDateString("en-US").replace(/(\/\d+)$/, "");

export function compareDates(date, targetDate) {
  const a = (isShortHand(date) ? shortHandToDate(date) : date).getTime();
  const b = (
    isShortHand(targetDate) ? shortHandToDate(targetDate) : targetDate
  ).getTime();

  return a - b;
}

export function isBefore(date, targetDate) {
  return compareDates(date, targetDate) < 0;
}

export function isOn(date, targetDate) {
  return compareDates(date, targetDate) === 0;
}

export function isAfter(date, startDate, endDate) {
  return compareDates(date, endDate) > 0;
}

export function isBetween(date, startDate, endDate) {
  return compareDates(date, startDate) > 0 && compareDates(date, endDate) < 0;
}

export function parseAlias(alises) {
  const year = new Date().getFullYear();
  return alises.reduce((dict, a) => {
    const { alias, firstDate, lastDate } = a.match(aliasMatcher)?.groups ?? {};
    dict[alias] = {
      firstDate: new Date(`${firstDate}/${year}`),
      lastDate:
        new Date(`${lastDate}/${year}`) ?? new Date(`${firstDate}/${year}`)
    };

    return dict;
  }, {});
}
