import _ from "lodash";
import { parseTaskString } from "./parseTaskString";

export const round = (num, amount = 3) => Number(num.toFixed(amount));

export const MAX_TIME = 500;
// const format = (date) => {
//   return date
//     ? new Intl.DateTimeFormat({ dateStyle: "medium" }).format(new Date(date))
//     : date;
// };

export function mod(delta, age) {
  // https://codepen.io/oscarsaharoy/full/eYggrme
  return delta;
}

export function getDistance(position, ...rest) {
  let pos = position;
  if (typeof position === "number") {
    pos = [position, ...rest];
  } else if (_.isPlainObject(position)) {
    pos = Object.values(position);
  }

  return Math.sqrt(pos.reduce((sum, val) => sum + val ** 2, 0));
}

function applyAgeMod(task) {
  // task.position.timing;

  // const valueDict = {
  //   re: 3,
  //   r: 4,
  //   pr: 5,
  //   none: 6
  // };
  try {
    const now = Date.now();
    const age = now - task.created_on;
    const ageInDays = parseInt(Math.floor(age / 1000 / 60 / 60 / 24));
    task.rawAge = age;
    task.ageMod = Number((ageInDays / 4).toFixed(2));
    task.position.timing += Number((ageInDays / 4).toFixed(2));
    return task;
  } catch (e) {
    console.log(task);
    throw e;
  }
}

const compareDistances = (a, b) => {
  const distanceA = getDistance(a.position);
  const distanceB = getDistance(b.position);

  return distanceA - distanceB;
};

export function sortTasks(tasks, state) {
  if (typeof tasks === "string") {
    tasks = tasks.replace(/  /g, " ").split("\n").filter(Boolean);
  }
  const taskList = tasks
    .map(parseTaskString(state))
    .map(applyAgeMod)
    .sort(compareDistances);
  //   .sort(compareDistances)
  //   .map((task) => ({
  //     index: task.str,
  //     ...task.position,
  //     reated_on: task.created_on,
  //     rawAge: task.rawAge,
  //     ageMod: task.ageMod,
  //     distance: getDistance(task.position)
  //   }));
  // console.table(taskList);

  // console.log(parsedTime);
  // const furthest = parsedTime
  //   .map((t) => t.urgency)
  //   .filter((u) => u !== MAX_TIME)
  //   .sort()
  //   .at(-1);
  // const mappedTasks = parsedTime
  //   .map((task) => {
  //     const x =
  //       task.urgency === MAX_TIME
  //         ? 4
  //         : linearScale(task.urgency, 0, furthest * 1.5, 0, 4);

  //     const y = task.tagsPosition; //Math.abs(task.tagsPosition - getTagDictHighestValue());
  //     try {
  //       return Object.assign(task, {
  //         distance: round(getDistance(x, y)),
  //         "x (urgency)": round(x),
  //         "y (tag rank)": round(y / 2),
  //         pos: { x, y }
  //       });
  //     } catch (e) {
  //       // console.log(task);
  //       throw e;
  //     }
  //   })
  //   .sort((a, b) => a.distance - b.distance);
  //console.log(mappedTasks.map((t) => t.dueDate + ` ${t.str.split(" ")[0]}`));

  // console.log(taskList.filter((t) => Array.isArray(t.position.category)));

  return taskList; // .map((t) => t.str).join("\n");
}
