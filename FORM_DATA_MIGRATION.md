# Form Data Migration Guide

This document provides instructions for migrating to the enhanced single table approach for form submissions.

## Overview

We've implemented an enhanced single table approach for storing form submissions. This approach:

1. Uses a single `form_submissions` table for all form types
2. Stores common fields (name, email, etc.) as regular columns
3. Stores form-specific fields in a JSONB column called `form_data`
4. Adds indexes for better performance

## PostgreSQL Benefits

Since Supabase uses PostgreSQL, we can leverage several powerful features:

1. **JSONB Data Type**: Unlike regular JSON, JSONB is stored in a binary format that makes querying and indexing more efficient.

2. **JSON Operators**: PostgreSQL provides operators like `->` and `->>` for extracting values from JSON fields:

   ```sql
   -- Get all submissions where recommendation is 'yes'
   SELECT * FROM form_submissions
   WHERE form_data->>'recommendation' = 'yes';
   ```

3. **GIN Indexing**: We can create GIN (Generalized Inverted Index) indexes on JSONB columns for faster queries:

   ```sql
   -- Create an index on the form_data column
   CREATE INDEX idx_form_data ON form_submissions USING GIN (form_data);
   ```

4. **JSON Functions**: PostgreSQL offers functions like `jsonb_set()` to modify JSON data without replacing the entire object.

## Migration Steps

### 1. Update Database Schema

First, you need to update the database schema to add the `form_data` column and create indexes:

```sql
-- Add form_data column if it doesn't exist
ALTER TABLE form_submissions ADD COLUMN IF NOT EXISTS form_data JSONB DEFAULT '{}'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_type ON form_submissions (form_type);
CREATE INDEX IF NOT EXISTS idx_form_submissions_created_at ON form_submissions (created_at);

-- Optional: Add a GIN index on form_data for faster JSON queries
CREATE INDEX IF NOT EXISTS idx_form_submissions_form_data ON form_submissions USING GIN (form_data);
```

You can run these commands directly in the Supabase SQL editor, or use the API endpoint:

```
GET /api/db-migration
```

### 2. Migrate Existing Data

After updating the schema, you need to migrate existing data to the new structure:

```
GET /api/migrate-form-data
```

This API will:

1. Fetch all existing submissions
2. Create a `form_data` object for each submission
3. Move form-specific fields (recommendation, income, frontend_interest) to the `form_data` object
4. Update each record with the new structure

### 3. Verify Migration

After migration, verify that:

1. The admin dashboard shows all forms and submissions correctly
2. Form-specific fields are displayed in the submissions table
3. New form submissions are saved with the new structure

## New Form Structure

### Common Fields (Regular Columns)

- `id`: UUID primary key
- `first_name`: User's first name
- `email`: User's email address
- `whatsapp`: User's WhatsApp number
- `preference`: User's preferred contact method
- `occupation`: User's occupation
- `form_type`: Type of form (e.g., "formx1", "formx4")
- `created_at`: Timestamp when the submission was created

### Form-Specific Fields (in `form_data` JSONB)

#### For formx1 (Student Form)

- `recommendation`: Whether the user would recommend Codekaro

#### For formx4 (Professional Form)

- `income`: User's income range
- `frontend_interest`: Whether the user is interested in Frontend Intensive

## Advanced PostgreSQL Queries

With our new structure, you can perform powerful queries directly in PostgreSQL:

```sql
-- Count submissions by form type
SELECT form_type, COUNT(*)
FROM form_submissions
GROUP BY form_type;

-- Find all students who recommend Codekaro
SELECT * FROM form_submissions
WHERE occupation = 'student' AND form_data->>'recommendation' = 'yes';

-- Find professionals interested in frontend with income > 30k
SELECT * FROM form_submissions
WHERE occupation IN ('working-professional', 'college-passout')
AND form_data->>'frontend_interest' = 'yes'
AND form_data->>'income' IN ('30-50k', '50k-1lakh');
```

## Adding New Form Types

When adding a new form type:

1. Add the form-specific fields to the `form_data` object in the `submitForm` function
2. Update the `getTableHeaders` function in the admin dashboard to include the new form-specific fields
3. No need to modify the database schema

## Troubleshooting

If you encounter issues:

1. Check the browser console for errors
2. Verify that the `form_data` column exists in the `form_submissions` table
3. Check that the indexes were created successfully
4. Ensure that the Supabase credentials are correctly set in the environment variables
