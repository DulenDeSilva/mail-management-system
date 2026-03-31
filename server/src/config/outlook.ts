export const outlookConfig = {
    clientId: process.env.MICROSOFT_CLIENT_ID || "",
    clientSecret: process.env.MICROSOFT_CLIENT_SECRET || "",
    tenantId: process.env.MICROSOFT_TENANT_ID || "common",
    redirectUri: process.env.MICROSOFT_REDIRECT_URI || "",
    scope:
        process.env.MICROSOFT_SCOPE ||
        "openid profile email offline_access https://graph.microsoft.com/Mail.Send"
};