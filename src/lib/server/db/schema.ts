import { sqliteTable, text, integer, blob } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	id: integer('id').primaryKey(),
	age: integer('age')
});

export const files = sqliteTable('files', {
	id: text('id').primaryKey(),
	filename: text('filename').notNull(),
	content: blob('content'), // For smaller files
	filePath: text('file_path'), // For larger files stored on filesystem
	contentType: text('content_type'),
	size: integer('size'),
	createdAt: integer('created_at', { mode: 'timestamp' }),
	userId: integer('user_id').references(() => user.id)
});

export const analyses = sqliteTable('analyses', {
	id: text('id').primaryKey(),
	fileId: text('file_id').references(() => files.id),
	method: text('method').notNull(),
	status: text('status').notNull(),
	result: text('result'), // JSON string of results
	createdAt: integer('created_at', { mode: 'timestamp' }),
	completedAt: integer('completed_at', { mode: 'timestamp' })
});
