import Image from "next/image";
import Link from "next/link";
import styles from "./Hero.module.css";

export default function Hero() {
  return (
    <div>
      <section className="w-full bg-tenton-bg">
        <div className="relative mx-auto w-full aspect-[16/9] min-[2600px]:aspect-[26/9] overflow-hidden">
          <Image
            src="/tenton_main.png"
            alt="Tenton"
            fill
            priority
            sizes="100vw"
            className="object-cover min-[2600px]:object-[10%_80%]"
          />

          <div className={`${styles.steam} ${styles.steam1}`} />
          <div className={`${styles.steam} ${styles.steam2}`} />

          <div className="absolute inset-0 flex items-start justify-center px-4 pt-[clamp(28px,8.5vw,180px)]">
            <div className="w-full text-center flex flex-col gap-[clamp(10px,1.6vw,60px)]">
              <h1
                className="
                  font-averia-serif text-tenton-brown 
                  text-[clamp(20px,5vw,80px)]
                  leading-[1.08]
                  z-5
                "
              >
                Slow-Simmered <span className="text-tenton-red">Ramen</span>
                <br />
                Crispy, Golden <span className="text-tenton-red">Tonkatsu</span>
              </h1>

              <p
                className="
                  font-averia text-tenton-brown/90
                  text-[clamp(10px,2vw,40px)]
                  leading-[1.35]
                  px-20 sm:px-0
                "
              >
                A cozy neighborhood Japanese restaurant in West Vancouver
              </p>

              <div className="hidden sm:flex flex-col sm:flex-row items-center justify-center gap-4 lg:pt-10">
                <Link
                  href="/order"
                  className="
                  flex items-center justify-center rounded-full
                  border-2 border-tenton-red bg-tenton-red text-white font-semibold
                  h-[clamp(44px,4.5vw,64px)]
                  min-w-[clamp(160px,18vw,240px)]
                  px-[clamp(20px,3vw,36px)]
                  text-[clamp(16px,1.4vw,24px)]
                  leading-none
                  transition-colors duration-200
                  hover:bg-white hover:text-tenton-red
    "
                >
                  Order Online
                </Link>

                <Link
                  href="/reservation"
                  className="
                  flex items-center justify-center rounded-full
                  border-2 border-tenton-brown text-tenton-brown font-semibold
                  h-[clamp(44px,4.5vw,64px)]
                  min-w-[clamp(160px,18vw,240px)]
                  px-[clamp(20px,3vw,36px)]
                  text-[clamp(16px,1.4vw,24px)]
                  leading-none
                  transition-colors duration-200
                  hover:bg-tenton-brown hover:text-white
    "
                >
                  Reservation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="sm:hidden w-full px-4 mt-6 mb-6">
        <div className="mx-auto max-w-md flex flex-col gap-3">
          <Link
            href="/order"
            className="w-full rounded-full bg-tenton-red text-white py-3 text-center font-medium text-[clamp(15px,4vw,18px)]"
          >
            Order Online
          </Link>

          <Link
            href="/reservation"
            className="w-full rounded-full border border-tenton-brown text-tenton-brown py-3 text-center font-medium text-[clamp(15px,4vw,18px)]"
          >
            Reservation
          </Link>
        </div>
      </div>
    </div>
  );
}
