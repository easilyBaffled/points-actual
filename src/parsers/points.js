const pointsIdentifier = /## Points: (.*)/;
const pizzaReplacer = /([0-9-+*. ()]+)(\+🍕)+(.*)/g;
import { getTimeboxPizza } from "./utils";

function replacePizza(str) {
  while (str.includes("🍕")) {
    str = str.replace(pizzaReplacer, "($1)*1.05$3");
  }
  return str;
}

function parseMath(str) {
  return Function(`'use strict'; return (${str})`)();
}

export const getPointValue = (pointsMarkdown) =>
  parseMath(
    replacePizza(
      pointsMarkdown.match(pointsIdentifier)[1] +
        getTimeboxPizza(pointsMarkdown)
    )
  );

export const setPointValue = (pointsMarkdown, newValue) =>
  pointsMarkdown.replace(pointsIdentifier, newValue);
