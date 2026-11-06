export type GalaAttendeeCategory = "dekut_student" | "alumni" | "staff";
export type GalaTicketPackage = "single" | "couple" | "group5";

export interface GalaTicketPricing {
  label: string;
  attendeeCount: number;
  totalKsh: number;
}

export function getGalaTicketPricing(
  category: GalaAttendeeCategory,
  ticketPackage: GalaTicketPackage,
): GalaTicketPricing | null {
  if (category === "dekut_student") {
    if (ticketPackage === "single") return { label: "Student single", attendeeCount: 1, totalKsh: 800 };
    if (ticketPackage === "couple") return { label: "Student couple", attendeeCount: 2, totalKsh: 1500 };
    return { label: "Student group of 5", attendeeCount: 5, totalKsh: 3700 };
  }
  if (ticketPackage !== "single") return null;
  if (category === "alumni") return { label: "Alumni single", attendeeCount: 1, totalKsh: 1000 };
  if (category === "staff") return { label: "Staff single", attendeeCount: 1, totalKsh: 1500 };
  return null;
}
