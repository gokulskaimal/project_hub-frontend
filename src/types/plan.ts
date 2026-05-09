export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  features: string[];
  type: "STARTER" | "PRO" | "ENTERPRISE";
  isActive: boolean;
  razorpayPlanId: string;
  interval?: "month" | "year";
  limits: {
    projects: number;
    members: number;
    storage?: number;
    messages?: number;
  };
  createdAt: string;
  updatedAt: string;
}
