"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "./AdminToast";
import ImageUpload from "./ImageUpload";

interface HeroSlide {
  image: string;
  subtitle: string;
  title: string;
  description: string;
}

interface PromoBanner {
  label: string;
  heading: string;
  paragraph1: string;
  paragraph2: string;
  image: string;
}

interface StorySection {
  label: string;
  heading: string;
  paragraph1: string;
  quote: string;
  image1: string;
  image2: string;
}

interface WhyChooseCard {
  title: string;
  description: string;
}

interface SiteSettings {
  companyName: string;
  tagline: string;
  description: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  phone: string;
  email: string;
  instagram: string;
  tiktok: string;
  facebook: string;
  shopHours: Record<string, { open: number; close: number; closed: boolean }>;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  heroSlides: HeroSlide[];
  promoBanner: PromoBanner;
  storySection: StorySection;
  whyChoose: WhyChooseCard[];
  galleryImages: string[];
  scrollWords: string[];
  updatedAt: string;
  updatedBy: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const DEFAULT_SETTINGS: SiteSettings = {
  companyName: "",
  tagline: "",
  description: "",
  address: "",
  city: "",
  province: "",
  postalCode: "",
  phone: "",
  email: "",
  instagram: "",
  tiktok: "",
  facebook: "",
  shopHours: Object.fromEntries(
    DAY_NAMES.map((_, i) => [String(i), { open: 8, close: 18, closed: false }])
  ),
  heroTitle: "",
  heroSubtitle: "",
  heroDescription: "",
  heroSlides: [],
  promoBanner: { label: "", heading: "", paragraph1: "", paragraph2: "", image: "" },
  storySection: { label: "", heading: "", paragraph1: "", quote: "", image1: "", image2: "" },
  whyChoose: [],
  galleryImages: [],
  scrollWords: [],
  updatedAt: "",
  updatedBy: "",
};

const formatHour = (h: number) => {
  const period = h >= 12 ? "PM" : "AM";
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${period}`;
};

const inputClass =
  "bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-body focus:outline-none focus:border-indigo-500 w-full";

const textareaClass =
  "bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white font-body focus:outline-none focus:border-indigo-500 w-full resize-y min-h-[80px]";

interface SectionProps {
  title: string;
  icon: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({
  title,
  icon,
  children,
  defaultOpen = true,
}: SectionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/[0.02] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">{icon}</span>
          <h3 className="text-white font-body font-semibold text-lg">
            {title}
          </h3>
        </div>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400 text-sm"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 7.5L10 12.5L15 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-slate-900/40 backdrop-blur-sm rounded-2xl border border-white/[0.06] p-6">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-slate-800 rounded w-1/3" />
        <div className="space-y-3">
          <div className="h-9 bg-slate-800 rounded w-full" />
          <div className="h-9 bg-slate-800 rounded w-full" />
          <div className="h-9 bg-slate-800 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export default function SiteSettingsManager() {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (!res.ok) throw new Error("Failed to fetch settings");
        const data = await res.json();
        setSettings({ ...DEFAULT_SETTINGS, ...data });
      } catch (err) {
        console.error("Failed to load settings:", err);
        toast("Failed to load site settings", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [toast]);

  const update = <K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateHour = (
    day: string,
    field: "open" | "close" | "closed",
    value: number | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      shopHours: {
        ...prev.shopHours,
        [day]: {
          ...prev.shopHours[day],
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings");
      }
      const data = await res.json();
      setSettings((prev) => ({
        ...prev,
        updatedAt: data.updatedAt || prev.updatedAt,
        updatedBy: data.updatedBy || prev.updatedBy,
      }));
      toast("Settings saved successfully", "success");
    } catch (err) {
      console.error("Failed to save settings:", err);
      toast(
        err instanceof Error ? err.message : "Failed to save settings",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-6">
          <div className="animate-pulse h-8 bg-slate-800 rounded w-48" />
          <div className="animate-pulse h-10 bg-slate-800 rounded w-32" />
        </div>
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-white font-body font-semibold text-xl">
            Site Settings
          </h2>
          {settings.updatedAt && (
            <p className="text-slate-500 text-xs mt-1">
              Last updated{" "}
              {new Date(settings.updatedAt).toLocaleDateString("en-ZA", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
              {settings.updatedBy && ` by ${settings.updatedBy}`}
            </p>
          )}
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>

      {/* 1. Company Profile */}
      <CollapsibleSection title="Company Profile" icon="&#x1f3e2;">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Company Name
            </label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => update("companyName", e.target.value)}
              placeholder="e.g. Yazol Coffee"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Tagline
            </label>
            <input
              type="text"
              value={settings.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="e.g. Crafted with passion"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Description
            </label>
            <textarea
              value={settings.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="A brief description of your company..."
              rows={3}
              className={textareaClass}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. Contact Information */}
      <CollapsibleSection title="Contact Information" icon="&#x1f4de;">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Address
            </label>
            <input
              type="text"
              value={settings.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Street address"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">
                City
              </label>
              <input
                type="text"
                value={settings.city}
                onChange={(e) => update("city", e.target.value)}
                placeholder="City"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">
                Province
              </label>
              <input
                type="text"
                value={settings.province}
                onChange={(e) => update("province", e.target.value)}
                placeholder="Province"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">
                Postal Code
              </label>
              <input
                type="text"
                value={settings.postalCode}
                onChange={(e) => update("postalCode", e.target.value)}
                placeholder="0000"
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">
                Phone
              </label>
              <input
                type="text"
                value={settings.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+27 12 345 6789"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-slate-400 text-sm mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="hello@yazolcoffee.co.za"
                className={inputClass}
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 3. Social Media */}
      <CollapsibleSection title="Social Media" icon="&#x1f310;">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Instagram URL
            </label>
            <input
              type="url"
              value={settings.instagram}
              onChange={(e) => update("instagram", e.target.value)}
              placeholder="https://instagram.com/yazolcoffee"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              TikTok URL
            </label>
            <input
              type="url"
              value={settings.tiktok}
              onChange={(e) => update("tiktok", e.target.value)}
              placeholder="https://tiktok.com/@yazolcoffee"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Facebook URL
            </label>
            <input
              type="url"
              value={settings.facebook}
              onChange={(e) => update("facebook", e.target.value)}
              placeholder="https://facebook.com/yazolcoffee"
              className={inputClass}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 4. Shop Hours */}
      <CollapsibleSection title="Shop Hours" icon="&#x1f552;">
        <div className="space-y-3">
          {DAY_NAMES.map((dayName, dayIndex) => {
            const dayKey = String(dayIndex);
            const hours = settings.shopHours[dayKey] || {
              open: 8,
              close: 18,
              closed: false,
            };
            return (
              <div
                key={dayKey}
                className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-white/[0.04] last:border-0"
              >
                {/* Day name */}
                <div className="w-28 shrink-0">
                  <span className="text-white text-sm font-medium">{dayName}</span>
                </div>

                {/* Toggle */}
                <button
                  type="button"
                  onClick={() => updateHour(dayKey, "closed", !hours.closed)}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
                    hours.closed ? "bg-slate-700" : "bg-indigo-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                      hours.closed ? "translate-x-1" : "translate-x-6"
                    }`}
                  />
                </button>
                <span
                  className={`text-xs w-14 shrink-0 ${
                    hours.closed ? "text-slate-500" : "text-emerald-400"
                  }`}
                >
                  {hours.closed ? "Closed" : "Open"}
                </span>

                {/* Time inputs */}
                {!hours.closed && (
                  <div className="flex items-center gap-2 flex-1">
                    <div className="flex items-center gap-2">
                      <label className="text-slate-500 text-xs">From</label>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={hours.open}
                        onChange={(e) =>
                          updateHour(
                            dayKey,
                            "open",
                            Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                          )
                        }
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white font-body focus:outline-none focus:border-indigo-500 w-16 text-center"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-slate-500 text-xs">To</label>
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={hours.close}
                        onChange={(e) =>
                          updateHour(
                            dayKey,
                            "close",
                            Math.min(23, Math.max(0, parseInt(e.target.value) || 0))
                          )
                        }
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-sm text-white font-body focus:outline-none focus:border-indigo-500 w-16 text-center"
                      />
                    </div>
                    <span className="text-slate-400 text-xs ml-2 hidden sm:inline">
                      {formatHour(hours.open)} - {formatHour(hours.close)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* 5. Website Content */}
      <CollapsibleSection title="Website Content" icon="&#x1f4bb;">
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Hero Title
            </label>
            <input
              type="text"
              value={settings.heroTitle}
              onChange={(e) => update("heroTitle", e.target.value)}
              placeholder="Main heading for the hero section"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Hero Subtitle
            </label>
            <input
              type="text"
              value={settings.heroSubtitle}
              onChange={(e) => update("heroSubtitle", e.target.value)}
              placeholder="Subtitle text"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">
              Hero Description
            </label>
            <textarea
              value={settings.heroDescription}
              onChange={(e) => update("heroDescription", e.target.value)}
              placeholder="Descriptive paragraph for the hero section..."
              rows={3}
              className={textareaClass}
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 6. Hero Carousel Slides */}
      <CollapsibleSection title="Hero Carousel Slides" icon="&#x1f3a0;">
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Manage the slides shown on the homepage hero carousel. Each slide has an image, subtitle, title, and description.
          </p>

          {(settings.heroSlides || []).map((slide, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Slide {i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const slides = [...(settings.heroSlides || [])];
                    slides.splice(i, 1);
                    update("heroSlides", slides);
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <ImageUpload
                value={slide.image}
                onChange={(url) => {
                  const slides = [...(settings.heroSlides || [])];
                  slides[i] = { ...slides[i], image: url };
                  update("heroSlides", slides);
                }}
                folder="hero"
                label="Slide Image"
              />

              <input
                type="text"
                value={slide.subtitle}
                onChange={(e) => {
                  const slides = [...(settings.heroSlides || [])];
                  slides[i] = { ...slides[i], subtitle: e.target.value };
                  update("heroSlides", slides);
                }}
                placeholder="Subtitle (e.g. Welcome to)"
                className={inputClass}
              />
              <input
                type="text"
                value={slide.title}
                onChange={(e) => {
                  const slides = [...(settings.heroSlides || [])];
                  slides[i] = { ...slides[i], title: e.target.value };
                  update("heroSlides", slides);
                }}
                placeholder="Title (e.g. Yazol Coffee)"
                className={inputClass}
              />
              <input
                type="text"
                value={slide.description}
                onChange={(e) => {
                  const slides = [...(settings.heroSlides || [])];
                  slides[i] = { ...slides[i], description: e.target.value };
                  update("heroSlides", slides);
                }}
                placeholder="Description"
                className={inputClass}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const slides = [...(settings.heroSlides || []), { image: "", subtitle: "", title: "", description: "" }];
              update("heroSlides", slides);
            }}
            className="w-full py-2.5 border border-dashed border-slate-700 rounded-lg text-sm text-indigo-400 hover:bg-slate-800/40 transition-colors"
          >
            + Add Slide
          </button>
        </div>
      </CollapsibleSection>

      {/* 7. Promo Banner */}
      <CollapsibleSection title="Promo Banner" icon="&#x1f4e3;" defaultOpen={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Label</label>
            <input
              type="text"
              value={settings.promoBanner.label}
              onChange={(e) =>
                update("promoBanner", { ...settings.promoBanner, label: e.target.value })
              }
              placeholder="e.g. Special Offer"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Heading</label>
            <input
              type="text"
              value={settings.promoBanner.heading}
              onChange={(e) =>
                update("promoBanner", { ...settings.promoBanner, heading: e.target.value })
              }
              placeholder="Banner heading"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Paragraph 1</label>
            <textarea
              value={settings.promoBanner.paragraph1}
              onChange={(e) =>
                update("promoBanner", { ...settings.promoBanner, paragraph1: e.target.value })
              }
              placeholder="First paragraph..."
              rows={3}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Paragraph 2</label>
            <textarea
              value={settings.promoBanner.paragraph2}
              onChange={(e) =>
                update("promoBanner", { ...settings.promoBanner, paragraph2: e.target.value })
              }
              placeholder="Second paragraph..."
              rows={3}
              className={textareaClass}
            />
          </div>
          <ImageUpload
            value={settings.promoBanner.image}
            onChange={(url) =>
              update("promoBanner", { ...settings.promoBanner, image: url })
            }
            folder="promo"
            label="Promo Image"
          />
        </div>
      </CollapsibleSection>

      {/* 8. Story Section */}
      <CollapsibleSection title="Story Section" icon="&#x1f4d6;" defaultOpen={false}>
        <div className="space-y-4">
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Label</label>
            <input
              type="text"
              value={settings.storySection.label}
              onChange={(e) =>
                update("storySection", { ...settings.storySection, label: e.target.value })
              }
              placeholder="e.g. Our Story"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Heading</label>
            <input
              type="text"
              value={settings.storySection.heading}
              onChange={(e) =>
                update("storySection", { ...settings.storySection, heading: e.target.value })
              }
              placeholder="Section heading"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Paragraph</label>
            <textarea
              value={settings.storySection.paragraph1}
              onChange={(e) =>
                update("storySection", { ...settings.storySection, paragraph1: e.target.value })
              }
              placeholder="Tell your story..."
              rows={4}
              className={textareaClass}
            />
          </div>
          <div>
            <label className="block text-slate-400 text-sm mb-1.5">Quote</label>
            <textarea
              value={settings.storySection.quote}
              onChange={(e) =>
                update("storySection", { ...settings.storySection, quote: e.target.value })
              }
              placeholder="An inspiring quote..."
              rows={2}
              className={textareaClass}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ImageUpload
              value={settings.storySection.image1}
              onChange={(url) =>
                update("storySection", { ...settings.storySection, image1: url })
              }
              folder="story"
              label="Image 1"
            />
            <ImageUpload
              value={settings.storySection.image2}
              onChange={(url) =>
                update("storySection", { ...settings.storySection, image2: url })
              }
              folder="story"
              label="Image 2"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 9. Why Choose Us */}
      <CollapsibleSection title="Why Choose Us" icon="&#x2b50;" defaultOpen={false}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Add cards that highlight why customers should choose you.
          </p>

          {(settings.whyChoose || []).map((card, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Card {i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const cards = [...(settings.whyChoose || [])];
                    cards.splice(i, 1);
                    update("whyChoose", cards);
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <input
                type="text"
                value={card.title}
                onChange={(e) => {
                  const cards = [...(settings.whyChoose || [])];
                  cards[i] = { ...cards[i], title: e.target.value };
                  update("whyChoose", cards);
                }}
                placeholder="Card title"
                className={inputClass}
              />
              <textarea
                value={card.description}
                onChange={(e) => {
                  const cards = [...(settings.whyChoose || [])];
                  cards[i] = { ...cards[i], description: e.target.value };
                  update("whyChoose", cards);
                }}
                placeholder="Card description..."
                rows={2}
                className={textareaClass}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const cards = [...(settings.whyChoose || []), { title: "", description: "" }];
              update("whyChoose", cards);
            }}
            className="w-full py-2.5 border border-dashed border-slate-700 rounded-lg text-sm text-indigo-400 hover:bg-slate-800/40 transition-colors"
          >
            + Add Card
          </button>
        </div>
      </CollapsibleSection>

      {/* 10. Gallery Images */}
      <CollapsibleSection title="Gallery Images" icon="&#x1f5bc;" defaultOpen={false}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Upload images for the gallery section.
          </p>

          {(settings.galleryImages || []).map((url, i) => (
            <div key={i} className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">Image {i + 1}</span>
                <button
                  type="button"
                  onClick={() => {
                    const imgs = [...(settings.galleryImages || [])];
                    imgs.splice(i, 1);
                    update("galleryImages", imgs);
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <ImageUpload
                value={url}
                onChange={(newUrl) => {
                  const imgs = [...(settings.galleryImages || [])];
                  imgs[i] = newUrl;
                  update("galleryImages", imgs);
                }}
                folder="gallery"
                label={`Gallery Image ${i + 1}`}
              />
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const imgs = [...(settings.galleryImages || []), ""];
              update("galleryImages", imgs);
            }}
            className="w-full py-2.5 border border-dashed border-slate-700 rounded-lg text-sm text-indigo-400 hover:bg-slate-800/40 transition-colors"
          >
            + Add Image
          </button>
        </div>
      </CollapsibleSection>

      {/* 11. Scroll Marquee Words */}
      <CollapsibleSection title="Scroll Marquee Words" icon="&#x1f4ac;" defaultOpen={false}>
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Words that scroll across the marquee banner.
          </p>

          {(settings.scrollWords || []).map((word, i) => (
            <div key={i} className="flex items-center gap-3">
              <input
                type="text"
                value={word}
                onChange={(e) => {
                  const words = [...(settings.scrollWords || [])];
                  words[i] = e.target.value;
                  update("scrollWords", words);
                }}
                placeholder={`Word ${i + 1}`}
                className={inputClass}
              />
              <button
                type="button"
                onClick={() => {
                  const words = [...(settings.scrollWords || [])];
                  words.splice(i, 1);
                  update("scrollWords", words);
                }}
                className="text-red-400 hover:text-red-300 p-1 shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() => {
              const words = [...(settings.scrollWords || []), ""];
              update("scrollWords", words);
            }}
            className="w-full py-2.5 border border-dashed border-slate-700 rounded-lg text-sm text-indigo-400 hover:bg-slate-800/40 transition-colors"
          >
            + Add Word
          </button>
        </div>
      </CollapsibleSection>

      {/* Bottom save button for long forms */}
      <div className="flex justify-end pt-2 pb-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <svg
                className="animate-spin h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
