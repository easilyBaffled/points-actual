import { produce, current } from "immer";

const treaksMatcher = /## Streaks\n+([\s\S]+?)---/;
const streakMatcher =
  /- \[(?<status>.)\](?<name>[^:]+):(?<values>[^🍕]*)\s*🍕*\s*(?<itteration>\d+)/;
export const getStreaks = (pointsMarkdown) =>
  pointsMarkdown.match(treaksMatcher)[1].split("\n").filter(Boolean);

export function applyStreaks(state) {
  return produce(state, (draft) => {
    draft.streaks.forEach((streak) => {
      if (streak.complete) {
        if (!streak.values.length) {
          draft.points *= 1.05;
          streak.values = Array(5)
            .fill(streak.itteration + 1)
            .map((num, i) => num + i);
          streak.itteration += 1;
        } else {
          draft.points += streak.values[0];
          streak.values.shift();
        }
      } else {
        streak.values = [1, 2, 3, 4, 5];
        streak.itteration = 1;
      }
    });
  });
}

export function constructStreakString({ name, values, itteration }) {
  return `- [ ] ${name}: ${values.join(" ")} 🍕${itteration}`;
}

export function parseStreaks(streaks) {
  return streaks.map((streak) => {
    const { status, name, values, itteration } =
      streak.match(streakMatcher).groups;
    const vals = values
      .trim()
      .split(" ")
      .filter(Boolean)
      .map((n) => Number(n));
    return {
      complete: status === "x",
      name: name.trim(),
      values: vals,
      itteration: Number(itteration)
    };
  });
}
