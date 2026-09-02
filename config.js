// config.js
// Configuration centrale du bot KAIRO ZYNEX.
// Toutes les valeurs peuvent être surchargées via des variables
// d'environnement (Railway → Variables) sans toucher au code.

export const BOT_NAME = process.env.BOT_NAME || "KAIRO ZYNEX";

export const OWNER_NAME = process.env.OWNER_NAME || "KAIRO DEV";

// Numéro WhatsApp du owner, SANS "+" ni espaces (ex: 50912345678)
export const OWNER_NUM = process.env.OWNER_NUM || "50939360237";

// Identifiant utilisé pour valider les codes d'accès (utils/validator.js)
export const OWNER_ID = process.env.OWNER_ID || OWNER_NUM;

// Lien du canal WhatsApp officiel du bot
export const WA_CHANNEL = process.env.WA_CHANNEL || "https://whatsapp.com/channel/0029VbDmi1g77qVOA4cfRq13";
