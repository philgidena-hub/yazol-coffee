import type { Metadata } from "next";
import ContactContent from "@/components/contact/ContactContent";

export const metadata: Metadata = {
  title: "Contact — Yazol Coffee",
  description:
    "Visit us at 2857 Danforth Ave, Toronto. Call (416) 690-5423 or email yazolcoffee@gmail.com. Open Mon-Fri 8am-6pm, Sat-Sun 9am-5pm.",
};

export default function ContactPage() {
  return <ContactContent />;
}
