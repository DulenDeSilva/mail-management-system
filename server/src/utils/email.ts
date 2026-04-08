const EMAIL_MAX_LENGTH = 254;
const LOCAL_PART_MAX_LENGTH = 64;
const MIN_TLD_LENGTH = 2;
const EMAIL_REGEX =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

type EmailValidationResult =
    | {
          email: string;
      }
    | {
          error: string;
      };

type EmailListValidationResult =
    | {
          emails: string[];
      }
    | {
          error: string;
      };

const getInvalidEmailMessage = (fieldName: string) =>
    `${fieldName} must be a valid email address`;

const hasInvalidLocalPart = (localPart: string) =>
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..");

const hasInvalidDomain = (domain: string) => {
    if (domain.startsWith(".") || domain.endsWith(".") || domain.includes("..")) {
        return true;
    }

    const labels = domain.split(".");
    const topLevelDomain = labels[labels.length - 1];

    return topLevelDomain.length < MIN_TLD_LENGTH;
};

export const validateAndNormalizeEmail = (
    value: unknown,
    fieldName = "Email"
): EmailValidationResult => {
    if (value === undefined || value === null) {
        return { error: `${fieldName} is required` };
    }

    if (typeof value !== "string") {
        return { error: `${fieldName} must be a string` };
    }

    const normalizedEmail = value.trim().toLowerCase();

    if (!normalizedEmail) {
        return { error: `${fieldName} is required` };
    }

    if (normalizedEmail.length > EMAIL_MAX_LENGTH) {
        return {
            error: `${fieldName} must be ${EMAIL_MAX_LENGTH} characters or fewer`
        };
    }

    const atIndex = normalizedEmail.lastIndexOf("@");
    const localPart = normalizedEmail.slice(0, atIndex);
    const domain = normalizedEmail.slice(atIndex + 1);

    if (
        atIndex <= 0 ||
        atIndex !== normalizedEmail.indexOf("@") ||
        localPart.length > LOCAL_PART_MAX_LENGTH ||
        hasInvalidLocalPart(localPart) ||
        hasInvalidDomain(domain) ||
        !EMAIL_REGEX.test(normalizedEmail)
    ) {
        return { error: getInvalidEmailMessage(fieldName) };
    }

    return { email: normalizedEmail };
};

export const validateAndNormalizeEmailList = (
    value: unknown,
    fieldName = "Emails"
): EmailListValidationResult => {
    if (value === undefined || value === null) {
        return { emails: [] };
    }

    if (!Array.isArray(value)) {
        return {
            error: `${fieldName} must be an array of email addresses`
        };
    }

    const seen = new Set<string>();
    const emails: string[] = [];

    for (let index = 0; index < value.length; index += 1) {
        const emailResult = validateAndNormalizeEmail(
            value[index],
            `${fieldName} item ${index + 1}`
        );

        if ("error" in emailResult) {
            return emailResult;
        }

        if (!seen.has(emailResult.email)) {
            seen.add(emailResult.email);
            emails.push(emailResult.email);
        }
    }

    return { emails };
};
