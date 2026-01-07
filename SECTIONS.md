# Todoist Sections Integration

## Overview
The whiteboard scanner automatically maps list items to existing Todoist sections (subcategories) within your projects. This allows for better organization of categorized tasks and lists.

## How It Works

### 1. Gemini AI Classification
When you upload an image containing a list, the Gemini AI automatically classifies each item into the most appropriate section based on the sections available in your Todoist project. The AI will analyze the content and match items to your existing sections.

### 2. Section Matching
The system automatically:
1. Fetches all existing sections from your selected Todoist project
2. Matches the AI-classified section names to your existing Todoist sections (case-insensitive)
3. Assigns the correct `section_id` when creating tasks

### 3. Existing Sections Only
**Important**: The system uses only your existing Todoist sections. If Gemini classifies an item into a section that doesn't exist in your project, the task will be created without a section assignment.

To use this feature effectively:
1. Create sections in your Todoist project that match your desired categories
2. Upload your whiteboard image
3. Tasks will automatically be organized into the matching sections

### 4. Visual Feedback
In the task review interface, items with assigned sections show a purple badge indicating their section. This helps you verify the classification before sending tasks to Todoist.

## API Endpoints

### GET /api/todoist/sections?projectId={id}
Fetches all sections for a given Todoist project.

**Response:**
```json
{
  "sections": [
    {
      "id": "section_id",
      "name": "Produce",
      "project_id": "project_id",
      "order": 1
    }
  ]
}
```

### POST /api/todoist/tasks
Creates tasks with optional section assignments.

**Request:**
```json
{
  "projectId": "project_id",
  "tasks": [
    {
      "content": "Task 1",
      "section": "Section A"
    },
    {
      "content": "Task 2",
      "section": "Section B"
    }
  ]
}
```

The endpoint automatically:
- Fetches existing sections for the project
- Maps section names to section IDs
- Creates tasks with the appropriate `section_id`

## Example Workflows

### Grocery List Example
1. **User creates sections in Todoist:**
   - Project: "Groceries"
   - Sections: "Produce", "Dairy", "Meat & Seafood", "Pantry"

2. **User uploads whiteboard image with:**
   ```
   - Apples
   - Bananas
   - Milk
   - Chicken breasts
   - Pasta
   ```

3. **Gemini classifies items:**
   - Apples → Produce
   - Bananas → Produce
   - Milk → Dairy
   - Chicken breasts → Meat & Seafood
   - Pasta → Pantry

4. **System creates tasks:**
   - "Apples" in Produce section
   - "Bananas" in Produce section
   - "Milk" in Dairy section
   - "Chicken breasts" in Meat & Seafood section
   - "Pasta" in Pantry section

### Project Tasks Example
1. **User creates sections in Todoist:**
   - Project: "Website Redesign"
   - Sections: "Design", "Frontend", "Backend", "Testing"

2. **User uploads whiteboard image with:**
   ```
   - Create wireframes
   - Update logo
   - Build navigation component
   - Setup API endpoints
   - Write unit tests
   ```

3. **Gemini classifies items:**
   - Create wireframes → Design
   - Update logo → Design
   - Build navigation component → Frontend
   - Setup API endpoints → Backend
   - Write unit tests → Testing

## Lists Without Sections
If your project doesn't have any sections defined, or for simple task lists, the system won't apply section classification. Tasks are created in the project without section assignments.
