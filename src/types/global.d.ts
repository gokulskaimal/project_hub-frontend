interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  razorpay_subscription_id?: string;
}

interface RazorpayOptions {
  key: string | undefined;
  amount?: number;
  currency?: string;
  order_id?: string;
  name: string;
  description: string;
  handler: (response: RazorpayResponse) => void | Promise<void>;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  subscription_id?: string;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => {
    open: () => void;
    on: (event: string, handler: (response: unknown) => void) => void;
  };
}
