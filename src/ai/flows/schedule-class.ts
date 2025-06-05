'use server';

/**
 * @fileOverview AI-powered class scheduling assistant.
 *
 * - scheduleClass - A function that schedules a class using AI to find the best time.
 * - ScheduleClassInput - The input type for the scheduleClass function.
 * - ScheduleClassOutput - The return type for the scheduleClass function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleClassInputSchema = z.object({
  instructorAvailability: z
    .string()
    .describe(
      'The availability of the instructor, as a string. Must include specific days and times.'
    ),
  classroomAvailability: z
    .string()
    .describe(
      'The availability of the classroom, as a string. Must include specific days and times.'
    ),
  classDuration: z
    .string()
    .describe(
      'The duration of the class. E.g., 1 hour, 1.5 hours, 2 hours'
    ),
  existingSchedule: z
    .string()
    .describe(
      'The existing schedule for all classes, as a string.  Include class name, instructor, time, and classroom.'
    ),
  className: z.string().describe('The name of the class to be scheduled.'),
});
export type ScheduleClassInput = z.infer<typeof ScheduleClassInputSchema>;

const ScheduleClassOutputSchema = z.object({
  scheduledTime: z
    .string()
    .describe('The optimal time to schedule the class, considering instructor and classroom availability, and minimizing conflicts with the existing schedule.'),
  classroom: z.string().describe('The classroom assigned to the class.'),
  reasoning: z
    .string()
    .describe(
      'The AI reasoning for its decision, outlining constraints and trade-offs made.'
    ),
});
export type ScheduleClassOutput = z.infer<typeof ScheduleClassOutputSchema>;

export async function scheduleClass(input: ScheduleClassInput): Promise<ScheduleClassOutput> {
  return scheduleClassFlow(input);
}

const scheduleClassPrompt = ai.definePrompt({
  name: 'scheduleClassPrompt',
  input: {schema: ScheduleClassInputSchema},
  output: {schema: ScheduleClassOutputSchema},
  prompt: `You are an AI assistant that schedules classes, minimizing conflicts and optimizing resource allocation.

  Given the following information, determine the optimal time to schedule the class.

  Instructor Availability: {{{instructorAvailability}}}
  Classroom Availability: {{{classroomAvailability}}}
  Class Duration: {{{classDuration}}}
  Existing Schedule: {{{existingSchedule}}}
  Class Name: {{{className}}}

  Consider all constraints and trade-offs, and provide reasoning for your decision.
  Return the time and classroom in a string, and the reasoning.
  `,
});

const scheduleClassFlow = ai.defineFlow(
  {
    name: 'scheduleClassFlow',
    inputSchema: ScheduleClassInputSchema,
    outputSchema: ScheduleClassOutputSchema,
  },
  async input => {
    const {output} = await scheduleClassPrompt(input);
    return output!;
  }
);
