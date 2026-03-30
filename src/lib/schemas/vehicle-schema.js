import { z } from "zod";

/**
 * Vehicle Details Schema
 * Validates vehicle information
 */
export const vehicleSchema = z.object({
  id: z.union([
    z.number(),
    z.string().transform((val) => val === "" ? null : Number(val))
  ]).nullable().optional(),
  vehicle_no: z.string().min(1, "Vehicle number is required"),
  type: z.string().min(1, "Vehicle type is required"),
});

/**
 * Add Vehicle Schema
 * Used when adding new vehicles
 */
export const addVehicleSchema = vehicleSchema.omit({ id: true });

/**
 * Edit Vehicle Schema
 * Used when editing existing vehicles
 */
export const editVehicleSchema = vehicleSchema; 