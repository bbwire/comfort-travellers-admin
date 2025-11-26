export type RouteInput = {
  name: string
  origin: string
  destination: string
  basePrice: number
  estimatedDurationMinutes: number
  stops?: string[]
  isActive: boolean
}

export type RouteValidationErrors = Partial<{
  name: string
  origin: string
  destination: string
  basePrice: string
  estimatedDurationMinutes: string
}>

export type RouteValidationResult =
  | { success: true; data: RouteInput }
  | { success: false; errors: RouteValidationErrors }

export const validateRouteInput = (input: RouteInput): RouteValidationResult => {
  const sanitized: RouteInput = {
    ...input,
    name: input.name.trim(),
    origin: input.origin.trim(),
    destination: input.destination.trim(),
    basePrice: Number(input.basePrice),
    estimatedDurationMinutes: Number(input.estimatedDurationMinutes),
    stops: (input.stops || [])
      .map((stop) => stop.trim())
      .filter((stop) => stop.length > 0),
    isActive: input.isActive,
  }

  const errors: RouteValidationErrors = {}

  if (!sanitized.name) {
    errors.name = 'Route name is required'
  }
  if (!sanitized.origin) {
    errors.origin = 'Origin is required'
  }
  if (!sanitized.destination) {
    errors.destination = 'Destination is required'
  }
  if (!sanitized.basePrice || sanitized.basePrice <= 0) {
    errors.basePrice = 'Base price must be positive'
  }
  if (!sanitized.estimatedDurationMinutes || sanitized.estimatedDurationMinutes <= 0) {
    errors.estimatedDurationMinutes = 'Duration must be positive'
  }

  if (Object.keys(errors).length) {
    return { success: false, errors }
  }

  return { success: true, data: sanitized }
}

export type TripInput = {
  title: string
  routeId: string
  vehicleId: string
  departureTime: string
  arrivalTime: string
  totalSeats: number
  seatsBooked: number
  availableSeats: number[]
  status: 'scheduled' | 'active' | 'completed' | 'cancelled'
  notes?: string
  vehicleNumber?: string
  driverName?: string
  conductorName?: string
  isActive?: boolean
}

export type TripValidationErrors = Partial<{
  title: string
  routeId: string
  vehicleId: string
  departureTime: string
  arrivalTime: string
  totalSeats: string
  seatsBooked: string
  availableSeats: string
}>

export type TripValidationResult =
  | { success: true; data: TripInput }
  | { success: false; errors: TripValidationErrors }

export const validateTripInput = (input: TripInput): TripValidationResult => {
  const sanitized: TripInput = {
    ...input,
    title: input.title.trim(),
    routeId: input.routeId.trim(),
    vehicleId: input.vehicleId.trim(),
    departureTime: input.departureTime,
    arrivalTime: input.arrivalTime,
    totalSeats: Number(input.totalSeats),
    seatsBooked: Number(input.seatsBooked),
    status: input.status,
    notes: input.notes?.trim() || '',
    availableSeats: Array.isArray(input.availableSeats)
      ? input.availableSeats
          .map((seat) => Number(seat))
          .filter((seat) => Number.isFinite(seat) && seat >= 0)
      : [],
    vehicleNumber: input.vehicleNumber?.trim() || '',
    driverName: input.driverName?.trim() || '',
    conductorName: input.conductorName?.trim() || '',
    isActive: input.isActive ?? true,
  }

  const errors: TripValidationErrors = {}

  if (!sanitized.title) errors.title = 'Trip title is required'
  if (!sanitized.routeId) errors.routeId = 'Route is required'
  if (!sanitized.vehicleId) errors.vehicleId = 'Vehicle ID is required'
  if (!sanitized.departureTime) errors.departureTime = 'Departure time is required'
  if (!sanitized.arrivalTime) errors.arrivalTime = 'Arrival time is required'
  if (!sanitized.totalSeats || sanitized.totalSeats <= 0) {
    errors.totalSeats = 'Seat capacity must be positive'
  }
  if (sanitized.seatsBooked < 0 || sanitized.seatsBooked > sanitized.totalSeats) {
    errors.seatsBooked = 'Booked seats must be between 0 and capacity'
  }

  const invalidSeat = sanitized.availableSeats?.some(
    (seat) => seat < 0 || seat > sanitized.totalSeats
  )
  if (invalidSeat) {
    errors.availableSeats = 'Available seats must be within seat capacity'
  }

  if (Object.keys(errors).length) {
    return { success: false, errors }
  }

  return { success: true, data: sanitized }
}

export type VehicleInput = {
  vehicleNumber: string
  status: 'online' | 'offline' | 'maintenance'
  crew: string[]
  notes?: string
  isActive: boolean
}

export type VehicleValidationErrors = Partial<{
  vehicleNumber: string
  status: string
  crew: string
}>

export type VehicleValidationResult =
  | { success: true; data: VehicleInput }
  | { success: false; errors: VehicleValidationErrors }

export const validateVehicleInput = (input: VehicleInput): VehicleValidationResult => {
  const sanitized: VehicleInput = {
    vehicleNumber: input.vehicleNumber.trim(),
    status: input.status,
    crew: (input.crew || []).map((member) => member.trim()).filter(Boolean),
    notes: input.notes?.trim() || '',
    isActive: input.isActive,
  }

  const errors: VehicleValidationErrors = {}

  if (!sanitized.vehicleNumber) {
    errors.vehicleNumber = 'Vehicle number is required'
  }

  if (!['online', 'offline', 'maintenance'].includes(sanitized.status)) {
    errors.status = 'Status must be online, offline, or maintenance'
  }

  if (Object.keys(errors).length) {
    return { success: false, errors }
  }

  return { success: true, data: sanitized }
}

