/**
 * ScootyRide Type Definitions
 * Professional transportation marketplace types
 */

export type UserRole = 'customer' | 'rider' | 'admin';

export type RiderStatus = 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended';

export type RideStatus =
  | 'requested'
  | 'searching'
  | 'accepted'
  | 'rider_arriving'
  | 'rider_arrived'
  | 'otp_pending'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_rider'
  | 'cancelled_by_system';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'cash' | 'upi' | 'wallet';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface UserProfile {
  uid: string;
  role: UserRole;
  name: string;
  phone: string;
  email?: string;
  photoURL?: string;
  emergencyContact?: string;
  status: 'active' | 'suspended';
  createdAt: any; // Firestore Timestamp or string
}

export interface ScootyDetails {
  make: string;
  model: string;
  registrationNumber: string;
  color: string;
}

export interface RiderProfile extends UserProfile {
  scooty: ScootyDetails;
  verificationStatus: RiderStatus;
  documents: {
    drivingLicenseUrl?: string;
    vehicleRegistrationUrl?: string;
    insuranceUrl?: string;
    identityCardUrl?: string;
  };
  rating: number;
  totalRides: number;
  online: boolean;
  available: boolean;
  currentLocation?: LatLng;
  todayEarnings: number;
  todayRides: number;
}

export interface RideRequest {
  rideId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerPhoto?: string;
  customerRating?: number;
  
  riderId?: string;
  riderName?: string;
  riderPhone?: string;
  riderPhoto?: string;
  riderScooty?: ScootyDetails;
  riderRating?: number;

  status: RideStatus;
  
  pickup: {
    latitude: number;
    longitude: number;
    address: string;
  };
  
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };

  estimatedDistanceKm: number;
  actualDistanceKm?: number;
  estimatedDurationMinutes: number;
  actualDurationMinutes?: number;
  
  estimatedFare: number;
  finalFare?: number;
  
  otp: string;
  otpVerified: boolean;
  
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  
  requestedAt: any;
  acceptedAt?: any;
  arrivedAt?: any;
  startedAt?: any;
  completedAt?: any;
  cancelledAt?: any;
  cancelledBy?: 'customer' | 'rider' | 'system';
  cancelReason?: string;

  ratingByCustomer?: {
    stars: number;
    comment?: string;
    createdAt: any;
  };
  ratingByRider?: {
    stars: number;
    comment?: string;
    createdAt: any;
  };
}

export interface PaymentRecord {
  paymentId: string;
  rideId: string;
  customerId: string;
  customerName: string;
  riderId: string;
  riderName: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  platformCommission: number;
  riderEarnings: number;
  timestamp: any;
}

export interface FareSettings {
  baseFare: number;
  perKmRate: number;
  minimumFare: number;
  bookingFee: number;
  platformCommissionPercent: number; // e.g. 10 for 10%
  cancellationFee: number;
}

export interface ServiceArea {
  areaId: string;
  name: string;
  center: LatLng;
  operatingRadiusKm: number;
  active: boolean;
}

export interface SupportTicket {
  ticketId: string;
  userId: string;
  userRole: UserRole;
  userName: string;
  category: string;
  subject: string;
  description: string;
  status: TicketStatus;
  createdAt: any;
  replies: {
    replyId: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    message: string;
    timestamp: any;
  }[];
}

export interface SystemNotification {
  notificationId: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  timestamp: any;
  metadata?: any;
}

export interface AdminAuditLog {
  logId: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  timestamp: any;
  metadata?: any;
}
