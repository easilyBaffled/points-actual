const tagDict = {
  home: 0,
  health: 0.01,
  mind: 0.02,
  therp: 0.03666666666666667,
  adhd: 0.05333333333333333,
  eating: 0.06999999999999999,
  food: 0.08666666666666667,
  glasses: 0.10333333333333333,
  planning: 0.12,
  // food: 0.13,
  cooking: 0.1390909090909091,
  yk: 0.1481818181818182,
  sukkot: 0.1572727272727273,
  race: 0.16636363636363638,
  bayBridge: 0.17545454545454547,
  thanksgiving: 0.18454545454545457,
  hike: 0.19363636363636366,
  hikes: 0.20272727272727276,
  micah: 0.21181818181818182,
  israel: 0.22090909090909092,
  house: 0.23,
  mortgage: 0.24000000000000002,
  hunting: 0.29,
  cleaning: 0.33999999999999997,
  entry: 0.35,
  kitchen: 0.36666666666666664,
  bedroom: 0.3833333333333333,
  bathroom: 0.4,
  mopping: 0.4166666666666667,
  roomba: 0.43333333333333335,
  car: 0.45,
  safety: 0.46,
  charging: 0.49333333333333335,
  improvement: 0.5266666666666667,
  budget: 0.56,
  // car: 0.5700000000000001,
  // improvement: 0.6699999999999999,
  // bathroom: 0.6799999999999999,
  pantry: 0.73,
  parsha: 0.78,
  YK: 0.79,
  entertainment: 0.89,
  party: 0.9,
  games: 0.95,
  wrk: 1,
  prep: 1.01,
  // planning: 1.02,
  team: 1.34,
  lightingTalk: 1.35,
  anno: 1.67,
  service: 1.68,
  toolbar: 1.7333333333333334,
  item: 1.7866666666666666,
  create: 1.7966666666666666,
  card: 1.8399999999999999,
  list: 1.8933333333333333,
  state: 1.9466666666666668,
  misc: 2,
  fishing: 2.01,
  viz: 2.0199999999999996,
  // planning: 2.053333333333333,
  vis: 2.0866666666666664,
  points: 2.1199999999999997,
  // planning: 2.1299999999999994,
  date: 2.163333333333333,
  markdown: 2.1966666666666663,
  // planning: 2.23,
  dev: 2.34,
  jam: 2.3499999999999996,
  tts: 2.4499999999999997,
  carmen: 2.56,
  color: 2.67,
  hicking: 2.6799999999999997,
  climbing: 2.713333333333333,
  snacks: 2.7466666666666666,
  gaming: 2.78
  // jam: 2.89,
  // carmen: 2.9
};

export const getTaskPosition = (tags) => {
  const scoringTag = tags
    .reverse()
    .find((tag) => tag.replace("#", "") in tagDict);
  if (!scoringTag) console.warn(tags);

  return tagDict[(scoringTag ?? "").replace("#", "")];
};

export const getTagDictHighestValue = () => {
  return Math.ceil(Object.values(tagDict).at(-1));
};
