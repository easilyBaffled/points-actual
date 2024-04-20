import { deriveValueFromTimingTag } from "./parseTaskString.js";

export const DAY_HOUR_LIMIT = 5 * 60;
export const TODAY_HOUR_LIMIT = 7 * 60;
export function listDates(startDate, numDates) {
  const oneDay = 24 * 60 * 60 * 1000; // One day in milliseconds
  const dateArray = Array.from({ length: numDates }, (_, index) => {
    const currentDate = new Date(startDate.getTime() + index * oneDay);
    return `${currentDate.getMonth() + 1}/${currentDate.getDate()}`;
  });

  return dateArray;
}

export function dateStringToDate(dateString) {
  dateString = dateString.replace(/#?on-/, "");

  const [month, day] = dateString.split("/");

  return new Date(new Date().getFullYear(), parseInt(month) - 1, parseInt(day));
}

export function getDayName(dateString) {
  const date = dateStringToDate(dateString);
  const dayIndex = date.getDay();

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];

  return dayNames[dayIndex];
}

export const dayToDate = (input) => {
  if (input.includes("/")) return new Date(input + "/23");
  if (input.includes("today")) return new Date();

  input = input.replace("#on-", "");

  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday"
  ];

  const referenceDate = new Date();
  const dayIndex = dayNames.indexOf(input);

  const daysUntilTargetDay = (dayIndex + 7 - referenceDate.getDay()) % 7 || 7;
  const targetDate = new Date(
    referenceDate.getTime() + daysUntilTargetDay * 24 * 60 * 60 * 1000
  );
  return targetDate;
};

function sortDatesAndDays(a, b) {
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday"
  ];

  if (a === "today") return -1;
  if (b === "today") return 1;
  if (a === "none") return 1;
  if (b === "none") return -1;

  const dateA = dayToDate(a);
  const dateB = dayToDate(b);
  return dateA - dateB;
}

const startingDate = new Date();
startingDate.setDate(startingDate.getDate() + 8);
export const extraDates = (startDate = startingDate, limit = 10) =>
  listDates(startDate, limit).reduce((acc, dateString) => {
    acc["on-" + dateString] = [];
    return acc;
  }, {});

export const calculateDayByDay = (state) => {
  const groupedByTime = state.taskList.active
    .concat(state.taskList.notToday)
    .map((s) => s)
    .reduce((acc, { tags, str }) => {
      try {
        const t = tags.timing;
        if (!acc[t]) {
          acc[t] = [];
        }

        acc[t].push(str);
        return acc;
        // }, {});
      } catch (e) {
        console.log({ str });
        throw e;
      }
    }, extraDates());

  const time = (str = "") => {
    try {
      return (str.match(/(\d+)$/gm) ?? [])
        .map((s) => parseInt(s))
        .reduce((acc, v) => acc + v, 0);
    } catch (e) {
      console.log(str);
      throw e;
    }
  };

  groupedByTime.today = groupedByTime.today.concat(
    state.taskList.done.filter((t) => t.includes("->"))
  );

  const timeGroupAmounts = Object.entries(groupedByTime).reduce(
    (acc, [v, arr]) => {
      acc[v] = time(arr.join("\n"));
      return acc;
    },
    {}
  );

  console.log(
    `%cThe limit is ${DAY_HOUR_LIMIT}`,
    "background: grey; padding: 6px 25%; color: white; font-size: 1.05rem; border-radius: 5px; margin: 0;"
  );

  return Object.entries(timeGroupAmounts).sort(
    ([a], [b]) => deriveValueFromTimingTag(a) - deriveValueFromTimingTag(b)
  );
};

export function sortDays(list) {
  if (typeof list === "string") list = list.split("\n");

  copy(
    list
      .sort((a, b) => {
        const res = sortDatesAndDays(
          a[0].replace("on-", ""),
          b[0].replace("on-", "")
        );

        return res;
      })
      .join("\n")
  );
}

window.sortDays = sortDays;

export function displayDayBydayLimits(dayBayDayList) {
  dayBayDayList.forEach(([name, amount]) => {
    const overage =
      (name === "today" ? TODAY_HOUR_LIMIT : DAY_HOUR_LIMIT) - amount;

    if (name.includes("/")) {
      name = `${name} ${getDayName(name)}`;
    }
    if (overage < 0) {
      console.log(
        `%c${name} ${amount} is over by ${overage * -1}`,
        "background: tomato; padding: 6px; color: white; font-size: 1.05rem; border-radius: 5px; margin: 0;"
      );
    } else {
      console.log(
        `%c${name} ${amount} is under by ${overage} `,
        "background: teal; padding: 6px; color: white; font-size: 1.05rem; border-radius: 5px; margin: -0;"
      );
    }
  });
}

export function addDayByDayPoints(state, dayByDay) {
  let mod = 5;
  for (const [i, [day, amount]] of dayByDay.slice(0, 8).entries()) {
    if (
      (day === "today" && TODAY_HOUR_LIMIT < amount) ||
      DAY_HOUR_LIMIT < amount
    ) {
      break;
    }
    if (i % mod === 0) {
      // mod -= 1;
      state.points *= 1.05;
    }
    // newState.points += 1;
  }
}
