import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { analyses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { generateUUID } from '$lib/utils/uuid';

// GET /api/analyses - Get all analyses
export async function GET() {
	try {
		const allAnalyses = await db.select().from(analyses);
		return json(allAnalyses);
	} catch (error) {
		console.error('Failed to fetch analyses:', error);
		return json({ error: 'Failed to fetch analyses' }, { status: 500 });
	}
}

// POST /api/analyses - Create a new analysis
export async function POST({ request }) {
	try {
		const data = await request.json();
		
		if (!data.fileId || !data.method) {
			return json({ error: 'Missing required fields: fileId, method' }, { status: 400 });
		}

		const analysisId = generateUUID();
		
		// Insert analysis record
		await db.insert(analyses).values({
			id: analysisId,
			fileId: data.fileId,
			method: data.method,
			status: 'pending',
			createdAt: new Date().getTime()
		});

		return json({ 
			id: analysisId,
			fileId: data.fileId,
			method: data.method,
			status: 'pending'
		}, { status: 201 });
	} catch (error) {
		console.error('Failed to create analysis:', error);
		return json({ error: 'Failed to create analysis' }, { status: 500 });
	}
}