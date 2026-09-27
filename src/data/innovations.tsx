import {
  AwardIcon,
  CogIcon,
  CpuIcon,
  ShieldCheckIcon,
  ZapIcon,
} from "@/components/Icons";

export type PostCategory =
  | "Project Write-Up"
  | "Hackathon Recap"
  | "Lab Work"
  | "Exhibition"
  | "Competition";

export interface InnovationPost {
  slug: string;
  title: string;
  category: PostCategory;
  badge: string;
  date: string; // ISO date string YYYY-MM-DD
  author: string;
  authorRole: string;
  summary: string;
  body: string;
  highlights: string[];
  department: string;
  icon: React.ComponentType<{ className?: string }>;
  featured?: boolean;
}

/**
 * Innovation posts — newest first.
 * Each entry preserves the original static content but now carries a
 * publication date so the feed benefits from freshness signals.
 *
 * To add a new post, insert at the TOP of this array.
 */
export const innovationPosts: InnovationPost[] = [
  {
    slug: "dekut-engineering-week-2025",
    title: "Annual DeKUT Engineering Week & Project Fair",
    category: "Exhibition",
    badge: "Annual Expo",
    date: "2025-09-12",
    author: "Technical Projects Lead",
    authorRole: "DESA Executive Council",
    summary:
      "The premier student engineering exhibition at DeKUT. Every year, DESA members showcase working hardware prototypes, automated rigs, capstone innovations, and mechanical assemblies to peers, faculty, and industry visitors.",
    body: "Engineering Week is the flagship annual event of the Dedan Kimathi University Engineering Students Association. Held every September on the DeKUT Main Campus, the fair brings together student teams from across all five engineering departments to present working hardware demos, defend design decisions before an industry judge panel, and compete for innovation awards. Past editions have featured automated greenhouse controllers, CNC router builds, and electric mobility prototypes — all designed, fabricated, and tested entirely by student teams. Industry partners from Kenya's manufacturing and energy sectors attend to scout talent and offer internship placements.",
    highlights: [
      "Inter-departmental student innovation competition",
      "Hands-on hardware demonstrations and prototype testing",
      "Industry judge panel feedback and student awards",
      "Networking with prospective employers and engineering firms",
    ],
    department: "All Departments",
    icon: AwardIcon,
    featured: true,
  },
  {
    slug: "electric-go-kart-challenge",
    title: "Student Electric Mobility & Go-Kart Challenge",
    category: "Project Write-Up",
    badge: "Student Hardware",
    date: "2025-06-20",
    author: "Mechanical Engineering Chapter",
    authorRole: "Department of Mechanical Engineering",
    summary:
      "A student-led electric mobility project designed and assembled by multidisciplinary DESA teams. Built around a lightweight tubular space-frame chassis with a custom battery management system.",
    body: "The electric go-kart project started as a senior capstone idea and grew into a full cross-departmental effort. Mechatronic students handled the motor controller firmware, mechanical students designed the space-frame in SolidWorks and welded the chassis, and electrical students built the battery management system around a 48V lithium-ion pack with regenerative braking. The kart was unveiled at the 2025 Engineering Week and completed several demonstration laps on the DeKUT access road. The team documented the entire build process for future cohorts to iterate on.",
    highlights: [
      "Tubular steel space-frame designed in CAD by student teams",
      "Regenerative braking telemetry and lithium battery pack",
      "Hands-on welding, machining, and electronic motor control",
      "Showcased during university tech symposiums and project fairs",
    ],
    department: "Mechanical & Mechatronic Engineering",
    icon: CogIcon,
  },
  {
    slug: "iot-smart-irrigation-prototype",
    title: "IoT Smart Irrigation & Agri-Tech Prototypes",
    category: "Lab Work",
    badge: "Agri-Tech Initiative",
    date: "2025-04-08",
    author: "Mechatronic Engineering Chapter",
    authorRole: "Department of Mechatronic Engineering",
    summary:
      "Student-built agricultural telemetry prototypes addressing local farming challenges in Nyeri and Central Kenya. Utilizes microcontroller units, soil sensors, and solar powering.",
    body: "Working with smallholder farmers near the DeKUT campus, a student team developed a solar-powered soil monitoring station that wirelessly reports moisture levels, ambient temperature, and pH readings to a simple web dashboard. When soil moisture drops below a configurable threshold, the system actuates a low-cost micro-valve to drip-irrigate the plot. Built entirely with ESP32 microcontrollers, capacitive soil sensors, and open-source firmware, the prototype costs under KES 8,000 in components. The project was presented at the 2025 DeKUT Innovation Symposium and is now in its second iteration with improved enclosure weatherproofing.",
    highlights: [
      "Solar-powered remote soil moisture and temperature sensing",
      "Automated micro-valve actuation based on moisture thresholds",
      "Low-cost embedded hardware built with open-source tools",
      "Interdisciplinary collaboration between mechatronics and civil students",
    ],
    department: "Mechatronic Engineering",
    icon: CpuIcon,
  },
  {
    slug: "3d-printed-prosthetic-hand",
    title: "Assistive Robotics & 3D-Printed Prosthetics",
    category: "Project Write-Up",
    badge: "Social Impact Project",
    date: "2025-02-14",
    author: "Biomedical Research Group",
    authorRole: "Department of Mechatronic Engineering",
    summary:
      "Student research project developing accessible myoelectric prosthetic hand models using electromyographic (EMG) muscle sensor inputs and custom 3D-printed articulated fingers.",
    body: "The assistive robotics team set out to build a functional prosthetic hand that a student team could manufacture on campus at minimal cost. Using FDM 3D printing for the socket, palm, and finger phalanges, the team designed a tendon-driven actuation system controlled by two surface EMG electrodes placed on the user's forearm. Signal processing runs on an Arduino Nano, translating muscle contractions into grip patterns. The total component cost is under KES 12,000 — a fraction of commercial alternatives. The prototype was presented at the 2025 National Student Engineering Conference in Nairobi, where it received the social impact runner-up award.",
    highlights: [
      "Custom 3D-printed socket and mechanical tendon linkages",
      "EMG signal processing through microcontrollers",
      "Accessible assistive design built at low student cost",
      "Presented at national student engineering conferences",
    ],
    department: "Mechatronic Engineering",
    icon: ShieldCheckIcon,
  },
  {
    slug: "desa-hardware-hackathon-2024",
    title: "DESA Hardware Hackathons & Prototyping Sprints",
    category: "Hackathon Recap",
    badge: "Hackathon Series",
    date: "2024-11-02",
    author: "Technical Projects Committee",
    authorRole: "DESA Executive Council",
    summary:
      "Intensive 48-hour student innovation sprints organized by the Technical Projects Committee. Student teams team up across years to build working solutions for energy, transport, and community problems.",
    body: "DESA's hackathon series runs twice per academic year — once in the first semester and once just before Engineering Week. Each sprint follows a theme (past themes: \"Sustainable Energy for Nyeri,\" \"Smart Campus Infrastructure,\" \"Low-Cost Medical Devices\"). Teams of 3–5 students from mixed year groups get 48 hours, a shared bench in the mechatronics lab, and a KES 3,000 component budget to build a working hardware prototype. Senior students serve as mentors rather than competitors. The best projects get fast-tracked to the Engineering Week project fair, and winning teams receive letters of recommendation from the Faculty Patron for internship applications.",
    highlights: [
      "Cross-year teams mixing first-year freshers with final-year mentors",
      "Rapid prototyping with microcontrollers, sensors, and basic tools",
      "Pitch coaching and technical mentoring by senior student leaders",
      "Direct pathway for project incubation and capstone preparation",
    ],
    department: "All Departments",
    icon: ZapIcon,
  },
];
