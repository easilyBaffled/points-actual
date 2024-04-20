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
export const splitTagsAndTask = (task) => splitAt(task, findRegexIndex(task));
