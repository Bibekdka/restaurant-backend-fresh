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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("./models/User");
dotenv_1.default.config();
const seedAdmin = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.DB_URI);
        console.log('Connected to MongoDB');
        const adminEmail = 'bibekdeka97@gail.com';
        const adminPassword = '2345678'; // Wait, user said 12345678. I will use the user request.
        // User request: "password u ca keep 12345678"
        // Check if user exists
        const existingUser = yield User_1.User.findOne({ email: adminEmail });
        const salt = yield bcryptjs_1.default.genSalt(10);
        const hashedPassword = yield bcryptjs_1.default.hash('12345678', salt);
        if (existingUser) {
            existingUser.password = hashedPassword;
            existingUser.role = 'admin';
            existingUser.name = 'Admin User';
            yield existingUser.save();
            console.log('Admin user updated successfully');
        }
        else {
            const newUser = new User_1.User({
                name: 'Admin User',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                preferences: { dietary: [], cuisines: [] }
            });
            yield newUser.save();
            console.log('Admin user created successfully');
        }
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
});
seedAdmin();
