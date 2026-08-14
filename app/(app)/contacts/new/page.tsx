"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useContacts, DuplicateMatch } from "@/lib/hooks/useContacts";
import ContactForm from "@/components/contact-form";

export default function NewContact() {
  const router = useRouter();
  const { createContact, checkForDuplicates } = useContacts();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);

    try {
      const matches = await checkForDuplicates(data);

      if (matches.length > 0) {
        setDuplicates(matches);
        setShowDuplicateWarning(true);
        return;
      }

      await createContact(data);
      router.push("/contacts");
    } catch (err) {
      console.error("Failed to create contact:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 mt-6">Add New Contact</h1>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <ContactForm
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
          isSubmitting={isSubmitting}
          showDuplicateWarning={showDuplicateWarning}
          duplicates={duplicates}
        />
      </div>
    </div>
  );
}
