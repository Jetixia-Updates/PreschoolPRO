import { PrismaClient, UserRole, ISCEDLevel, Gender, DevelopmentDomain, MilestoneStatus } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";
import "dotenv/config";

// Enable WebSocket support for Node.js runtime
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;
console.log("Connecting to:", connectionString.substring(0, 50) + "...");

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  console.log("🌱 Seeding database...");

  // Create school
  const school = await prisma.school.create({
    data: {
      name: "Bright Future Academy",
      code: "BFA001",
      address: "123 Education St, Riyadh, Saudi Arabia",
      phone: "+966 11 234 5678",
      email: "info@brightfuture.edu",
      settings: {
        currency: "SAR",
        timezone: "Asia/Riyadh",
        academicYear: "2025-2026",
      },
    },
  });

  console.log("✅ School created:", school.name);

  // Create users
  const password = await bcrypt.hash("demo123456", 12);

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@edu.com",
      password,
      name: "Ahmed Hassan",
      role: UserRole.SUPER_ADMIN,
      phone: "+966 50 100 0001",
      schoolId: school.id,
    },
  });

  const schoolAdmin = await prisma.user.create({
    data: {
      email: "school@edu.com",
      password,
      name: "Fatima Ali",
      role: UserRole.SCHOOL_ADMIN,
      phone: "+966 50 100 0002",
      schoolId: school.id,
    },
  });

  const teacher1 = await prisma.user.create({
    data: {
      email: "teacher@edu.com",
      password,
      name: "Nora Saeed",
      role: UserRole.TEACHER,
      phone: "+966 50 100 0003",
      schoolId: school.id,
    },
  });

  const teacher2 = await prisma.user.create({
    data: {
      email: "teacher2@edu.com",
      password,
      name: "Layla Mahmoud",
      role: UserRole.TEACHER,
      phone: "+966 50 100 0004",
      schoolId: school.id,
    },
  });

  const parentUser = await prisma.user.create({
    data: {
      email: "parent@edu.com",
      password,
      name: "Mohammed Al-Hassan",
      role: UserRole.PARENT,
      phone: "+966 50 100 0005",
      schoolId: school.id,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: "accountant@edu.com",
      password,
      name: "Sarah Ibrahim",
      role: UserRole.ACCOUNTANT,
      phone: "+966 50 100 0006",
      schoolId: school.id,
    },
  });

  const healthSupervisor = await prisma.user.create({
    data: {
      email: "health@edu.com",
      password,
      name: "Dr. Khalid Omar",
      role: UserRole.HEALTH_SUPERVISOR,
      phone: "+966 50 100 0007",
      schoolId: school.id,
    },
  });

  console.log("✅ Users created: 7 users");

  // Create teacher profiles
  await prisma.teacherProfile.create({
    data: {
      userId: teacher1.id,
      employeeId: "TCH001",
      qualifications: [{ degree: "B.Ed", institution: "King Saud University", year: 2018 }],
      certifications: [{ name: "Early Childhood Education", year: 2019 }],
      specializations: ["Early Childhood", "Special Needs"],
      yearsOfExperience: 7,
      hireDate: new Date("2019-08-01"),
      bio: "Passionate early childhood educator with 7 years of experience.",
    },
  });

  await prisma.teacherProfile.create({
    data: {
      userId: teacher2.id,
      employeeId: "TCH002",
      qualifications: [{ degree: "M.Ed", institution: "Princess Nora University", year: 2020 }],
      certifications: [{ name: "Montessori Certified", year: 2021 }],
      specializations: ["Montessori", "Language Development"],
      yearsOfExperience: 5,
      hireDate: new Date("2021-01-15"),
      bio: "Montessori-certified teacher specializing in language development.",
    },
  });

  // Create parent profile
  const parentProfile = await prisma.parentProfile.create({
    data: {
      userId: parentUser.id,
      occupation: "Engineer",
      emergencyContact: { phone: "+966 50 200 0001", name: "Aisha Al-Hassan" },
    },
  });

  // Create programs
  const program010 = await prisma.program.create({
    data: {
      name: "Early Childhood Development",
      code: "ECD010",
      description: "Program for children aged 0-2 years (ISCED 010)",
      iscedLevel: ISCEDLevel.ISCED_010,
      ageMin: 0,
      ageMax: 3,
      schoolId: school.id,
    },
  });

  const program020 = await prisma.program.create({
    data: {
      name: "Pre-Primary Education",
      code: "PPE020",
      description: "Program for children aged 3-5 years (ISCED 020)",
      iscedLevel: ISCEDLevel.ISCED_020,
      ageMin: 3,
      ageMax: 6,
      schoolId: school.id,
    },
  });

  // Create classrooms
  const classroom1 = await prisma.classroom.create({
    data: {
      name: "Butterflies",
      code: "BF-A",
      programId: program010.id,
      leadTeacherId: teacher1.id,
      capacity: 15,
      roomNumber: "101",
      schoolId: school.id,
      academicYear: "2025-2026",
    },
  });

  const classroom2 = await prisma.classroom.create({
    data: {
      name: "Stars",
      code: "ST-B",
      programId: program020.id,
      leadTeacherId: teacher2.id,
      capacity: 20,
      roomNumber: "201",
      schoolId: school.id,
      academicYear: "2025-2026",
    },
  });

  console.log("✅ Programs and classrooms created");

  // Create students
  const students = await Promise.all([
    prisma.student.create({
      data: {
        studentId: "STU2601",
        firstName: "Sara",
        lastName: "Ahmed",
        fullName: "Sara Ahmed",
        dateOfBirth: new Date("2022-03-15"),
        gender: Gender.FEMALE,
        iscedLevel: ISCEDLevel.ISCED_010,
        nationality: "Saudi",
        address: "456 Palm St, Riyadh",
        allergies: ["Peanuts"],
        schoolId: school.id,
      },
    }),
    prisma.student.create({
      data: {
        studentId: "STU2602",
        firstName: "Omar",
        lastName: "Khalid",
        fullName: "Omar Khalid",
        dateOfBirth: new Date("2021-07-22"),
        gender: Gender.MALE,
        iscedLevel: ISCEDLevel.ISCED_020,
        nationality: "Saudi",
        address: "789 Cedar Ave, Riyadh",
        schoolId: school.id,
      },
    }),
    prisma.student.create({
      data: {
        studentId: "STU2603",
        firstName: "Layla",
        lastName: "Mohammed",
        fullName: "Layla Mohammed",
        dateOfBirth: new Date("2023-01-10"),
        gender: Gender.FEMALE,
        iscedLevel: ISCEDLevel.ISCED_010,
        nationality: "Saudi",
        allergies: ["Dairy"],
        schoolId: school.id,
      },
    }),
    prisma.student.create({
      data: {
        studentId: "STU2604",
        firstName: "Youssef",
        lastName: "Ali",
        fullName: "Youssef Ali",
        dateOfBirth: new Date("2021-11-05"),
        gender: Gender.MALE,
        iscedLevel: ISCEDLevel.ISCED_020,
        nationality: "Egyptian",
        schoolId: school.id,
      },
    }),
    prisma.student.create({
      data: {
        studentId: "STU2605",
        firstName: "Noor",
        lastName: "Hassan",
        fullName: "Noor Hassan",
        dateOfBirth: new Date("2022-06-30"),
        gender: Gender.FEMALE,
        iscedLevel: ISCEDLevel.ISCED_010,
        nationality: "Saudi",
        schoolId: school.id,
      },
    }),
  ]);

  console.log("✅ Students created:", students.length);

  // Assign students to classrooms
  await Promise.all([
    prisma.classAssignment.create({
      data: { studentId: students[0].id, classroomId: classroom1.id },
    }),
    prisma.classAssignment.create({
      data: { studentId: students[1].id, classroomId: classroom2.id },
    }),
    prisma.classAssignment.create({
      data: { studentId: students[2].id, classroomId: classroom1.id },
    }),
    prisma.classAssignment.create({
      data: { studentId: students[3].id, classroomId: classroom2.id },
    }),
    prisma.classAssignment.create({
      data: { studentId: students[4].id, classroomId: classroom1.id },
    }),
  ]);

  // Connect parent to student
  await prisma.parentStudent.create({
    data: {
      parentProfileId: parentProfile.id,
      studentId: students[0].id,
      relationship: "father",
      isPrimary: true,
    },
  });

  // Create milestones
  const domains = [
    DevelopmentDomain.COGNITIVE,
    DevelopmentDomain.LANGUAGE_COMMUNICATION,
    DevelopmentDomain.SOCIAL_EMOTIONAL,
    DevelopmentDomain.PHYSICAL_MOTOR,
    DevelopmentDomain.CREATIVE_EXPRESSION,
  ];

  const milestoneData = [
    { domain: DevelopmentDomain.COGNITIVE, title: "Can count to 10", description: "Child can count from 1 to 10 independently", ageMin: 24, ageMax: 36, iscedLevel: ISCEDLevel.ISCED_010, order: 1 },
    { domain: DevelopmentDomain.COGNITIVE, title: "Can count to 20", description: "Child can count from 1 to 20 independently", ageMin: 36, ageMax: 48, iscedLevel: ISCEDLevel.ISCED_020, order: 2 },
    { domain: DevelopmentDomain.LANGUAGE_COMMUNICATION, title: "Uses 2-3 word sentences", description: "Child uses 2-3 word sentences regularly", ageMin: 18, ageMax: 30, iscedLevel: ISCEDLevel.ISCED_010, order: 1 },
    { domain: DevelopmentDomain.LANGUAGE_COMMUNICATION, title: "Speaks in 4-5 word sentences", description: "Child uses 4-5 word sentences fluently", ageMin: 30, ageMax: 48, iscedLevel: ISCEDLevel.ISCED_020, order: 2 },
    { domain: DevelopmentDomain.SOCIAL_EMOTIONAL, title: "Shares toys with others", description: "Willingly shares toys with peers", ageMin: 24, ageMax: 36, iscedLevel: ISCEDLevel.ISCED_010, order: 1 },
    { domain: DevelopmentDomain.PHYSICAL_MOTOR, title: "Walks independently", description: "Walks without assistance", ageMin: 12, ageMax: 18, iscedLevel: ISCEDLevel.ISCED_010, order: 1 },
    { domain: DevelopmentDomain.PHYSICAL_MOTOR, title: "Hops on one foot", description: "Can hop on one foot several times", ageMin: 36, ageMax: 48, iscedLevel: ISCEDLevel.ISCED_020, order: 2 },
    { domain: DevelopmentDomain.CREATIVE_EXPRESSION, title: "Draws recognizable shapes", description: "Can draw basic shapes like circles and squares", ageMin: 30, ageMax: 42, iscedLevel: ISCEDLevel.ISCED_010, order: 1 },
  ];

  await prisma.milestone.createMany({ data: milestoneData });

  console.log("✅ Milestones created:", milestoneData.length);

  // Create emergency contacts
  await prisma.emergencyContact.create({
    data: {
      studentId: students[0].id,
      name: "Mohammed Al-Hassan",
      relationship: "Father",
      phone: "+966 50 100 0005",
      email: "parent@edu.com",
      isPrimary: true,
    },
  });

  console.log("✅ Seed completed successfully!");
  console.log("\n📋 Demo Accounts:");
  console.log("  Super Admin:  admin@edu.com / demo123456");
  console.log("  School Admin: school@edu.com / demo123456");
  console.log("  Teacher:      teacher@edu.com / demo123456");
  console.log("  Parent:       parent@edu.com / demo123456");
  console.log("  Accountant:   accountant@edu.com / demo123456");
  console.log("  Health:       health@edu.com / demo123456");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
