const isDone = (taskStr) => taskStr.startsWith("- [x] ");

export const collectSplitOutDoneTasks = (taskList) =>
  taskList.reduce(
    (lists, task) => {
      lists[+isDone(task)].push(task);
      return lists;
    },
    [[], []]
  );

const completionStreakMatcher = /(Completion Streak\s+)([^---]+)/;

export const getCompletionStreak = (pointsMarkdown) =>
  (pointsMarkdown.match(completionStreakMatcher)[2] ?? "")
    .split("\n")
    .filter(Boolean);

export const addCompletionGoal = (pointsMarkdown, goalStr) =>
  pointsMarkdown.replace(completionStreakMatcher, `$1$2${test}\n`);

const goalMatcher =
  /\d+\/\d+ at \d+\. Target (\d+)\(\s*\d+\s*\) 🍕(\d+)\s*\(\s*\d+\s*\)/;

export const parseCompletionGoal = (goalStr) => {
  const [__, target, extraTarget] = goalStr.match(goalMatcher);
  return { target: Number(target), extraTarget: Number(extraTarget) };
};

export const constructGoal = (todaysDate, activeCount) =>
  `${todaysDate} at ${activeCount}. Target ${Math.round(
    activeCount * 0.975
  )}( ${Math.round(activeCount * 0.026)} ) 🍕${Math.round(
    activeCount * 0.95
  )}( ${Math.round(activeCount * 0.05)} )`;
