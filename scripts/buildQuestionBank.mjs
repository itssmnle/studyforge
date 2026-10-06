import fs from "node:fs/promises";
import { GENERATED_QUESTION_BANK, loadQuestionBank, listQuestionBankFiles } from "./questionBank.mjs";

const questions = await loadQuestionBank();
await fs.writeFile(GENERATED_QUESTION_BANK, `${JSON.stringify(questions, null, 2)}\n`);
console.log(`Validated ${listQuestionBankFiles().length} topic CSVs and generated ${questions.length} app questions.`);

