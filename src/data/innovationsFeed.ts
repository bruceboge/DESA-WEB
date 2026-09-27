export interface InnovationPost {
  id: string;
  slug: string;
  title: string;
  date: string; // e.g. "Sep 18, 2026"
  isoDate: string; // e.g. "2026-09-18"
  readTime: string; // e.g. "5 min read"
  category: "Hackathon Recap" | "Project Write-up" | "Lab Work & R&D" | "Prototyping Sprint";
  badge: string;
  team: string;
  department: string;
  summary: string;
  fullContent: string[];
  highlights: string[];
  tags: string[];
  metrics?: { label: string; value: string }[];
}

export const INNOVATION_POSTS: InnovationPost[] = [
  {
    id: "post-1",
    slug: "dekut-engineering-week-2026-recap",
    title: "DeKUT Engineering Week 2026: Working Hardware Prototypes & Inter-Departmental Expo",
    date: "September 18, 2026",
    isoDate: "2026-09-18",
    readTime: "5 min read",
    category: "Hackathon Recap",
    badge: "Flagship Expo",
    team: "DESA Technical Projects Committee & SOE Jury",
    department: "Inter-Departmental Exhibition",
    summary:
      "A comprehensive recap of the 2026 DeKUT Engineering Week where over 40 multidisciplinary student teams demonstrated working hardware prototypes, automated rigs, and capstone design solutions to faculty and industry judges.",
    fullContent: [
      "The 2026 DeKUT Engineering Week marked a landmark milestone for the student engineering community at Dedan Kimathi University of Technology. Coordinated directly by the DESA Technical Projects Committee under the patronage of the School of Engineering, the three-day exhibition transformed the university engineering complex into a hive of live mechanical demonstrations, microcontroller telemetry, and structural design displays.",
      "Over 40 multidisciplinary teams comprising undergraduate students from Mechatronics, Mechanical, Electrical, Civil, and Chemical Engineering presented functioning hardware rigs. Unlike typical academic paper presentations, every booth was required to operate a physical prototype or automated bench testing rig.",
      "Distinguished delegates from the Engineers Board of Kenya (EBK) and the Institution of Engineers of Kenya (IEK) attended as external adjudicators, reviewing student projects on structural safety, design originality, manufacturability, and societal impact across Kenyan industries.",
      "The top honor was awarded to a third-year mechatronic team that built an automated solar-assisted macadamia sorter utilizing computer vision and pneumatic rejection valves, achieving a 94% throughput sorting accuracy.",
    ],
    highlights: [
      "Over 40 working student prototypes exhibited across 5 disciplines",
      "Keynote address on graduate engineer licensing by EBK & IEK dignitaries",
      "Best Innovation Award presented to automated solar sorting team",
      "Direct technical internship interviews conducted on-site by engineering firms",
    ],
    tags: ["Hardware Expo", "Mechatronics", "Mechanical", "EBK Mentorship", "Student R&D"],
    metrics: [
      { label: "Prototypes Tested", value: "40+" },
      { label: "Student Participants", value: "180+" },
      { label: "Industry Judges", value: "12" },
      { label: "Cash Grants Awarded", value: "KSh 150K" },
    ],
  },
  {
    id: "post-2",
    slug: "electric-kart-chassis-bms-telemetry",
    title: "Student Electric Mobility Challenge: Space-Frame Chassis & BMS Telemetry Design",
    date: "August 24, 2026",
    isoDate: "2026-08-24",
    readTime: "7 min read",
    category: "Project Write-up",
    badge: "Hardware Build",
    team: "DESA Automotive & Mechatronics Working Group",
    department: "Mechanical & Mechatronic Engineering",
    summary:
      "Technical breakdown of our student-built electric kart prototype: CAD modeling of the tubular steel space-frame, lithium battery pack integration, and live telemetry logging over CAN bus.",
    fullContent: [
      "Urban micro-mobility and clean transport require localized engineering solutions tailored to African road topographies. The DESA Electric Mobility team set out to engineer a single-seat electric vehicle prototype from scratch, applying mechanical chassis stress analysis and embedded power electronics.",
      "The chassis was constructed using AISI 1018 seamless cold-drawn steel tubing, modeled and tested in SolidWorks Simulation and ANSYS to withstand 3G bump impacts and torsional cornering forces. All tube notching, TIG welding, and suspension geometry were performed in the university workshop by student teams.",
      "For the powertrain, the team configured a 48V, 30Ah LiFePO4 battery pack equipped with an active-balancing Battery Management System (BMS). A STM32 microcontroller continuously reads cell voltages, thermistor probes, and motor phase currents, broadcasting telemetry packets over CAN bus to an onboard digital dashboard.",
      "Track testing on the campus runway demonstrated 0–40 km/h acceleration in 4.2 seconds and regenerative braking efficiency returning up to 14% kinetic energy back into the cell pack.",
    ],
    highlights: [
      "Tubular steel space-frame validated with ANSYS torsional rigidity analysis",
      "48V 30Ah LiFePO4 pack with custom STM32 CAN-bus telemetry",
      "Regenerative braking algorithm capturing up to 14% kinetic recovery",
      "Full hands-on machining, TIG welding, and electrical wiring by students",
    ],
    tags: ["Electric Mobility", "Powertrain", "BMS", "CAD / FEA", "Telemetry"],
    metrics: [
      { label: "Top Speed", value: "48 km/h" },
      { label: "Pack Voltage", value: "48 V" },
      { label: "Curb Weight", value: "86 kg" },
      { label: "Range per Charge", value: "35 km" },
    ],
  },
  {
    id: "post-3",
    slug: "iot-smart-irrigation-central-kenya-farms",
    title: "IoT Smart Irrigation & Telemetry: Low-Cost Sensor Nodes for Central Kenya Farms",
    date: "July 15, 2026",
    isoDate: "2026-07-15",
    readTime: "6 min read",
    category: "Lab Work & R&D",
    badge: "Agri-Tech Field R&D",
    team: "DESA Embedded Systems & Agri-Tech Lab",
    department: "Mechatronic & Electrical Engineering",
    summary:
      "Field trial report on student-engineered solar-powered soil moisture telemetry nodes deployed in experimental tea and horticultural plots across Nyeri County.",
    fullContent: [
      "Smallholder agriculture in Central Kenya faces unpredictable rainfall cycles and rising irrigation costs. This joint initiative by DESA mechatronics and civil students developed modular, ultra-low-power telemetry nodes that autonomously regulate drip irrigation lines based on real-time soil volumetric water content.",
      "Each node incorporates corrosion-resistant capacitive soil moisture sensors, ambient temperature and humidity probes, and an ESP32 microcontroller with integrated SX1276 LoRa transceivers. Nodes transmit sensor telemetry every 15 minutes to a central farm gateway located over 3.2 kilometers away.",
      "A 5W monocrystalline solar panel and lithium iron phosphate cell power each field unit, running through deep-sleep power cycles to ensure uninterrupted operation during extended rainy and overcast periods.",
      "Over a four-month trial period, test beds exhibited a 38% reduction in water usage compared to standard timer-based irrigation, while maintaining optimal crop leaf turgidity.",
    ],
    highlights: [
      "Capacitive moisture sensors with automated solenoid valve triggering",
      "ESP32 LoRa transceiver array providing 3.2km line-of-sight telemetry",
      "Ultra-low power sleep states consuming under 18uA during standby",
      "Field-tested in local horticultural plots with 38% water savings",
    ],
    tags: ["IoT", "LoRaWAN", "Agri-Tech", "Solar Power", "Embedded Systems"],
    metrics: [
      { label: "Water Savings", value: "38%" },
      { label: "Transmission Range", value: "3.2 km" },
      { label: "Standby Current", value: "18 µA" },
      { label: "Trial Duration", value: "4 Months" },
    ],
  },
  {
    id: "post-4",
    slug: "myoelectric-3d-printed-prosthetic-arm",
    title: "Myoelectric 3D-Printed Prosthetic Arm: Accessible Biomechatronics Prototype",
    date: "June 02, 2026",
    isoDate: "2026-06-02",
    readTime: "5 min read",
    category: "Project Write-up",
    badge: "Biomechatronics",
    team: "Biomedical & Mechatronics Student Research Group",
    department: "Mechatronic Engineering",
    summary:
      "How a student team combined surface electromyography (sEMG) filters, additive manufacturing, and servo tendon drives to prototype an affordable upper-limb prosthetic hand.",
    fullContent: [
      "Commercial prosthetic hands frequently exceed the financial reach of low-income amputees across East Africa. The DESA Biomechatronics project aimed to develop a functional, locally repairable transradial myoelectric prosthesis using rapid 3D printing and open-source embedded electronics.",
      "Non-invasive surface EMG electrodes placed on the forearm capture micro-volt muscle impulses. An analog pre-amplifier and active bandpass filter circuit (10Hz–500Hz) condition the signal before analog-to-digital conversion on an Arduino Nano microcontroller.",
      "When the user contracts their flexor muscle group, the microcontroller interprets the envelope signal and actuates metal-gear micro servos, which pull high-tensile braided nylon tendons to close the five articulated fingers in an adaptive cylindrical grip.",
      "The total bill of materials was contained under KSh 14,000, presenting a replicable pathway for low-cost student assistive devices in Kenyan health clinics.",
    ],
    highlights: [
      "5-finger independent tendon actuation with nylon tensile cables",
      "Real-time surface EMG threshold detection using bandpass analog filters",
      "PETG-printed modular socket design reducing prototype cost by 85%",
      "Presented at the Regional Biomedical Engineering Student Symposium",
    ],
    tags: ["Biomechatronics", "3D Printing", "EMG Sensors", "Assistive Tech", "Arduino"],
    metrics: [
      { label: "Grip Force", value: "18 N" },
      { label: "Response Latency", value: "< 120 ms" },
      { label: "Total BOM Cost", value: "< KSh 14K" },
      { label: "Printed Weight", value: "340 g" },
    ],
  },
  {
    id: "post-5",
    slug: "desa-48-hour-green-energy-sprint",
    title: "DESA 48-Hour Green Energy Sprint: Solar Desalination & Micro-Hydro Test Rigs",
    date: "May 12, 2026",
    isoDate: "2026-05-12",
    readTime: "4 min read",
    category: "Prototyping Sprint",
    badge: "Hackathon Series",
    team: "DESA Technical Projects Committee",
    department: "Mechanical & Electrical Engineering",
    summary:
      "A weekend prototyping sprint uniting 60 student engineers to engineer practical renewable energy test rigs tackling water purification and micro-hydropower generation.",
    fullContent: [
      "Over an intensive 48-hour weekend sprint, 60 engineering students across all five university years camped in the engineering workshops for the 2026 DESA Green Energy Prototyping Sprint.",
      "Teams were challenged to design, construct, and validate functional renewable energy devices using salvaged workshop scrap, standardized 3D filaments, and basic instrumentation.",
      "Highlights included a multi-stage parabolic trough solar water distiller capable of producing 4.8 liters of potable water per day, and a scaled Pelton wheel micro-hydro generator tested in the university fluid mechanics flume.",
      "The sprint emphasized practical teamwork, rapid fabrication techniques, and cross-discipline peer learning between senior cohort mentors and freshmen members.",
    ],
    highlights: [
      "Parabolic solar collector producing 4.8L of purified distillate per day",
      "3D-printed Pelton wheel micro-hydro turbine tested in hydraulic lab flume",
      "Rapid fabrication utilizing campus Siemens Mechatronic Training Centre (SMTC)",
      "Mentorship from DeKUT Institute of Energy & Environmental Technology (IEET)",
    ],
    tags: ["Renewable Energy", "Solar Thermal", "Micro-Hydro", "Hackathon", "Fluid Mechanics"],
    metrics: [
      { label: "Teams Competed", value: "10 Teams" },
      { label: "Sprint Duration", value: "48 Hours" },
      { label: "Distillate Output", value: "4.8 L/day" },
      { label: "Freshman Mentored", value: "24 Students" },
    ],
  },
  {
    id: "post-6",
    slug: "structural-concrete-mix-agricultural-waste",
    title: "Structural Concrete Mix Optimization with Agricultural Waste: Civil Lab Findings",
    date: "April 08, 2026",
    isoDate: "2026-04-08",
    readTime: "6 min read",
    category: "Lab Work & R&D",
    badge: "Materials Testing",
    team: "Civil Engineering Student Laboratory Chapter",
    department: "Civil & Environmental Engineering",
    summary:
      "Experimental study investigating partial replacement of Portland cement with local coffee husk ash (CHA) and rice husk ash in non-structural concrete applications.",
    fullContent: [
      "Cement production is one of the highest contributors to industrial greenhouse gas emissions. In agricultural regions like Nyeri and Kirinyaga, coffee and rice processing mills generate substantial bio-waste husk byproducts.",
      "The DESA Civil Engineering student research group conducted a series of controlled compressive and tensile laboratory tests replacing 5%, 10%, 15%, and 20% of Ordinary Portland Cement (OPC) with calcined coffee husk ash.",
      "Using the heavy compression testing machine in the DeKUT Civil Engineering Materials Laboratory, students tested 100mm cube specimens at 7, 14, and 28 days of wet curing.",
      "Results showed that a 10% replacement ratio achieved a 28-day characteristic compressive strength of 24.5 MPa, meeting Kenyan building code requirements for residential masonry mortar and non-structural pavements while reducing raw cement consumption.",
    ],
    highlights: [
      "7-day and 28-day compressive strength testing in DeKUT Materials Lab",
      "Optimal 10% ash replacement achieving 24.5 MPa compressive strength",
      "Significant carbon footprint reduction and waste valorization for Mount Kenya region",
      "Submitted to the Annual Kenya National Students Concrete Competition",
    ],
    tags: ["Civil Engineering", "Concrete Technology", "Sustainable Materials", "Lab Testing"],
    metrics: [
      { label: "28-Day Strength", value: "24.5 MPa" },
      { label: "Cement Saved", value: "10%" },
      { label: "Test Cubes Cast", value: "48 Cubes" },
      { label: "Ash Source", value: "Local Coffee Mills" },
    ],
  },
];
