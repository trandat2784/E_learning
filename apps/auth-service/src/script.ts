import  prisma  from "../../../packages/libs/prisma";

async function main() {
  // Example: Fetch all records from a collection
  // Replace 'user' with your actual model name
  const allUsers = await prisma.users.findMany();
  console.log("All users:", JSON.stringify(allUsers, null, 2));
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