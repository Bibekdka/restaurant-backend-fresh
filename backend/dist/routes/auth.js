"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const validate_1 = require("../middleware/validate");
const schemas_1 = require("../schemas");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
router.post('/register', (0, validate_1.validate)(schemas_1.registerSchema), authController_1.register);
router.post('/login', (0, validate_1.validate)(schemas_1.loginSchema), authController_1.login);
exports.default = router;
