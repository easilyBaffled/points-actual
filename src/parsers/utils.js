export const getTimeboxedTasks = (pointsMarkdown) => {
  return (
    pointsMarkdown.match(timeboxMatcher)[1].match(/\d+:\d+\s+(?<task>#.*)/g) ??
    []
  ).map((s) => s.replace(/\d+:\d+\s+/, ""));
};

const timeboxMatcher = /#### Time block\n+([\s\S]+)---/;

export const getCompletedTimeboxedTasks = (pointsMarkdown) =>
  pointsMarkdown.match(timeboxMatcher)[1].match(/- \[x\] .*/gm);

export const getTimeboxPizza = (pointsMarkdown) => {
  const count =
    pointsMarkdown
      .match(timeboxMatcher)?.[1]
      .match(/^([XxO🍕]+)$/m)?.[0]
      .match(/(x)/g)?.length ?? 0;

  return "+🍕".repeat(count);
};

export const getTaskList = (pointsMarkdown) => {
  const res = pointsMarkdown
    .match(/## Tasks\n([\S\s]+)/)[1]
    .replace(/(####.*)/g, "")
    .replace("### Not Today", "")
    .replace("#### On Other Days", "");

  return res;
};
export const formatTaskList = (strOrArray) =>
  (Array.isArray(strOrArray) ? strOrArray : strOrArray.split("\n"))
    .filter(Boolean)
    .map((s) => s.trim());
