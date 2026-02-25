# TODO - Update Animal Files Logic

- [x] Update API route (`app/api/admin/animals/route.ts`) to handle multiple files
  - [x] POST: Accept multiple files and store as comma-separated paths
  - [x] PUT: Handle appending new files, removing individual files, clearing all
- [x] Update frontend (`app/dashanimais/page.tsx`)
  - [x] Create form: Allow multiple file selection
  - [x] Edit form: Allow multiple file selection and display existing files
  - [x] View modal: Display all files as a list with download links
  - [x] Add ability to remove individual files
