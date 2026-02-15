import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    schoolId: string;
    name: string;
    email: string;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      schoolId: string;
      name: string;
      email: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    schoolId: string;
  }
}
