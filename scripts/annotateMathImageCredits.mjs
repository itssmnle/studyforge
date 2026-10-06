import fs from 'node:fs/promises';

const credits = {
  'CIRCLE_1.svg': 'Optimager; public domain',
  'Cartesian_coordinates_2D.svg': 'Gustavb; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)',
  'Corresponding_angles_with_parallel_line.svg': 'すじにくシチュー; [CC0](https://creativecommons.org/publicdomain/zero/1.0/)',
  'Equal_products_in_a_proportion.svg': 'Arthur Baelde; [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)',
  'Hexagon_reflections.svg': 'Krishnavedala; public domain',
  'Linear_Function_Graph.svg': 'Jim.belk; public domain',
  'PieChartFraction_threeFourths_oneFourth-colored_differently.svg': 'canuoislupusarctos, based on Ezra Katz; [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/)',
  'Simple_bar_chart.svg': 'Masur; public domain',
  'Values_of_digits_in_the_Decimal_numeral_system.svg': 'User000name; [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)',
  'VennDiagramThreeSetsGeneral.svg': 'Mobius assumed; [CC0](https://creativecommons.org/publicdomain/zero/1.0/)',
};
const root = new URL('../content/math-lessons/', import.meta.url);
let updated = 0;
for (const year of ['year-7', 'year-8', 'year-9']) {
  const dir = new URL(`${year}/`, root);
  for (const name of (await fs.readdir(dir)).filter(name => /^\d{3}-.*\.md$/.test(name))) {
    const file = new URL(name, dir);
    const source = await fs.readFile(file, 'utf8');
    const result = source.replace(/(!\[[^\]]*\]\(\/maths-images\/([^)]*)\)\s*\n\s*)\[Image source: Wikimedia Commons\]\((https:\/\/commons\.wikimedia\.org\/wiki\/File:[^)]+)\)/g,
      (_, image, asset, url) => {
        if (!credits[asset]) throw new Error(`Unknown credit for ${asset}`);
        return `${image}Image: ${credits[asset]}; [source file](${url}).`;
      });
    if (result !== source) {
      await fs.writeFile(file, result);
      updated += 1;
    }
  }
}
console.log(`Added explicit attribution to ${updated} maths lessons.`);
