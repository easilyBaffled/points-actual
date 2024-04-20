import { produce, setAutoFreeze } from "immer";
import moment from "moment";
import { sortTasks, getDistance } from "./sortTasks";
import { markdown as tasks } from './points.md';
import { markdown as weeklyTasks } from "./parsers/weeklyTasks.md";
import { parseAlias, getAlias } from "./parsers/alias";
import {
  getPointValue,
  getCompletionStreak,
  getTaskList,
  formatTaskList,
  collectSplitOutDoneTasks,
  parseCompletionGoal,
  constructGoal,
  template,
  parseStreaks,
  getStreaks,
  applyStreaks,
  applyTabs,
  parseTabs,
  getTimeboxedTasks,
  getCompletedTimeboxedTasks,
  getTimeboxPizza
} from "./parsers";
import {
  displayDayBydayLimits,
  calculateDayByDay,
  dateStringToDate,
  getDayName,
  addDayByDayPoints,
  TODAY_HOUR_LIMIT,
  extraDates,
  dayToDate,
  listDates
} from "./dayByDayLimits";
import {
  createNodeTagTree,
  prettyPrintCatTree,
  createTagTree,
  createScoreTable,
  createTree
} from "./createTagTree";
import { convertMiliseconds } from './parseTaskString.js';

const values = [
  "today",
  "on-tuesday",
  "on-wednesday",
  "on-thursday",
  "on-friday",
  "on-saturday",
  "on-sunday",
  "on-monday",
  "r",
  "pr",
  "none"
];

const getValue = (str) => {
  const date = (str.match(/^#(?<date>[^ ]+ )/).groups.date || "").trim();

  const index = values.indexOf(date);
  return index === -1 ? values.length : index;
};

const sort = (str) =>
  copy(
    str
      .split("\n")
      .filter(Boolean)
      .map((s) => s.trim())
      .sort((a, b) => {
        return getValue(a) - getValue(b);
      })
      .join("\n")
  );

window.sort = sort;

setAutoFreeze(false);
console.tap = (v, ...rest) => (console.log(v, ...rest), v);
console.clear();

const initialState = {
  points: 0,
  completionStreak: [],
  taskList: {
    streaks: [],
    active: [],
    done: []
  }
};

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

const todaysDate = moment().format("MM/DD");
const yesterdaysDate = moment().subtract(1, "days").format("MM/DD");
const tomorrowsDate = moment().add(1, "days").format("MM/DD");

function constructState(pointsMarkdown) {
  return produce(initialState, (draft) => {
    draft.completionStreak = getCompletionStreak(pointsMarkdown);
    if (draft.completionStreak.length > 7) {
      draft.completionStreak = [];
    }
    draft.points = getPointValue(pointsMarkdown);
    const [active, done] = collectSplitOutDoneTasks(
      formatTaskList(getTaskList(pointsMarkdown))
    );

    draft.taskList.active = active.concat(getTimeboxedTasks(pointsMarkdown));
    draft.taskList.done = done.concat(
      getCompletedTimeboxedTasks(pointsMarkdown) ?? []
    );
    draft.taskList.weekly = weeklyTasks.split("\n").filter((s) =>
      s.startsWith(
        "#on-" +
          moment()
            .add(+(new Date().getHours() > 12), "days")
            .format("dddd")
            .substring(0, 3)
            .toLowerCase()
      )
    );
    draft.streaks = parseStreaks(getStreaks(pointsMarkdown));
    draft.tabs = parseTabs(pointsMarkdown);
    draft.alias = parseAlias(getAlias(pointsMarkdown));
    draft.aliasString = getAlias(pointsMarkdown);
  });
}

function applyCompletedTasks(state) {
  return produce(state, (draft) => {
    draft.points += draft.taskList.done.length;
  });
}

function applyCompletionStreak(state) {
  const { target, extraTarget } = parseCompletionGoal(
    state.completionStreak.at(-1)
  );
  const activeCount = state.taskList.active.length;

  return produce(state, (draft) => {
    if (activeCount > target) draft.completionStreak = [];
    if (activeCount <= target) draft.points += 1;
    if (activeCount <= extraTarget)
      draft.points += Math.floor(draft.points * 0.05);

    draft.completionStreak.push(constructGoal(todaysDate, activeCount));
  });
}

function logTaskTable(tasks) {
  console.table(
    tasks.reduce((acc, { id, ...task }) => {
      try {
        const {
          rawAge,
          position: { timing, category },
          tags: { timing: tagTiming, categories: tagCategory }
        } = task;
        acc[id] = {
          // rawAge,
          tagTiming,
          tagCategory: tagCategory.join(" "),
          age: convertMiliseconds(rawAge, "d"),
          timing: Number(timing.toFixed(2)),
          category: Number(category.toFixed(2)),
          distance: Number(getDistance({ timing, category }).toFixed(2))
        };
      } catch (e) {
        console.log(task);
        throw e;
      }
      return acc;
    }, {})
  );
  return tasks;
}

function getWorkDuration(state) {
  const grouped = state.taskList.active
    .filter((t) => !t.notToday)
    .reduce((acc, task) => {
      // acc[task.dueDate] = (acc[task.dueDate] ?? []).concat(task);

      acc[task.dueDate] =
        (acc[task.dueDate] ?? 0) +
        Number(task.str.match(/:\s+(?<duration>\d+)$/)?.groups?.duration ?? 25);

      return acc;
    }, {});

  Object.entries(grouped).forEach(([date, amount]) => {
    if (amount > TODAY_HOUR_LIMIT && date !== "undefined")
      console.log(
        `%c⛔ ${moment(date).format(
          "dddd"
        )} has ${amount} minutes scheduled which is ${
          amount - TODAY_HOUR_LIMIT
        } over the reasonable limit.`,
        "background: tomato; padding: 12px; color: white; font-size: 1.05rem;"
      );
  });
}

const sortActiveTasks = (state, targetDate) => {
  return produce(state, (draft) => {
    const activeTasks = sortTasks(state.taskList.active, state);

    draft.taskList.active = activeTasks.filter((t) => !t.notToday);

    draft.taskList.notToday = activeTasks.filter((t) => t.notToday);
  });
};

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const newState = applyTabs(
  applyCompletionStreak(
    sortActiveTasks(
      applyStreaks(
        applyCompletedTasks(constructState(tasks.replace(/  /g, " ")))
      ),
      new Date() //.getHours() < 12 ? new Date() : tomorrow
    )
  )
);
// console.log(tasks);
// console.log(newState.taskList.notToday);

newState.taskList.notToday.forEach((task) => {
  const day = task.str.split(" ")[0];

  if (day.includes("/")) {
    const date = dateStringToDate(day);

    const startingDate = new Date();
    startingDate.setDate(startingDate.getDate() + 7);
    const diff = startingDate.getTime() - date.getTime();

    if (diff > 0) {
      const dayString = getDayName(day);

      Object.assign(task, {
        str: task.str.replace(/-\d+\/\d+/, `-${dayString}`)
      });
    }
  }
});

const dayByDay = calculateDayByDay(newState);

addDayByDayPoints(newState, dayByDay);

const taskStrings = newState.taskList.weekly.concat(
  newState.taskList.active.map((t) => t.str)
);

function getDateTag(taskString) {
  const dateDate = taskString.split(" ")[0];
  const date = dayToDate(dateDate, true);

  return `#on-${date.getMonth() + 1}/${date.getDate()}`;
}

const todayTag = `#on-${today.getMonth() + 1}/${today.getDate()}`;

const { rest, ...dates } = taskStrings.reduce(
  (acc, taskString) => {
    let timingTag = taskString.split(" ")[0];
    if (timingTag.startsWith("#none-")) {
      acc.none.push(taskString);
    } else if (timingTag === todayTag) {
      acc.rest.push(taskString.replace(timingTag, "#today"));
    } else if (timingTag.startsWith("#on-")) {
      const dateTag = getDateTag(timingTag);

      if (!(dateTag in acc)) {
        acc[dateTag] = [];
      }
      acc[dateTag].push(taskString);
    } else {
      acc.rest.push(taskString);
    }
    return acc;
  },
  {
    ...listDates(today.getHours() < 12 ? today : tomorrow, 20).reduce(
      (acc, date) => ({ ...acc, ["#on-" + date]: [] }),
      {}
    ),
    rest: [],
    none: []
  }
);

const getTime = (...taskStrs) => {
  return taskStrs.reduce(
    (sum, str) => sum + Number(str.split(": ")[1] ?? 0),
    0
  );
};

rest.forEach((str) => {
  const taskTime = getTime(str);
  const [dateTag] = Object.entries(dates).find(
    ([dateTag, taskStrs]) => getTime(...taskStrs) + taskTime <= TODAY_HOUR_LIMIT
  ) ?? ["none"];

  dates[dateTag].push(str);
});

newState.activeTasks = dates;

const newmd = template(newState);
// logTaskTable(newState.taskList.active);
// console.log(newState);
console.log(newmd);
// getWorkDuration(newState);
displayDayBydayLimits(dayByDay);

const catTree = newState.taskList.active
  .map((t) => t.tags.categories)
  .reduce((acc, cats) => {
    let dict = acc;
    cats.forEach((cat) => {
      if (!(cat in dict)) {
        dict[cat] = {};
      }
      dict = dict[cat];
    });
    return acc;
  }, {});

const styles = {};

function convertRange(value, r1, r2) {
  return ((value - r1[0]) * (r2[1] - r2[0])) / (r1[1] - r1[0]) + r2[0];
}

const convertDepth = (v) => {
  return convertRange(v, [0, 3], [10, 45]);
};

function getColorByDepth(depth) {
  // Define a base color and adjust its lightness based on depth
  const baseHue = 200; // Blue hue
  const lightness = convertDepth(depth);
  return `hsl(${baseHue}, 30%, ${lightness}%)`;
}

function logReadableObject(obj, depth = 0) {
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      const color = getColorByDepth(depth);
      const style = `background: teal; padding: 6px; color: ${color}; font-size: ${
        16 - depth * depth
      }px; border-radius: 5px; margin: -0; margin-left: ${depth * 16}px`;

      if (typeof obj[key] === "object" && Object.keys(obj[key]).length > 0) {
        if (depth) {
          console.groupCollapsed(`%c${key}`, style);
        } else {
          console.group(`%c${key}`, style);
        }
        logReadableObject(obj[key], depth + 1);
        console.groupEnd();
      } else {
        console.log(`%c${key}`, style);
      }
    }
  }
}

// console.log(logReadableObject(catTree));

// console.log(
//   // prettyPrintCatTree(
//   createNodeTagTree(newState.taskList.active.map((t) => t.str).join("\n"))
//   // )
// );

// const dateTags = ["today", "on-friday", "on-sunday", "on-5/1"];
// const ages = Array(5)
//   .fill(0)
//   .map((__, i) => i ** i);

// const list = dateTags.map((date) => {
//   const dateValue = deriveValueFromTimingTag(date);
//   const row = {
//     date,
//     dateValue
//   };
//   ages.forEach((age) => {
//     row[age] = `*: ${dateValue * age} | ^ ${dateValue ** age} | -^ ${
//       age ** dateValue
//     }`;
//   });

//   return row;
// });

// const table = list.reduce((acc, { date, ...rest }) => {
//   acc[date] = rest;
//   return acc;
// }, {});

// console.table(table);
