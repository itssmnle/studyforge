/* global process, Buffer */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';
import { scienceSubjects } from '../src/data/scienceCurriculum.js';
import { buildTestQuestions, filterTestQuestions, subchapterKey } from '../src/utils/practiceTests.js';

// Exercise the resource layer without accessing production accounts or documents.
const mockSource = `const records = new Map();
export const firestore = {};
export const collection = (_,name) => ({name});
export const doc = (_,name,id) => ({name,id});
export const query = (col,condition) => ({...col,condition});
export const where = (field,op,value) => ({field,op,value});
export const setDoc = async (ref,value) => records.set(ref.name+'/'+ref.id, structuredClone(value));
export const getDoc = async ref => ({exists: () => records.has(ref.name+'/'+ref.id), data: () => records.get(ref.name+'/'+ref.id)});
export const getDocs = async ref => ({docs:[...records.entries()].filter(([key,value]) => key.startsWith(ref.name+'/') && value[ref.condition.field] === ref.condition.value).map(([key,value]) => ({id:key.split('/')[1],data:()=>value}))});`;
const bundle = await build({ entryPoints: ['src/utils/studyResources.js'], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'isolated-storage', setup(builder) {
  builder.onResolve({filter: /^(firebase\/firestore|\.\/firebase)$/}, () => ({path:'storage',namespace:'qa'}));
  builder.onLoad({filter: /.*/,namespace:'qa'}, () => ({contents:mockSource,loader:'js'}));
} }] });
const resources = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);
const routingBundle = await build({ entryPoints: ['src/utils/flashcardDeckRouting.js'], bundle: true, write: false, format: 'esm', platform: 'node', plugins: [{ name: 'isolated-storage', setup(builder) {
  // Routing checks need metadata only; CSV bundling is tested through Vite separately.
  builder.onLoad({filter: /[/\\]data[/\\]flashcardDecks\.js$/}, () => ({contents: `export default ${readFileSync('src/data/flashcardDecks.json', 'utf8')}`, loader: 'js'}));
  builder.onResolve({filter: /^(firebase\/firestore|\.\/firebase)$/}, () => ({path:'storage',namespace:'qa'}));
  builder.onLoad({filter: /.*/,namespace:'qa'}, () => ({contents:mockSource,loader:'js'}));
} }] });
const routing = await import(`data:text/javascript;base64,${Buffer.from(routingBundle.outputFiles[0].text).toString('base64')}`);
const unlinkedTopics = scienceSubjects.flatMap(subject => subject.topics
  .filter(topic => !routing.flashcardDeckForTopic(subject.id, topic.id))
  .map(topic => `${subject.id}/${topic.id}`));
assert.deepEqual(unlinkedTopics, []);
const teacher = {uid:'qa-teacher',role:'teacher'};
const cards = [{front:'Name the process.',back:'Diffusion'}];
const pack = await resources.saveStudyPack({title:'Cell recall',subject:'biology',cards},teacher);
assert.equal((await resources.listStudyPacks(teacher)).length,1);
assert.equal((await resources.listStudyPacks({uid:'other-teacher'})).length,0);
await assert.rejects(resources.saveStudyPack({title:'Invalid',cards}, {role:'student'}), /Teacher access/);
await assert.rejects(resources.saveStudyPack({title:'Empty',cards:[]}, teacher), /complete every/);
const questions = resources.cardsToQuestions(pack.cards,pack.id);
cards[0].front = 'Changed after assigning';
assert.equal(questions[0].prompt,'Name the process.');
const deck = {id:'qa-deck',title:'Cells'};
await resources.saveDeckCards(deck,[{front:'Updated prompt',back:'Updated answer'}],teacher);
assert.equal((await resources.loadDeckCards(deck))[0].back,'Updated answer');
await assert.rejects(resources.saveDeckCards(deck,[{front:'',back:'Answer'}],teacher), /Every flashcard/);
const pool = [
  {id:'a',topic:'cells',subtopic:'Transport',type:'short-answer',difficulty:'Foundation',marks:1},
  {id:'b',topic:'cells',subtopic:'Division',type:'multiple-choice',difficulty:'Higher',marks:2},
];
const matched = filterTestQuestions(pool,[subchapterKey('cells','Transport')],['short-answer'],['Easy']);
assert.deepEqual(matched.map(item => item.id),['a']);
assert.equal(filterTestQuestions(pool,[subchapterKey('cells','Transport')],['numerical'],['Easy']).length,0);
assert.equal(buildTestQuestions(pool,120).length,2);
assert.equal(new Set(buildTestQuestions(pool,120).map(item => item.id)).size,2);
process.stdout.write('Passed: study pack isolation, validation, immutable assigned questions, flashcard overrides, and practice selection.\n');
