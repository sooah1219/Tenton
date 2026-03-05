"use client";
import { ChevronDown } from "lucide-react";

export type PersonalInfo = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  partySize: number | "";
  note: string;
};

export type Errors = Partial<Record<keyof PersonalInfo, string>>;

export default function PersonalInfoForm({
  form,
  setForm,
  errors,
  setErrors,
}: {
  form: PersonalInfo;
  setForm: React.Dispatch<React.SetStateAction<PersonalInfo>>;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
}) {
  const inputBase =
    "mt-1 w-full h-10 rounded-xl border px-3 text-sm focus:outline-none focus:ring-2";
  const inputOk = "border-black/10 focus:ring-tenton-brown/30";
  const inputErr = "border-tenton-red focus:ring-tenton-red/25";

  const setField = <K extends keyof PersonalInfo>(
    key: K,
    value: PersonalInfo[K]
  ) => {
    setForm((p) => ({ ...p, [key]: value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <div className="rounded-2xl bg-white border border-black/10 p-5">
      <div className="text-sm font-semibold text-black/70 mb-4">
        Personal Information
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* First name */}
        <div>
          <label className="text-[12px] font-medium text-black/60">
            First name <span className="text-tenton-red">*</span>
          </label>
          <input
            required
            value={form.firstName}
            onChange={(e) => setField("firstName", e.target.value)}
            className={[inputBase, errors.firstName ? inputErr : inputOk].join(
              " "
            )}
          />
          {errors.firstName ? (
            <div className="mt-1 text-[11px] text-tenton-red">
              {errors.firstName}
            </div>
          ) : null}
        </div>

        {/* Last name */}
        <div>
          <label className="text-[12px] font-medium text-black/60">
            Last name <span className="text-tenton-red">*</span>
          </label>
          <input
            required
            value={form.lastName}
            onChange={(e) => setField("lastName", e.target.value)}
            className={[inputBase, errors.lastName ? inputErr : inputOk].join(
              " "
            )}
          />
          {errors.lastName ? (
            <div className="mt-1 text-[11px] text-tenton-red">
              {errors.lastName}
            </div>
          ) : null}
        </div>

        {/* Phone */}
        <div>
          <label className="text-[12px] font-medium text-black/60">
            Phone number <span className="text-tenton-red">*</span>
          </label>
          <input
            required
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className={[inputBase, errors.phone ? inputErr : inputOk].join(" ")}
            placeholder="(604) 123-4567"
            inputMode="tel"
          />
          {errors.phone ? (
            <div className="mt-1 text-[11px] text-tenton-red">
              {errors.phone}
            </div>
          ) : null}
        </div>

        {/* Email */}
        <div>
          <label className="text-[12px] font-medium text-black/60">
            Email <span className="text-tenton-red">*</span>
          </label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setField("email", e.target.value)}
            className={[inputBase, errors.email ? inputErr : inputOk].join(" ")}
            inputMode="email"
            autoComplete="email"
          />
          {errors.email ? (
            <div className="mt-1 text-[11px] text-tenton-red">
              {errors.email}
            </div>
          ) : null}
        </div>

        {/* Party size */}
        <div>
          <label className="text-[12px] font-medium text-black/60">
            Number of guests <span className="text-tenton-red">*</span>
          </label>

          <div className="relative">
            <select
              required
              value={form.partySize === "" ? "" : String(form.partySize)}
              onChange={(e) => {
                const raw = e.target.value;
                setField("partySize", raw === "" ? "" : Number(raw));
              }}
              className={[
                inputBase,
                "appearance-none pr-10",
                errors.partySize ? inputErr : inputOk,
              ].join(" ")}
            >
              <option value="">Select</option>
              {Array.from({ length: 11 }).map((_, i) => (
                <option key={i + 1} value={String(i + 1)}>
                  {i + 1}
                </option>
              ))}
            </select>

            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
              <ChevronDown size={18} />
            </div>
          </div>

          {errors.partySize && (
            <div className="mt-1 text-[11px] text-tenton-red">
              {errors.partySize}
            </div>
          )}
        </div>
      </div>

      {/* Note */}
      <div className="mt-4">
        <label className="text-[12px] font-medium text-black/60">
          Special instruction (Optional)
        </label>
        <textarea
          value={form.note}
          onChange={(e) => setField("note", e.target.value)}
          className="mt-1 w-full min-h-[110px] rounded-xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-tenton-brown/30"
          placeholder="Any allergies, notes..."
        />
      </div>
    </div>
  );
}
