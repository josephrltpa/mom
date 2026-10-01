export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  location?: string;
  contact_number?: string;
  email?: string;
  notes?: string;
  is_active: boolean;
}
