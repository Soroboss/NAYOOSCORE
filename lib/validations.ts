import { z } from "zod";
import { INSTITUTION_TYPES, USER_ROLES } from "@/lib/constants";

export const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe minimum 8 caractères"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe minimum 8 caractères"),
  role: z.enum(USER_ROLES).optional(),
});

export const companyProfileSchema = z.object({
  name: z.string().min(2, "Nom de l'entreprise requis"),
  sector: z.string().min(2, "Secteur requis"),
  legal_status: z.string().min(2, "Statut juridique requis"),
  rccm: z.string().optional(),
  tax_id: z.string().optional(),
  country: z.string().min(2, "Pays requis"),
  city: z.string().min(2, "Ville requise"),
  owner_name: z.string().min(2, "Nom du dirigeant requis"),
  phone: z.string().min(8, "Téléphone requis"),
  email: z.string().email("Email invalide"),
});

export const saleSchema = z.object({
  amount: z.coerce.number().positive("Montant positif requis"),
  sale_date: z.string().min(1, "Date requise"),
  customer_name: z.string().min(2, "Client requis"),
  payment_method: z.string().min(2, "Mode de paiement requis"),
});

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Montant positif requis"),
  expense_date: z.string().min(1, "Date requise"),
  category: z.string().min(2, "Catégorie requise"),
  description: z.string().min(2, "Description requise"),
  payment_method: z.string().min(2, "Mode de paiement requis"),
});

export const institutionSchema = z.object({
  name: z.string().min(2, "Nom requis"),
  type: z.enum(INSTITUTION_TYPES),
  country: z.string().min(2, "Pays requis"),
  city: z.string().min(2, "Ville requise"),
  email: z.string().email("Email invalide"),
  phone: z.string().optional(),
});

export const programSchema = z.object({
  name: z.string().min(2, "Nom du programme requis"),
  description: z.string().min(10, "Description requise"),
  objective: z.string().min(10, "Objectif requis"),
  start_date: z.string().min(1, "Date de début requise"),
  end_date: z.string().min(1, "Date de fin requise"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CompanyProfileInput = z.infer<typeof companyProfileSchema>;
export type SaleInput = z.infer<typeof saleSchema>;
export type ExpenseInput = z.infer<typeof expenseSchema>;
export type InstitutionInput = z.infer<typeof institutionSchema>;
export const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
