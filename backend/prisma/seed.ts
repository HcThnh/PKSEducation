import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');

  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const studentPasswordHash = await bcrypt.hash('Student@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@pks.edu.vn' },
    update: {},
    create: {
      fullName: 'Admin PKS',
      email: 'admin@pks.edu.vn',
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
    },
  });
  console.log(`Created Admin Account: ${admin.email}`);

  const student = await prisma.user.upsert({
    where: { email: 'student@pks.edu.vn' },
    update: {},
    create: {
      fullName: 'Student PKS',
      email: 'student@pks.edu.vn',
      passwordHash: studentPasswordHash,
      role: Role.STUDENT,
    },
  });
  console.log(`Created Student Account: ${student.email}`);

  const courses = [
    {
      title: 'Full Stack Web Development',
      category: 'Web Development',
      instructor: 'Instructor PKS Tech',
      shortDescription: 'Course Full Stack Web Development',
      fullDescription: 'Course Full Stack Web Development',
      fee: 4500000,
      maxCapacity: 20,
      enrolledCount: 0,
      isHidden: false,
    },
    {
      title: 'MOS Excel Specialist',
      category: 'MOS',
      instructor: 'Instructor PKS Education',
      shortDescription: 'Exam training MOS Excel Specialist',
      fullDescription: 'Exam training MOS Excel Specialist',
      fee: 1200000,
      maxCapacity: 30,
      enrolledCount: 0,
      isHidden: false,
    },
    {
      title: 'Web Design & Mini-ERP System',
      category: 'Web Development',
      instructor: 'Instructor PKS Technology',
      shortDescription: 'Web Design & Mini-ERP System',
      fullDescription: 'Web Design & Mini-ERP System',
      fee: 5000000,
      maxCapacity: 15,
      enrolledCount: 0,
      isHidden: false,
    },
    {
      title: 'PKS Co-op IT Training Program',
      category: 'Co-op IT',
      instructor: 'Senior Fullstack Engineer',
      shortDescription: 'PKS Co-op IT Training Program',
      fullDescription: 'PKS Co-op IT Training Program',
      fee: 6000000,
      maxCapacity: 10,
      enrolledCount: 0,
      isHidden: false,
    },
    {
      title: 'DevOps & Docker Fundamentals',
      category: 'DevOps',
      instructor: 'DevOps Engineer PKS',
      shortDescription: 'DevOps & Docker Fundamentals',
      fullDescription: 'DevOps & Docker Fundamentals',
      fee: 3500000,
      maxCapacity: 25,
      enrolledCount: 0,
      isHidden: false,
    },
  ];

  for (const courseData of courses) {
    const existing = await prisma.course.findFirst({
      where: { title: courseData.title },
    });
    if (!existing) {
      await prisma.course.create({ data: courseData });
    }
  }

  console.log(`Created ${courses.length} sample courses.`);
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
