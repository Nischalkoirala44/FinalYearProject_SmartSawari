export interface DocumentImage {
  selfie?: string[];
  license?: string[];
  citizenship?: string[];
  bluebook?: string[];
  vehicleImages?: string[];
}

export interface Vehicle {
  locationId: number;
  id: number;
  vehicleType: string;
  vehicleCondition: string;
  pricePerDay: number;
  documentImage: DocumentImage;
}

export interface VehicleResponse {
  success: boolean;
  vehicle: Vehicle;
}

export interface VehiclesResponse {
  success: boolean;
  vehicles: Vehicle[];
}
