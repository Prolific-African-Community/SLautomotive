/**
 * Single source of truth for SL Automotive invoice issuer + payment details.
 *
 * These strings are shared by every SL Automotive PDF (external maintenance
 * fees/invoices and regular garage request invoices) so the company identity
 * and bank details stay consistent across documents. Do not fork these values
 * into individual renderers.
 */

export const SL_AUTOMOTIVE_ISSUER_TEXT =
  "STANLEY ARTHUR LISHOU\nSIRET : 911 982 643 00015\n+33 6 21 02 56 31\nsl-automotive.vercel.app\nSED-X Industrial Hub, Sedan, France";

export const SL_AUTOMOTIVE_PAYMENT_TEXT =
  "Paiement à l’ordre de Stanley Arthur Lishou\nIBAN: FR802043302626N261441545654\nBIC: NTSBFRM1XXX";

export const NOVOTRALUX_BILLING_PROFILE = {
  name: "NOVOTRALUX S.À R.L.",
  addressLines: [
    "21 Stawelerstrooss, 9964",
    "Huldang Ëlwen,",
    "Luxembourg",
  ],
  vatNumber: "LU31249718",
};

export const NOVOTRALUX_BILLING_TEXT = [
  NOVOTRALUX_BILLING_PROFILE.name,
  ...NOVOTRALUX_BILLING_PROFILE.addressLines,
  `TVA : ${NOVOTRALUX_BILLING_PROFILE.vatNumber}`,
].join("\n");
