# Todoist Sections Integration

## Overview
The whiteboard scanner now automatically maps grocery items to existing Todoist sections (subcategories) within your projects. This allows for better organization of shopping lists and other categorized tasks.

## How It Works

### 1. Gemini AI Classification
When you upload an image that contains groceries or shopping items, the Gemini AI automatically classifies each item into one of these sections:

- **Produce** - Fruits and vegetables
- **Dairy** - Milk, cheese, yogurt, eggs
- **Meat & Seafood** - Beef, chicken, fish
- **Bakery** - Bread, pastries, baked goods
- **Frozen** - Frozen meals, ice cream
- **Pantry** - Canned goods, pasta, rice, spices
- **Snacks** - Chips, cookies, candy
- **Beverages** - Juice, soda, coffee, tea
- **Health & Beauty** - Toiletries, vitamins
- **Household** - Cleaning supplies, paper products

### 2. Section Matching
The system automatically:
1. Fetches all existing sections from your selected Todoist project
2. Matches the AI-classified section names to your existing Todoist sections (case-insensitive)
3. Assigns the correct `section_id` when creating tasks

### 3. Existing Sections Only
**Important**: The system uses only your existing Todoist sections. If Gemini classifies an item into a section that doesn't exist in your project, the task will be created without a section assignment.

To use this feature effectively:
1. Create sections in your Todoist project that match the categories above
2. Upload your whiteboard image
3. Tasks will automatically be organized into the matching sections

### 4. Visual Feedback
In the task review interface, grocery items show a purple badge indicating their assigned section. This helps you verify the classification before sending tasks to Todoist.

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
      "content": "Apples",
      "section": "Produce"
    },
    {
      "content": "Milk",
      "section": "Dairy"
    }
  ]
}
```

The endpoint automatically:
- Fetches existing sections for the project
- Maps section names to section IDs
- Creates tasks with the appropriate `section_id`

## Example Workflow

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

## Non-Grocery Items
For regular tasks or non-grocery items, the system doesn't apply section classification. Tasks are created in the project without section assignments, just as before.
