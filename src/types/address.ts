export interface Address {
  _id?: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  landmark?: string;
  isDefault: boolean;
  addressType: 'home' | 'work' | 'other';
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string;
  instructions?: string;
  formattedAddress?: string;
  shortAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressFormProps {
  address?: Address;
  onSave: (addressData: Address) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}
