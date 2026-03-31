import axios from "axios";
import { outlookConfig } from "../../config/outlook";

export const getMicrosoftAuthUrl = (state: string): string => {
    const baseUrl = `https://login.microsoftonline.com/${outlookConfig.tenantId}/oauth2/v2.0/authorize`;

    const params = new URLSearchParams({
        client_id: outlookConfig.clientId,
        response_type: "code",
        redirect_uri: outlookConfig.redirectUri,
        response_mode: "query",
        scope: outlookConfig.scope,
        state
    });

    return `${baseUrl}?${params.toString()}`;
};

export const exchangeCodeForToken = async (code: string) => {
    const tokenUrl = `https://login.microsoftonline.com/${outlookConfig.tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
        client_id: outlookConfig.clientId,
        client_secret: outlookConfig.clientSecret,
        code,
        redirect_uri: outlookConfig.redirectUri,
        grant_type: "authorization_code",
        scope: outlookConfig.scope
    });

    const response = await axios.post(tokenUrl, params, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    });

    return response.data;
};