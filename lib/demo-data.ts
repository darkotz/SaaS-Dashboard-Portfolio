export type Role = "admin" | "user";

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  role: Role;
  company: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
  company: string;
  status: "active" | "trial" | "at_risk" | "churned";
  seats: number;
  mrr: number;
  created_at: string;
};

export const demoProfile: Profile = {
  id: "demo-admin",
  full_name: "Nikita Sosnovshchen",
  email: "portfolio@example.com",
  role: "admin",
  company: "AtlasOps"
};

export const demoCustomers: Customer[] = [
  {
    id: "cus_001",
    name: "Maya Lind",
    email: "maya@northstar.io",
    company: "Northstar Labs",
    status: "active",
    seats: 28,
    mrr: 4200,
    created_at: "2026-05-14"
  },
  {
    id: "cus_002",
    name: "Jonas Berg",
    email: "jonas@greenline.co",
    company: "Greenline",
    status: "trial",
    seats: 9,
    mrr: 980,
    created_at: "2026-05-21"
  },
  {
    id: "cus_003",
    name: "Amira Cole",
    email: "amira@lumos.dev",
    company: "Lumos Cloud",
    status: "active",
    seats: 44,
    mrr: 7600,
    created_at: "2026-04-29"
  },
  {
    id: "cus_004",
    name: "Theo Carter",
    email: "theo@shipyard.app",
    company: "Shipyard",
    status: "at_risk",
    seats: 14,
    mrr: 1800,
    created_at: "2026-03-18"
  }
];

export const revenueSeries = [
  { month: "Jan", revenue: 18400, churn: 3.2 },
  { month: "Feb", revenue: 21200, churn: 2.8 },
  { month: "Mar", revenue: 23700, churn: 2.4 },
  { month: "Apr", revenue: 27100, churn: 2.1 },
  { month: "May", revenue: 30400, churn: 1.8 },
  { month: "Jun", revenue: 33800, churn: 1.6 }
];

export const planUsage = [
  { name: "Starter", value: 42 },
  { name: "Growth", value: 35 },
  { name: "Scale", value: 23 }
];
