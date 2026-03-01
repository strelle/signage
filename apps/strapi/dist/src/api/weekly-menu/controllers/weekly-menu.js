"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
const WEEKLY_MENU_UID = 'api::weekly-menu.weekly-menu';
const PDF_MIME_TYPES = new Set(['application/pdf', 'application/x-pdf']);
const parseWeek = (value) => {
    if (typeof value === 'number' && Number.isInteger(value)) {
        return value >= 1 && value <= 53 ? value : null;
    }
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    const parsed = Number.parseInt(trimmed, 10);
    if (!Number.isInteger(parsed)) {
        return null;
    }
    return parsed >= 1 && parsed <= 53 ? parsed : null;
};
const parseIsoDate = (value) => {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }
    const isIsoDate = /^\d{4}-\d{2}-\d{2}$/.test(trimmed);
    return isIsoDate ? trimmed : null;
};
const parseOptionalText = (value) => {
    if (value === undefined) {
        return undefined;
    }
    if (value === null) {
        return null;
    }
    if (typeof value !== 'string') {
        return null;
    }
    const trimmed = value.trim();
    return trimmed ? trimmed : null;
};
exports.default = strapi_1.factories.createCoreController(WEEKLY_MENU_UID, ({ strapi }) => ({
    async customerUpload(ctx) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        const expectedToken = process.env.WEEKLY_UPLOAD_TOKEN;
        if (!expectedToken) {
            strapi.log.error('WEEKLY_UPLOAD_TOKEN is not configured');
            return ctx.internalServerError('Upload token is not configured');
        }
        const authHeader = ctx.get('authorization');
        const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
        const providedToken = (ctx.get('x-upload-token') || bearerToken || '').trim();
        if (!providedToken || providedToken !== expectedToken) {
            return ctx.unauthorized('Invalid upload token');
        }
        const fileInput = (_b = (_a = ctx.request.files) === null || _a === void 0 ? void 0 : _a.file) !== null && _b !== void 0 ? _b : (_c = ctx.request.files) === null || _c === void 0 ? void 0 : _c.files;
        const file = Array.isArray(fileInput) ? fileInput[0] : fileInput;
        if (!file) {
            return ctx.badRequest('No file uploaded. Use multipart field "file".');
        }
        if (!file.mimetype || !PDF_MIME_TYPES.has(file.mimetype)) {
            return ctx.badRequest('Only PDF uploads are allowed.');
        }
        if (typeof file.size === 'number' && file.size <= 0) {
            return ctx.badRequest('Uploaded file is empty.');
        }
        const body = ctx.request.body || {};
        const weeklyService = strapi.service(WEEKLY_MENU_UID);
        const existing = await weeklyService.find({});
        const parsedWeek = parseWeek(body.calendarWeek);
        const calendarWeek = parsedWeek !== null && parsedWeek !== void 0 ? parsedWeek : existing === null || existing === void 0 ? void 0 : existing.calendarWeek;
        if (!calendarWeek) {
            return ctx.badRequest('calendarWeek is required (1-53).');
        }
        const titleInput = parseOptionalText(body.title);
        if (body.title !== undefined && titleInput === null) {
            return ctx.badRequest('title must be a non-empty string.');
        }
        const validFromInput = parseIsoDate(body.validFrom);
        if (body.validFrom !== undefined && validFromInput === null) {
            return ctx.badRequest('validFrom must be YYYY-MM-DD.');
        }
        const validToInput = parseIsoDate(body.validTo);
        if (body.validTo !== undefined && validToInput === null) {
            return ctx.badRequest('validTo must be YYYY-MM-DD.');
        }
        const teaserInput = parseOptionalText(body.teaserText);
        if (body.teaserText !== undefined && teaserInput === null) {
            return ctx.badRequest('teaserText must be a non-empty string.');
        }
        const uploadFolderService = strapi.plugin('upload').service('api-upload-folder');
        const uploadFolder = await uploadFolderService.getAPIUploadFolder();
        const uploadResult = await strapi.plugin('upload').service('upload').upload({
            data: {
                fileInfo: {
                    name: file.originalFilename || `weekly-menu-kw${calendarWeek}.pdf`,
                    alternativeText: `Weekly menu KW ${calendarWeek}`,
                    caption: `Weekly menu KW ${calendarWeek}`,
                    folder: uploadFolder.id,
                },
            },
            files: file,
        });
        const uploaded = Array.isArray(uploadResult) ? uploadResult[0] : uploadResult;
        if (!(uploaded === null || uploaded === void 0 ? void 0 : uploaded.id)) {
            strapi.log.error('Upload completed without a media id');
            return ctx.internalServerError('Could not store uploaded file.');
        }
        const data = {
            title: (_d = titleInput !== null && titleInput !== void 0 ? titleInput : existing === null || existing === void 0 ? void 0 : existing.title) !== null && _d !== void 0 ? _d : `Wochenmenu KW ${calendarWeek}`,
            calendarWeek,
            validFrom: validFromInput === undefined ? (_e = existing === null || existing === void 0 ? void 0 : existing.validFrom) !== null && _e !== void 0 ? _e : null : validFromInput,
            validTo: validToInput === undefined ? (_f = existing === null || existing === void 0 ? void 0 : existing.validTo) !== null && _f !== void 0 ? _f : null : validToInput,
            teaserText: teaserInput === undefined ? (_g = existing === null || existing === void 0 ? void 0 : existing.teaserText) !== null && _g !== void 0 ? _g : null : teaserInput,
            isActive: (_h = existing === null || existing === void 0 ? void 0 : existing.isActive) !== null && _h !== void 0 ? _h : true,
            menuPdf: uploaded.id,
        };
        const updated = await weeklyService.createOrUpdate({ data });
        let published = false;
        if (updated === null || updated === void 0 ? void 0 : updated.documentId) {
            try {
                await strapi.documents(WEEKLY_MENU_UID).publish({ documentId: updated.documentId });
                published = true;
            }
            catch (error) {
                strapi.log.warn('Weekly menu saved but publish step failed', { error });
            }
        }
        ctx.status = 201;
        ctx.body = {
            ok: true,
            published,
            weeklyMenuDocumentId: (_j = updated === null || updated === void 0 ? void 0 : updated.documentId) !== null && _j !== void 0 ? _j : null,
            uploadedFileId: uploaded.id,
            uploadedFileUrl: (_k = uploaded.url) !== null && _k !== void 0 ? _k : null,
            calendarWeek,
        };
    },
}));
