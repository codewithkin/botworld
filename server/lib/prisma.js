const {PrismaClient} = require("../../prisma/generated/prisma");
const prisma = new PrismaClient();
module.exports = {
  prisma,
};
