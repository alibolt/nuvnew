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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs_1 = require("fs");
var path_1 = require("path");
var prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var manifestPath, manifest, theme, allSections, _i, allSections_1, sectionType, user, store, _a, _b, _c, _d, templateKey, templateManifest, templatePath, templateData, storeTemplate, _e, _f, section;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    console.log('Seeding commerce theme...');
                    manifestPath = path_1.default.join(process.cwd(), 'themes', 'minimal', 'manifest.json');
                    manifest = JSON.parse(fs_1.default.readFileSync(manifestPath, 'utf-8'));
                    return [4 /*yield*/, prisma.theme.upsert({
                            where: { code: manifest.theme.code },
                            update: {},
                            create: {
                                code: manifest.theme.code,
                                name: manifest.theme.name,
                                description: manifest.theme.description,
                                category: manifest.theme.category,
                                version: manifest.theme.version,
                                author: manifest.theme.author,
                                features: manifest.features || [],
                                settings: manifest.settings || [],
                            },
                        })];
                case 1:
                    theme = _g.sent();
                    console.log("Theme '".concat(theme.name, "' seeded with id: ").concat(theme.id));
                    allSections = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], manifest.sections.structural, true), manifest.sections.content, true), manifest.sections.product, true), manifest.sections.collection, true);
                    _i = 0, allSections_1 = allSections;
                    _g.label = 2;
                case 2:
                    if (!(_i < allSections_1.length)) return [3 /*break*/, 5];
                    sectionType = allSections_1[_i];
                    return [4 /*yield*/, prisma.themeSection.upsert({
                            where: { themeId_type: { themeId: theme.id, type: sectionType } },
                            update: {},
                            create: {
                                themeId: theme.id,
                                type: sectionType,
                                name: sectionType.replace(/-/g, ' ').replace(/\b\w/g, function (l) { return l.toUpperCase(); }),
                                schema: [], // You might want to define a proper schema later
                            },
                        })];
                case 3:
                    _g.sent();
                    _g.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log("Seeded ".concat(allSections.length, " sections for theme '").concat(theme.name, "'"));
                    return [4 /*yield*/, prisma.user.upsert({
                            where: { email: 'dev@nuvi.com' },
                            update: {},
                            create: {
                                email: 'dev@nuvi.com',
                                name: 'Dev User',
                            },
                        })];
                case 6:
                    user = _g.sent();
                    console.log("Upserted default user with id: ".concat(user.id));
                    return [4 /*yield*/, prisma.store.upsert({
                            where: { subdomain: 'default' },
                            update: { activeThemeId: theme.id },
                            create: {
                                name: 'Default Store',
                                subdomain: 'default',
                                userId: user.id,
                                activeThemeId: theme.id,
                            },
                        })];
                case 7:
                    store = _g.sent();
                    console.log("Upserted default store with id: ".concat(store.id));
                    _a = manifest.templates;
                    _b = [];
                    for (_c in _a)
                        _b.push(_c);
                    _d = 0;
                    _g.label = 8;
                case 8:
                    if (!(_d < _b.length)) return [3 /*break*/, 14];
                    _c = _b[_d];
                    if (!(_c in _a)) return [3 /*break*/, 13];
                    templateKey = _c;
                    templateManifest = manifest.templates[templateKey];
                    templatePath = path_1.default.join(process.cwd(), 'themes', 'minimal', templateManifest.file);
                    if (!fs_1.default.existsSync(templatePath)) return [3 /*break*/, 13];
                    templateData = JSON.parse(fs_1.default.readFileSync(templatePath, 'utf-8'));
                    return [4 /*yield*/, prisma.storeTemplate.upsert({
                            where: { storeId_templateType_name: { storeId: store.id, templateType: templateData.type, name: templateData.name } },
                            update: {},
                            create: {
                                storeId: store.id,
                                themeId: theme.id,
                                templateType: templateData.type,
                                name: templateData.name,
                                isDefault: true,
                            }
                        })];
                case 9:
                    storeTemplate = _g.sent();
                    _e = 0, _f = templateData.sections;
                    _g.label = 10;
                case 10:
                    if (!(_e < _f.length)) return [3 /*break*/, 13];
                    section = _f[_e];
                    return [4 /*yield*/, prisma.storeSectionInstance.create({
                            data: {
                                templateId: storeTemplate.id,
                                sectionType: section.type,
                                position: templateData.sections.indexOf(section),
                                enabled: true,
                                settings: section.settings,
                            }
                        })];
                case 11:
                    _g.sent();
                    _g.label = 12;
                case 12:
                    _e++;
                    return [3 /*break*/, 10];
                case 13:
                    _d++;
                    return [3 /*break*/, 8];
                case 14:
                    console.log('Seeding complete.');
                    return [2 /*return*/];
            }
        });
    });
}
main()
    .catch(function (e) {
    console.error(e);
    process.exit(1);
})
    .finally(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma.$disconnect()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
