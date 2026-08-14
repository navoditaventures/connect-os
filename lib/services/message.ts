import { Contact } from "../hooks/useContacts";
import { Interaction } from "../hooks/useInteractions";
import { Event } from "../hooks/useEvents";

export interface MessageContext {
  contact: Contact;
  interaction?: Interaction;
  event?: Event;
  digitalProfileUrl: string;
}

export interface PersonalizedMessage {
  text: string;
  variables: Record<string, string>;
}

export function personalizeMessage(template: string, context: MessageContext): PersonalizedMessage {
  const variables: Record<string, string> = {
    first_name: context.contact.name?.split(" ")[0] || context.contact.name || "there",
    full_name: context.contact.name || "",
    company_name: context.contact.company || "",
    designation: context.contact.designation || "",
    event_name: context.event?.name || "",
    event_date: context.event?.date ? new Date(context.event.date).toLocaleDateString() : "",
    industry: context.contact.industry || "",
    relationship: context.interaction?.relationship || "",
    opportunity: context.interaction?.opportunity || "",
    notes: context.interaction?.notes || "",
    digital_profile_url: context.digitalProfileUrl,
  };

  let text = template;

  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g");
    text = text.replace(regex, value);
  });

  return { text, variables };
}

export function generateWhatsAppLink(phoneNumber: string, message: string): string {
  const encoded = encodeURIComponent(message);
  const phone = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encoded}`;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length >= 10 && cleaned.length <= 15;
}

export function formatPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/\D/g, "");

  if (!cleaned.startsWith("91") && cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }

  if (cleaned.length > 15) {
    cleaned = cleaned.slice(-12);
  }

  return cleaned;
}
