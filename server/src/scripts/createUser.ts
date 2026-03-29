import prisma from "../config/prisma";
import { hashPassword } from "../utils/password";

async function main() {
    const existingUser = await prisma.user.findUnique({
        where: { email: "admin@test.com" }
    });

    if (existingUser) {
        console.log("User already exists");
        return;
    }

    const password = await hashPassword("admin123");

    const user = await prisma.user.create({
        data: {
            name: "Admin",
            email: "admin@test.com",
            passwordHash: password,
            role: "ADMIN"
        }
    });

    console.log("User created:", user.email);
}

main()
    .catch((error) => {
        console.error("Error creating user:", error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });