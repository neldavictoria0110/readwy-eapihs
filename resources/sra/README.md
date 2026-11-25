SRA Reading Express is embedded in the `sra-express-document` JSON payload in the root `index.html`. `express.js` opens the complete original app in an iframe using `srcdoc`, preserving its styles, canvas controls, six color stations, 60 readings, 600 questions, progress storage, import/export, and certificate downloads. No additional HTML file is loaded.

The app markup lives in `v3/app.html`. It marks the location of the reading dataset with `/*__BOOKS__*/`; the 60-book dataset lives in `v3/books.js`, and `copy-index.cjs` injects it during every build. Do not remove the marker from `app.html` or the dataset from `books.js`, or the Reading Lab will fail with `BOOKS is not defined`. Run `node --test resources/sra/integration.test.cjs` after changing either file.

The only change inside the original document is relocation of scene URLs from `assets/hd/` to `resources/sra/express-assets/hd/`. All original assets and editable `anthology.json` are retained in `express-assets/`. The browser storage key remains `sra-reading-express-offline-v2`.

Open SRA from the main journey map and use the Journey map button to return. Progress remains local to the browser and origin. Existing progress from a different file location can be transferred using the SRA JSON import/export shortcuts (E/I).
