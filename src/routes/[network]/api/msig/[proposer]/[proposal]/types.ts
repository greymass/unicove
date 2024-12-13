import { z } from 'zod';
import { Types } from '$lib/wharf/contracts/msig';
import { Name } from '@wharfkit/antelope';

export const msigResponseSchema = z.object({
	ts: z.date(),
	proposer: z.string(),
	name: z.string(),
	producers: z.array(z.instanceof(Name)),
	proposal: z.instanceof(Types.proposal).optional(),
	approvals: z.instanceof(Types.approvals_info).optional(),
	error: z.string().optional()
});

export type MsigApiResponse = z.infer<typeof msigResponseSchema>;
