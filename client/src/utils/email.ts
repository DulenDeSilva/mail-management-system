export const EMAIL_MAX_LENGTH = 254;

const LOCAL_PART_MAX_LENGTH = 64;
const MIN_TLD_LENGTH = 2;
const EMAIL_REGEX =
    /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/i;

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

export const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const getEmailValidationError = (
    value: string,
    fieldName = "Email"
): string | null => {
    const normalizedEmail = normalizeEmail(value);

    if (!normalizedEmail) {
        return `${fieldName} is required`;
    }

    if (normalizedEmail.length > EMAIL_MAX_LENGTH) {
        return `${fieldName} must be ${EMAIL_MAX_LENGTH} characters or fewer`;
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
        return `${fieldName} must be a valid email address`;
    }

    return null;
};

export const normalizeEmailList = (value: string) => {
    const seen = new Set<string>();
    const emails: string[] = [];

    value
        .split(",")
        .map((item) => normalizeEmail(item))
        .filter(Boolean)
        .forEach((email) => {
            if (!seen.has(email)) {
                seen.add(email);
                emails.push(email);
            }
        });

    return emails;
};
