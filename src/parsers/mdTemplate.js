import { getDayName } from "../dayByDayLimits";

export const template = (state) => `

# To-Do This Week

## Completion Streak
${state.completionStreak.join("\n")}

---

## Points: ${state.points}

---


## Tabs: ${state.tabs?.newTabs ?? state.tabs.old}(${Math.floor(
  (state.tabs?.newTabs ?? state.tabs?.old) * 0.9
)}) -> 

---
## Streaks
${state.streaks
  .map(
    ({ name, values, itteration }) =>
      `- [ ] ${name}: ${values.join(" ")} 🍕 ${itteration}`
  )
  .join("\n")}

---

#### Time block

⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩

OOO🍕OO🍕O🍕

6:00		
6:30		
7:00		Workout
7:30		⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛
8:00		Stretch
8:30		Shower, Dress, Bed
9:00		🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
9:30		Journal
10:00		
10:30		
11:00		
11:30		
12:00		
12:30		
1:00		
1:30		
2:00		
2:30		
3:00		
3:30		
4:00		Plan Tomorrow
4:30		
5:00		
5:30		
6:00		
6:30		
7:00		
7:30		
8:00		
8:30		
9:00		
- Walk: 30
- lunch: 30
- nap: 35
- PRs: 30
- Clear paper: 30

---

## Aliases

${state.aliasString.join("\n")}

---

## Tasks

${state.taskList.done
  .filter((t) => t.includes("->"))
  .map((t) => t.replace("- [x] ", ""))
  .join("\n")}

${Object.entries(state.activeTasks)
  .filter(([, tasks]) => tasks.length > 0)
  .flatMap(([header, tasks]) => {
    if (header.includes("/")) {
      header = `${header.replace("#on-", "")} ${getDayName(header)}`;
    }

    return `#### ${header}\n${tasks.join("\n")}`;
  })
  .join("\n\n")}
`;

// ${state.taskList.weekly.join("\n")}

// ${state.taskList.active.map((t) => t.str).join("\n")}
