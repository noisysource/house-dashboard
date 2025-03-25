
import { Appliance, IAppliance } from '../models/Appliance';

/**
 * Get all appliances
 */
export const getAllAppliances = async (): Promise<IAppliance[]> => {
    try {
        return await Appliance.find().populate('roomId');
    } catch (error) {
        console.error('Error fetching appliances:', error);
        throw error;
    }
};

/**
 * Get an appliance by ID
 */
export const getApplianceById = async (id: string): Promise<IAppliance | null> => {
    try {
        return await Appliance.findById(id).populate('roomId');
    } catch (error) {
        console.error(`Error fetching appliance with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Create a new appliance
 */
export const createAppliance = async (applianceData: Partial<IAppliance>): Promise<IAppliance> => {
    try {
        const appliance = new Appliance(applianceData);
        return await appliance.save();
    } catch (error) {
        console.error('Error creating appliance:', error);
        throw error;
    }
};

/**
 * Update an appliance
 */
export const updateAppliance = async (id: string, applianceData: Partial<IAppliance>): Promise<IAppliance | null> => {
    try {
        return await Appliance.findByIdAndUpdate(id, applianceData, { new: true });
    } catch (error) {
        console.error(`Error updating appliance with ID ${id}:`, error);
        throw error;
    }
};

/**
 * Delete an appliance
 */
export const deleteAppliance = async (id: string): Promise<boolean> => {
    try {
        const result = await Appliance.findByIdAndDelete(id);
        return !!result;
    } catch (error) {
        console.error(`Error deleting appliance with ID ${id}:`, error);
        throw error;
    }
};