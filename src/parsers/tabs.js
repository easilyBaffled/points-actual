import { produce } from "immer";

const tabMatcher = /Tabs: (?<old>\d+)\((?<target>\d+)\) ->\s*(?<newTabs>\d+)?/;

export const parseTabs = (pointsMarkdown) =>
  pointsMarkdown.match(tabMatcher).groups;

export const applyTabs = (state) => {
  return produce(state, (draft) => {
    if (Number(state.tabs.newTabs) <= Math.floor(Number(state.tabs.target)))
      draft.points += 1;
  });
};
