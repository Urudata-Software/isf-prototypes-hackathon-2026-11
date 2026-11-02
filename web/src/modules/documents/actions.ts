'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { actionClient, fromFormData } from '@/lib/safe-action';
import { createDocumentSchema } from './schemas';
import { createDocument, updateDocument, deleteDocument, summarizeDocument } from './server';

const documentInput = fromFormData(createDocumentSchema);

export const createDocumentAction = actionClient
	.metadata({ errorKey: 'documents.form.failedToCreate' })
	.inputSchema(documentInput)
	.stateAction(async ({ parsedInput }) => {
		await createDocument(parsedInput);

		revalidatePath('/documents');
		redirect('/documents');
	});

export const updateDocumentAction = actionClient
	.metadata({ errorKey: 'documents.form.failedToUpdate' })
	.inputSchema(documentInput)
	.bindArgsSchemas([z.string()])
	.stateAction(async ({ parsedInput, bindArgsParsedInputs: [id] }) => {
		await updateDocument(id, parsedInput);

		revalidatePath('/documents');
		redirect('/documents');
	});

export type DocumentFormAction = typeof createDocumentAction;

export async function deleteDocumentAction(id: string): Promise<void> {
	await deleteDocument(id);
	revalidatePath('/documents');
}

export async function summarizeDocumentAction(id: string): Promise<void> {
	await summarizeDocument(id);
	revalidatePath(`/documents/${id}`);
}

