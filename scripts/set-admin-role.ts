
// scripts/set-admin-role.ts
import { PrismaClient } from '@prisma/client';
import * as readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

const prisma = new PrismaClient();
const rl = readline.createInterface({ input, output });

async function main() {
  console.log('--- Set User Role to Admin ---');
  const email = await rl.question('Enter the email address of the user to make admin: ');

  if (!email) {
    console.error('Email address cannot be empty.');
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User with email "${email}" not found.`);
      return;
    }

    if (user.role === 'admin') {
      console.log(`User "${email}" is already an admin.`);
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: 'admin' },
    });

    console.log(`Successfully updated user "${updatedUser.email}". Their new role is: ${updatedUser.role}`);

  } catch (error) {
    console.error('An error occurred:', error);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

main();
