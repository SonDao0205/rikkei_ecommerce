import React from "react";
import type { UserProfileDetails } from "../../types/ecommerce";

interface ProfileContactSectionProps {
  profile: UserProfileDetails | null;
}

interface ContactChannel {
  id: string;
  label: string;
  icon: string;
  value: string;
  isVerified: boolean;
  description: string;
}

export const ProfileContactSection: React.FC<ProfileContactSectionProps> = ({
  profile,
}) => {
  const contactChannels: ContactChannel[] = [
    {
      id: "email",
      label: "Email Address",
      icon: "mail",
      value: profile?.email || "nguyen.vana@marketpulse.vn",
      isVerified: Boolean(profile?.email_verified),
      description: "Receives receipts, order notifications, and security alerts.",
    },
    {
      id: "phone",
      label: "Phone Number",
      icon: "call",
      value: profile?.phone || "+84 0909 123 456",
      isVerified: Boolean(profile?.phone_verified ?? true),
      description: "Used for courier delivery calls, OTP verifications, and COD.",
    },
  ];

  return (
    <section
      id="contact-verification"
      className="bg-surface-container-lowest rounded-2xl shadow-sm p-6 sm:p-8 space-y-6 border border-outline-variant/30"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-surface-container">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed text-on-secondary-fixed flex items-center justify-center shrink-0 shadow-sm">
            <span className="material-symbols-outlined text-[22px]">
              mark_email_read
            </span>
          </div>
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              Contact Channels
            </h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Secured channels used for OTP transaction authorizations and delivery updates.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of contact cards rendered via .map() */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contactChannels.map((channel) => (
          <div
            key={channel.id}
            className="p-5 rounded-2xl border border-outline-variant bg-surface-container-lowest flex flex-col justify-between gap-4 hover:border-primary-container/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-label-md text-label-md font-bold text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-outline text-[18px]">
                    {channel.icon}
                  </span>
                  <span>{channel.label}</span>
                </span>
                {channel.isVerified ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="material-symbols-outlined text-[13px]">
                      verified
                    </span>
                    Verified
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                    Unverified
                  </span>
                )}
              </div>
              <p className="font-body-md text-body-md text-on-surface font-semibold">
                {channel.value}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                {channel.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProfileContactSection;
