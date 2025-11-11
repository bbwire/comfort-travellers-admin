import { z } from 'zod'

// Validation schemas will be added here
// Example schemas for routes, trips, vehicles, etc.

export const routeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  origin: z.string().min(1, 'Origin is required'),
  destination: z.string().min(1, 'Destination is required'),
  basePrice: z.number().positive('Base price must be positive'),
  stops: z.array(z.string()).optional(),
  isActive: z.boolean().default(true),
})

export type RouteInput = z.infer<typeof routeSchema>

