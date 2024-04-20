import { isEqual, uniqWith } from "lodash";
/**
 *
 * @param {string} str
 * @param {number} index
 * @return {[string, string]}
 */
const splitAt = (str, index) => [str.slice(0, index), str.slice(index)];

/**
 *
 * @param {string} str
 * @return {number}
 */
const findRegexIndex = (str) => / ([^#])/.exec(str)?.index ?? 0;

/**
 *
 * @param {string} task
 * @return {[string, string]}
 */
const splitTagsAndTask = (task) => splitAt(task, findRegexIndex(task));

export function createTagTree(str) {
  return str
    .split("\n")
    .map(splitTagsAndTask)
    .reduce((tags, [taskTags]) => {
      const [date, ...categories] = taskTags.split(" ");
      categories.reduce((cat, c) => {
        // if c is already in tags, enter c
        // if c isn't in tags,
        if (c in cat) return cat[c];
        else {
          cat[c] = {};
          return cat[c];
        }
      }, tags);

      return tags;
    }, {});
}

class CategoryNode {
  static create(categoryStr, path = []) {
    return {
      // id: Date.now(),
      path: path.concat(categoryStr),
      name: categoryStr,
      children: {}
    };
  }

  static getChildByName(parent, name) {
    return parent?.children[name];
  }
  // static getChildIndexByName(parent, name) {
  //   return parent?.children?.findIndex((child) => child.name === name);
  // }
}

const root = CategoryNode.create("root");

export function createFlatNodeTagTree(taskListString) {
  let catList = uniqWith(
    formatTaskList(taskListString).map(([taskTags]) =>
      getCategoriesFromTaskTags(taskTags)
    ),
    isEqual
  );
  catList.reduce((acc, catSet) => {
    catSet.forEach((cat) => {});
  }, {});
}

export const createTree = (nodeObj, parent = CategoryNode.create("root")) => {
  Object.entries(nodeObj).forEach(([tag, children]) => {
    const node = CategoryNode.create(tag, parent.path);
    parent.children.push(node);
    createTree(children, node);
  });
  return parent;
};

export function createNodeTagTree(str) {
  let cats = Array.isArray(str)
    ? str
    : formatTaskList(str).map(([taskTags]) =>
        getCategoriesFromTaskTags(taskTags)
      );
  // console.log(cats);
  cats.forEach((categories) => {
    categories.reduce((parent, catName) => {
      const childNode = CategoryNode.getChildByName(parent, catName);
      if (childNode) return childNode;
      else {
        parent.children[catName] = CategoryNode.create(catName, parent.path);
        return Object.values(parent.children).at(-1);
      }
    }, root);
  });

  return root;
}

function formatTaskList(taskList) {
  return taskList.split("\n").filter(Boolean).map(splitTagsAndTask);
}
function getCategoriesFromTaskTags(taskTags) {
  const [date, ...categories] = taskTags.split(" ");
  return categories;
}

export function prettyPrintCatTree(node, arr = []) {
  const padding = "\t".repeat(node.path.length);
  arr.push(padding + node.name); //+ ": " + (node.value ?? "")
  node.children.forEach((child) => {
    prettyPrintCatTree(child, arr);
  });
  return arr.join("\n");
}

export function scoreTaskCategories(taskCats, masterCatList) {
  let parent = masterCatList;
  return taskCats.reduce((scores, cat) => {
    scores.push(CategoryNode.getChildIndexByName(parent, cat));
    parent = CategoryNode.getChildByName(parent, cat);
    return scores;
  }, []);
}

export function createScoreTable(taskList, masterCatList) {
  return formatTaskList(taskList)
    .map(([taskTags, task]) => [getCategoriesFromTaskTags(taskTags), task])
    .reduce(
      (table, [categories, task]) => ({
        ...table,
        [categories.join(" ") + task]: {
          ...scoreTaskCategories(categories, masterCatList),
          Value: scoreTaskCategories(categories, masterCatList).reduce(
            (sum, v) => sum + v,
            0
          )
        }
      }),
      {}
    );
}

// Task | Cat 1 | Cat 2 | Cat 3 | Cat 4
