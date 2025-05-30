"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const prisma_1 = require("../../prisma/generated/prisma");
const prisma = new prisma_1.PrismaClient();
exports.prisma = prisma;
