"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setBotConfig = setBotConfig;
const auth_1 = require("../../lib/auth");
function setBotConfig(botId, property, value) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Update the bot using prisma
            yield auth_1.prisma.bot.update({
                where: {
                    id: botId,
                },
                data: {
                    [property]: value,
                },
            });
        }
        catch (e) {
            console.log("Failed to set property " + property + " on bot with id " + botId);
        }
    });
}
