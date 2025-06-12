import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { files } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/files/[id] - Get a specific file
export async function GET({ params }) {
	try {
		const fileId = params.id;
		const file = await db.select().from(files).where(eq(files.id, fileId)).limit(1);
		
		if (!file || file.length === 0) {
			return json({ error: 'File not found' }, { status: 404 });
		}

		// Convert the file content to a Blob
		const fileContent = file[0].content;
		
		// Return the file as a binary response
		return new Response(fileContent, {
			headers: {
				'Content-Type': file[0].contentType,
				'Content-Disposition': `attachment; filename="${file[0].filename}"`
			}
		});
	} catch (error) {
		console.error('Failed to fetch file:', error);
		return json({ error: 'Failed to fetch file' }, { status: 500 });
	}
}

// DELETE /api/files/[id] - Delete a file
export async function DELETE({ params }) {
	try {
		const fileId = params.id;
		await db.delete(files).where(eq(files.id, fileId));
		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete file:', error);
		return json({ error: 'Failed to delete file' }, { status: 500 });
	}
}