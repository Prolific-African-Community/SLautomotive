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
