export const engineeringPrograms = [
  "BSc Electrical and Electronic Engineering",
  "BSc Telecommunication and Information Engineering",
  "BSc Mechatronic Engineering",
  "BSc Mechanical Engineering",
  "BSc Chemical Engineering",
  "BSc Civil Engineering",
  "BED Electrical and Electronic Engineering",
  "BED Mechanical Engineering",
  "BED Civil Engineering",
] as const;

export type EngineeringProgram = (typeof engineeringPrograms)[number];
