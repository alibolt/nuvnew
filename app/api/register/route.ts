import { prisma } from '@/lib/prisma';
import bcrypt from 'bcrypt';
import { apiResponse, handleApiError } from '@/lib/api/response';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return apiResponse.badRequest('Missing name, email, or password');
    }

    const exist = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (exist) {
      return apiResponse.badRequest('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return apiResponse.success({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    console.error('REGISTRATION_ERROR', error);
    return apiResponse.serverError();
  }
}
