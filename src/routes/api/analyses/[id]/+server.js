import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { analyses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/analyses/[id] - Get a specific analysis
export async function GET({ params }) {
	try {
		const analysisId = params.id;
		const analysis = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
		
		if (!analysis || analysis.length === 0) {
			return json({ error: 'Analysis not found' }, { status: 404 });
		}

		return json(analysis[0]);
	} catch (error) {
		console.error('Failed to fetch analysis:', error);
		return json({ error: 'Failed to fetch analysis' }, { status: 500 });
	}
}

// PATCH /api/analyses/[id] - Update an analysis (e.g., to mark as completed)
export async function PATCH({ params, request }) {
	try {
		const analysisId = params.id;
		const data = await request.json();
		
		// Update analysis
		await db.update(analyses)
			.set({
				status: data.status || undefined,
				result: data.result || undefined,
				completedAt: data.status === 'completed' ? new Date().getTime() : undefined
			})
			.where(eq(analyses.id, analysisId));
		
		const updatedAnalysis = await db.select().from(analyses).where(eq(analyses.id, analysisId)).limit(1);
		
		return json(updatedAnalysis[0]);
	} catch (error) {
		console.error('Failed to update analysis:', error);
		return json({ error: 'Failed to update analysis' }, { status: 500 });
	}
}

// DELETE /api/analyses/[id] - Delete an analysis
export async function DELETE({ params }) {
	try {
		const analysisId = params.id;
		await db.delete(analyses).where(eq(analyses.id, analysisId));
		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete analysis:', error);
		return json({ error: 'Failed to delete analysis' }, { status: 500 });
	}
}