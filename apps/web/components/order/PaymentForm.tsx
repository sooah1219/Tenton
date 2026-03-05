"use client";

import Button from "@/components/ui/CtaButton";
import { useMemo, useState, type FormEvent } from "react";

type PayMethod = "store" | "card";

function formatCardNumber(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function cardDigits(raw: string) {
  return raw.replace(/\D/g, "");
}

function formatExp(raw: string) {
  const digits = raw.replace(/\D/g, "").slice(0, 4); // MMYY
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function luhnCheck(num: string) {
  // num: digits only
  let sum = 0;
  let doubleIt = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (doubleIt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    doubleIt = !doubleIt;
  }
  return sum % 10 === 0;
}

export default function PaymentForm({
  firstName,
  lastName,
  phone,
  email,
  note,
  payMethod,
  setFirstName,
  setLastName,
  setPhone,
  setEmail,
  setNote,
  setPayMethod,
  onPlaceOrder,
  disabled,
}: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  note: string;
  payMethod: PayMethod;
  setFirstName: (v: string) => void;
  setLastName: (v: string) => void;
  setPhone: (v: string) => void;
  setEmail: (v: string) => void;
  setNote: (v: string) => void;
  setPayMethod: (v: PayMethod) => void;
  onPlaceOrder: () => void;
  disabled: boolean;
}) {
  const [touched, setTouched] = useState({
    firstName: false,
    lastName: false,
    phone: false,
    email: false,
    cardNumber: false,
    cardExp: false,
    cardCvc: false,
  });

  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const errors = useMemo(() => {
    const e: Record<string, string> = {};

    if (!firstName.trim()) e.firstName = "First name is required.";
    if (!lastName.trim()) e.lastName = "Last name is required.";

    if (!phone.trim()) {
      e.phone = "Phone number is required.";
    } else if (!/^[0-9+()\-.\s]{7,}$/.test(phone.trim())) {
      e.phone = "Please enter a valid phone number.";
    }

    if (!email.trim()) {
      e.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = "Please enter a valid email address.";
    }

    if (payMethod === "card") {
      const digits = cardDigits(cardNumber);

      if (!digits) {
        e.cardNumber = "Card number is required.";
      } else if (digits.length < 13 || digits.length > 19) {
        e.cardNumber = "Card number must be 13–19 digits.";
      } else if (!luhnCheck(digits)) {
        e.cardNumber = "Card number is invalid.";
      }

      const exp = cardExp.trim();
      if (!exp) {
        e.cardExp = "Expiry date is required.";
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(exp)) {
        e.cardExp = "Expiry must be MM/YY.";
      } else {
        const [mmStr, yyStr] = exp.split("/");
        const mm = Number(mmStr);
        const yy = Number(yyStr);

        const now = new Date();
        const currentYY = now.getFullYear() % 100;
        const currentMM = now.getMonth() + 1;

        if (yy < currentYY || (yy === currentYY && mm < currentMM)) {
          e.cardExp = "Card is expired.";
        }
      }

      const cvc = cardCvc.replace(/\D/g, "");
      if (!cvc) {
        e.cardCvc = "CVC is required.";
      } else if (cvc.length < 3 || cvc.length > 4) {
        e.cardCvc = "CVC must be 3–4 digits.";
      }
    }

    return e as {
      firstName?: string;
      lastName?: string;
      phone?: string;
      email?: string;
      cardNumber?: string;
      cardExp?: string;
      cardCvc?: string;
    };
  }, [
    firstName,
    lastName,
    phone,
    email,
    payMethod,
    cardNumber,
    cardExp,
    cardCvc,
  ]);

  const isValid =
    !errors.firstName &&
    !errors.lastName &&
    !errors.phone &&
    !errors.email &&
    !errors.cardNumber &&
    !errors.cardExp &&
    !errors.cardCvc;

  function onSubmit(e: FormEvent) {
    e.preventDefault();

    setTouched({
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
      cardNumber: true,
      cardExp: true,
      cardCvc: true,
    });

    if (disabled || !isValid) return;
    onPlaceOrder();
  }

  const inputBase =
    "w-full rounded-xl border px-3 py-2 outline-none focus:border-tenton-brown placeholder:text-xs";
  const okBorder = "border-black/10";
  const errBorder = "border-tenton-red";

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit} noValidate>
      {/* Personal */}
      <div className="flex flex-col gap-4 rounded-2xl bg-white border border-black/10 shadow-sm p-5">
        <div className="font-semibold text-black/70">Personal Information</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-black/60">
              First name <span className="text-tenton-red">*</span>
            </span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
              className={[
                inputBase,
                touched.firstName && errors.firstName ? errBorder : okBorder,
              ].join(" ")}
            />
            {touched.firstName && errors.firstName && (
              <span className="text-[11px] text-tenton-red">
                {errors.firstName}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-black/60">
              Last name <span className="text-tenton-red">*</span>
            </span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
              className={[
                inputBase,
                touched.lastName && errors.lastName ? errBorder : okBorder,
              ].join(" ")}
            />
            {touched.lastName && errors.lastName && (
              <span className="text-[11px] text-tenton-red">
                {errors.lastName}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-black/60">
              Phone number <span className="text-tenton-red">*</span>
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, phone: true }))}
              placeholder="(604) 123-4567"
              className={[
                inputBase,
                touched.phone && errors.phone ? errBorder : okBorder,
              ].join(" ")}
            />
            {touched.phone && errors.phone && (
              <span className="text-[11px] text-tenton-red">
                {errors.phone}
              </span>
            )}
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="text-black/60">
              Email <span className="text-tenton-red">*</span>
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched((t) => ({ ...t, email: true }))}
              className={[
                inputBase,
                touched.email && errors.email ? errBorder : okBorder,
              ].join(" ")}
            />
            {touched.email && errors.email && (
              <span className="text-[11px] text-tenton-red">
                {errors.email}
              </span>
            )}
          </label>
        </div>
      </div>

      {/* Other */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white border border-black/10 shadow-sm p-5">
        <div className="font-semibold text-black/70">Other Information</div>
        <span className="text-sm text-black/60">
          Special instruction (Optional)
        </span>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Any allergies, note .."
          rows={4}
          className="w-full rounded-xl border border-black/10 bg-[#fbfaf8] px-3 py-2 outline-none focus:border-tenton-brown placeholder:text-xs"
        />
      </div>

      {/* Payment */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white border border-black/10 shadow-sm p-5">
        <div className="font-semibold text-black/70">
          Choose a payment method
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={payMethod === "store"}
              onChange={() => setPayMethod("store")}
            />
            <span>Pay at Store</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="radio"
              checked={payMethod === "card"}
              onChange={() => setPayMethod("card")}
            />
            <span>Credit Card</span>
          </label>
        </div>

        {payMethod === "card" && (
          <div className="flex flex-col gap-3 rounded-xl bg-[#fbfaf8] border border-black/10 p-4">
            <div className="text-sm font-semibold text-black/70">
              Payment information
            </div>

            <label className="flex flex-col gap-1">
              <input
                placeholder="Card number"
                value={cardNumber}
                onChange={(e) =>
                  setCardNumber(formatCardNumber(e.target.value))
                }
                onBlur={() => setTouched((t) => ({ ...t, cardNumber: true }))}
                inputMode="numeric"
                autoComplete="cc-number"
                className={[
                  inputBase,
                  touched.cardNumber && errors.cardNumber
                    ? errBorder
                    : okBorder,
                ].join(" ")}
              />
              {touched.cardNumber && errors.cardNumber && (
                <span className="text-[11px] text-tenton-red">
                  {errors.cardNumber}
                </span>
              )}
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <input
                  placeholder="MM/YY"
                  value={cardExp}
                  onChange={(e) => setCardExp(formatExp(e.target.value))}
                  onBlur={() => setTouched((t) => ({ ...t, cardExp: true }))}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  className={[
                    inputBase,
                    touched.cardExp && errors.cardExp ? errBorder : okBorder,
                  ].join(" ")}
                />
                {touched.cardExp && errors.cardExp && (
                  <span className="text-[11px] text-tenton-red">
                    {errors.cardExp}
                  </span>
                )}
              </label>

              <label className="flex flex-col gap-1">
                <input
                  placeholder="CVC"
                  value={cardCvc}
                  onChange={(e) =>
                    setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))
                  }
                  onBlur={() => setTouched((t) => ({ ...t, cardCvc: true }))}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  className={[
                    inputBase,
                    touched.cardCvc && errors.cardCvc ? errBorder : okBorder,
                  ].join(" ")}
                />
                {touched.cardCvc && errors.cardCvc && (
                  <span className="text-[11px] text-tenton-red">
                    {errors.cardCvc}
                  </span>
                )}
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Place order */}
      <Button
        type="submit"
        disabled={disabled}
        size="md"
        variant={disabled ? "ghost" : "primary"}
        className="w-full"
      >
        Place Order
      </Button>
    </form>
  );
}
