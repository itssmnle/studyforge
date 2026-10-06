# Editable maths diagrams

Every image embedded in the Year 7 to Year 9 maths lessons is served from this folder. Replace an SVG here to update it on the site after the next build and Hosting deployment. Keep the filename unchanged, or update the Markdown image path in `src/content/math-lessons/`.

## Add a different image to a topic or part

1. Put an SVG, PNG, WebP, or JPG in this folder. Use a clear lowercase name such as `function-machine-input-output.svg`.
2. Open the relevant grouped note under `src/content/math-lessons/year-7`, `year-8`, or `year-9`, or open **Teacher → Notes** and choose the note.
3. Directly below the matching `### Part` heading, add this line:

   ```md
   ![A function machine turns an input into an output](/maths-images/function-machine-input-output.svg)
   ```

4. Save it, then deploy. The same Markdown line works in the teacher editor.

Keep images local using `/maths-images/...` instead of linking to another website. Give every image useful alt text that describes what a learner should notice.

StudyForge-original SVGs that can be freely edited: `Parabola2.svg`, `cuboid-net.svg`, `cuboid-space-diagonal.svg`, `enlargement-grid.svg`, `inverse-proportion-graph.svg`, `matchstick-squares.svg`, `prime-factors-venn.svg`, `right-triangle-trig.svg`, and `triangle-sss-construction.svg`.

The remaining SVGs were copied from Wikimedia Commons. Each lesson using one identifies the creator, license, and source file beside the image. Preserve those credits and license terms when modifying or redistributing these files. None of the lesson image embeds load from Wikimedia at runtime.
