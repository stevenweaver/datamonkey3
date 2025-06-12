import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { files } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateUUID } from '$lib/utils/uuid';

// GET /api/files - Get all files
export async function GET() {
	try {
		const allFiles = await db.select().from(files);
		return json(allFiles.map(file => ({
			id: file.id,
			filename: file.filename,
			contentType: file.contentType,
			size: file.size,
			createdAt: file.createdAt
		})));
	} catch (error) {
		console.error('Failed to fetch files:', error);
		return json({ error: 'Failed to fetch files' }, { status: 500 });
	}
}

// POST /api/files - Upload a new file
export async function POST({ request }) {
	try {
		const formData = await request.formData();
		const uploadedFile = formData.get('file');
		
		if (!uploadedFile) {
			return json({ error: 'No file uploaded' }, { status: 400 });
		}

		const fileId = generateUUID();
		const fileContent = await uploadedFile.arrayBuffer();
		
		// Insert file record
		await db.insert(files).values({
			id: fileId,
			filename: uploadedFile.name,
			content: Buffer.from(fileContent),
			contentType: uploadedFile.type,
			size: uploadedFile.size,
			createdAt: new Date().getTime()
		});

		return json({ 
			id: fileId,
			filename: uploadedFile.name,
			size: uploadedFile.size
		}, { status: 201 });
	} catch (error) {
		console.error('Failed to upload file:', error);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
}