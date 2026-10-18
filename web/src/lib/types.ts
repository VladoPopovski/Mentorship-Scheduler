export type Slot = {
  id: string;
  starts_at: string;
  duration_min: number;
  status: "open" | "booked";
  created_at: string;
};