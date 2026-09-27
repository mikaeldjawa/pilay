import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { SEED_ROLE_COUNSELOR } from "../src/lib/constants";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function main() {
  const counselorRole = await db.role.upsert({
    where: { name: SEED_ROLE_COUNSELOR },
    update: {},
    create: {
      name: SEED_ROLE_COUNSELOR,
      description: "Full access — MVP has a single counselor role.",
    },
  });

  const email = process.env.SEED_COUNSELOR_EMAIL;
  const password = process.env.SEED_COUNSELOR_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "SEED_COUNSELOR_EMAIL and SEED_COUNSELOR_PASSWORD must be set (see .env.example).",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await db.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      fullName: "Mikael Agung",
      roleId: counselorRole.id,
    },
  });

  console.log(`Seeded counselor account: ${email}`);

  const academicYear = await db.academicYear.upsert({
    where: { name: "2026-2027" },
    update: { isCurrent: true },
    create: {
      name: "2026-2027",
      startDate: new Date("2026-07-14"),
      endDate: new Date("2027-06-19"),
      isCurrent: true,
    },
  });

  const gradeLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const grades = await Promise.all(
    gradeLevels.map((level) =>
      db.grade.upsert({
        where: { name: `Year ${level}` },
        update: {},
        create: { name: `Year ${level}`, level },
      }),
    ),
  );

  // const classes  = ['']

  await Promise.all(
    grades.map(
      async (grade) => {
        if (grade.name == "Year 9") {
          const year9Exsist = await db.class.findMany({
            where: {
              gradeId: grade.id,
            },
          });

          console.log({ year9Exsist });

          if (year9Exsist.length != 0) {
            return;
          }

          return db.class.createMany({
            data: [
              {
                name: `${grade.name} Science`,
                academicYearId: academicYear.id,
                gradeId: grade.id,
              },
              {
                name: `${grade.name} Commerce`,
                academicYearId: academicYear.id,
                gradeId: grade.id,
              },
            ],
          });
        }

        return db.class.upsert({
          where: {
            name_academicYearId: {
              name: `${grade.name}`,
              academicYearId: academicYear.id,
            },
          },
          update: {},
          create: {
            name: `${grade.name}`,
            academicYearId: academicYear.id,
            gradeId: grade.id,
          },
        });
      },

      // db.class.delete({
      //   where: {
      //     name_academicYearId: {
      //       name: `${grade.name}`,
      //       academicYearId: academicYear.id,
      //     },
      //   },
      // }),
    ),
  );

  // const demoStudents = [
  //   {
  //     studentId: "S-2026-0001",
  //     firstName: "Amara",
  //     lastName: "Wicaksono",
  //     gradeIndex: 0,
  //   },
  //   {
  //     studentId: "S-2026-0002",
  //     firstName: "Bagas",
  //     lastName: "Prasetyo",
  //     gradeIndex: 1,
  //   },
  //   {
  //     studentId: "S-2026-0003",
  //     firstName: "Citra",
  //     lastName: "Hutagalung",
  //     gradeIndex: 2,
  //   },
  //   {
  //     studentId: "S-2026-0004",
  //     firstName: "Dewa",
  //     lastName: "Santoso",
  //     gradeIndex: 3,
  //   },
  //   {
  //     studentId: "S-2026-0005",
  //     firstName: "Elena",
  //     lastName: "Tampubolon",
  //     gradeIndex: 4,
  //   },
  // ];

  // for (const s of demoStudents) {
  //   const student = await db.student.upsert({
  //     where: { studentId: s.studentId },
  //     update: {},
  //     create: {
  //       studentId: s.studentId,
  //       firstName: s.firstName,
  //       lastName: s.lastName,
  //       status: "ACTIVE",
  //     },
  //   });

  //   const grade = grades[s.gradeIndex];
  //   const klass = classes[s.gradeIndex];

  //   const existingEnrollment = await db.studentEnrollment.findFirst({
  //     where: { studentId: student.id, endDate: null },
  //   });
  //   if (!existingEnrollment) {
  //     await db.studentEnrollment.create({
  //       data: {
  //         studentId: student.id,
  //         academicYearId: academicYear.id,
  //         classId: klass.id,
  //         gradeId: grade.id,
  //         startDate: academicYear.startDate,
  //         status: "ACTIVE",
  //       },
  //     });
  //   }
  // }

  // console.log(
  //   `Seeded ${demoStudents.length} seed students with current enrollments.`,
  // );

  const counselingCategories = [
    { code: "ACADEMIC", name: "Academic" },
    { code: "PERSONAL_SOCIAL", name: "Personal / Social" },
    { code: "BEHAVIORAL", name: "Behavioral" },
    { code: "CAREER", name: "Career" },
    { code: "CRISIS", name: "Crisis" },
  ];
  for (const c of counselingCategories) {
    await db.counselingCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  const incidentCategories = [
    {
      code: "PHYSICAL_AGGRESSION_FIGHTING",
      name: "Physical Aggression / Fighting",
      sortOrder: 1,
    },
    {
      code: "BULLYING_INTIMIDATION_THREAT",
      name: "Bullying / Intimidation / Threat",
      sortOrder: 2,
    },
    {
      code: "TARGETED_VERBAL_ABUSE_SLURS",
      name: "Targeted Verbal Abuse / Slurs",
      sortOrder: 3,
    },
    {
      code: "VANDALISM_PROPERTY_DAMAGE",
      name: "Vandalism / Property Damage",
      sortOrder: 4,
    },
    { code: "ELOPEMENT", name: "Elopement", sortOrder: 5 },
    {
      code: "POSSESSION_PROHIBITED_ITEMS",
      name: "Possession of Prohibited Items / Weapons",
      sortOrder: 6,
    },
    { code: "CHRONIC_MINOR", name: "Chronic Minor", sortOrder: 7 },
    { code: "OTHER", name: "Other", sortOrder: 8 },
  ];
  for (const c of incidentCategories) {
    await db.incidentCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }

  const behaviorCategories = [
    { code: "D", name: "Disruption / Noise", type: "NEGATIVE" as const },
    { code: "N", name: "Non-Compliance", type: "NEGATIVE" as const },
    { code: "L", name: "Language", type: "NEGATIVE" as const },
    { code: "P", name: "Rough Play", type: "NEGATIVE" as const },
    { code: "M", name: "Misuse of Items", type: "NEGATIVE" as const },
    { code: "T", name: "Tech Misuse", type: "NEGATIVE" as const },
  ];
  for (const c of behaviorCategories) {
    await db.behaviorCategory.upsert({
      where: { code: c.code },
      update: {},
      create: c,
    });
  }
  await db.behaviorCategory.upsert({
    where: { code: "POSITIVE_ACHIEVEMENT" },
    update: {},
    create: {
      code: "POSITIVE_ACHIEVEMENT",
      name: "Positive: Achievement",
      type: "POSITIVE",
    },
  });

  const actionCodes = [
    { code: "W", name: "Verbal Warning", sortOrder: 1 },
    { code: "S", name: "Seat Change", sortOrder: 2 },
    { code: "C", name: "Cooling-off Break", sortOrder: 3 },
    { code: "R", name: "Restorative Talk", sortOrder: 4 },
    { code: "E", name: "Escalated", sortOrder: 5 },
  ];
  for (const a of actionCodes) {
    await db.actionCode.upsert({
      where: { code: a.code },
      update: {},
      create: a,
    });
  }

  const riskDimensions = [
    { name: "Safety to Self", sortOrder: 1 },
    { name: "Safety to Others", sortOrder: 2 },
    { name: "Emotional Regulation", sortOrder: 3 },
    { name: "Academic Impact", sortOrder: 4 },
    { name: "Social / Peer Dynamics", sortOrder: 5 },
  ];
  for (const d of riskDimensions) {
    await db.riskDimension.upsert({
      where: { name: d.name },
      update: {},
      create: d,
    });
  }

  const documentCategories = [
    "Counseling Report",
    "Incident Report",
    "Behavior Log",
    "Student Summary",
    "Student Roster",
    "Teaching Material",
    "Other",
  ];
  for (const name of documentCategories) {
    await db.documentCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Bahasa Indonesia",
    "Social Studies",
    "Physical Education",
    "Art",
  ];
  for (const name of subjects) {
    await db.subject.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log(
    "Seeded counseling/incident/behavior categories, risk dimensions, and subjects.",
  );

  const reportTemplates: {
    name: string;
    reportType: "COUNSELING_CASE" | "INCIDENT_MAJOR" | "BEHAVIOR_LOG_MINOR" | "STUDENT_SUMMARY";
    sections: string[];
  }[] = [
    {
      name: "Case/Incident Counseling Report",
      reportType: "COUNSELING_CASE",
      sections: [
        "presentation_engagement",
        "emotional_affect",
        "credibility_objectivity",
        "key_takeaways",
        "timeline",
        "peer_perceptions",
        "group_observations",
        "objective_findings",
        "risk_assessments",
        "action_items",
        "summary",
      ],
    },
    {
      name: "Major Incident Report",
      reportType: "INCIDENT_MAJOR",
      sections: [
        "metadata",
        "individuals_involved",
        "incident_category",
        "factual_description",
        "immediate_action",
        "follow_up_parent_log",
        "sign_off",
      ],
    },
    {
      name: "Minor Behavior Log (Tick-and-Go Grid)",
      reportType: "BEHAVIOR_LOG_MINOR",
      sections: ["filtered_grid"],
    },
    {
      name: "Student Incident & Behavior Summary",
      reportType: "STUDENT_SUMMARY",
      sections: ["student_info", "major_incidents", "minor_behavior_logs"],
    },
  ];
  for (const t of reportTemplates) {
    const existing = await db.reportTemplate.findFirst({
      where: { reportType: t.reportType },
    });
    if (!existing) {
      await db.reportTemplate.create({
        data: {
          name: t.name,
          reportType: t.reportType,
          templateVersion: 1,
          templateDefinition: { sections: t.sections },
        },
      });
    }
  }

  console.log("Seeded report templates.");

  const defaultSettings: Record<string, string> = {
    school_name: "SPK Saint Peter's School Jakarta",
    confidentiality_notice: "Confidential — School Use Only",
    timezone: "Asia/Jakarta",
  };
  for (const [key, value] of Object.entries(defaultSettings)) {
    await db.systemSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }

  console.log("Seeded default system settings.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
