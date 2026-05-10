import type {IPasswordPolicy} from "@drax/identity-share";

const projectPasswordPolicy: IPasswordPolicy = {
    minLength: 6,
    maxLength: 32,
    requireUppercase: false,
    requireLowercase: true,
    requireNumber: false,
    requireSpecialChar: false,
    allowedSpecialChars: "!\"#$%&'()*+,-./:;<=>?@[\\]^_`{|}~",
    disallowSpaces: false,
    preventReuse: 3,
    expirationDays: null
}

export {
    projectPasswordPolicy
}
