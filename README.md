# AI Agent Management Platform

[Previous content remains exactly the same until the Database Management section, where we modify the instructions...]

### Database Management

The platform uses IndexedDB for data persistence. There are two ways to inspect and manage the database:

#### 1. Built-in Database Browser

A simple web-based IndexedDB browser is included in the project:
1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:5175/tools/db-browser.html` in your browser
3. Select a store (Agents, Tools, Workflows, or Model Configurations)
4. Click "Refresh Data" to view the current contents
5. The data is displayed in a formatted JSON view

Note: The database browser must be accessed through the development server (not directly as a file) to ensure proper IndexedDB access.

[Rest of the README content remains exactly the same...]
