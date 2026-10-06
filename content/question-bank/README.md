# Practice question bank

Each curriculum topic has its own CSV file. Edit these files in Excel, Numbers,
Google Sheets, or a text editor. Keep the header row unchanged.

The folder name supplies `subject` and the filename supplies `topic`. Separate
multiple acceptable answers and specification tags with `|`. Leave option
columns blank except for multiple-choice questions.

Run `npm run questions:validate` before committing or publishing changes. Run
`npm run questions:publish` to upsert the CSV rows to Firestore. See the project
README for the guarded sync command that also removes obsolete CSV-managed rows.

