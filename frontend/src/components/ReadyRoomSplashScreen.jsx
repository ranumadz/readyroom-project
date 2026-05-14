export default function ReadyRoomSplashScreen() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-[#08111f] text-white">
      <style>
        {`
          @keyframes readyroomSplashBar {
            0% {
              transform: translateX(-105%);
            }
            45% {
              transform: translateX(-10%);
            }
            100% {
              transform: translateX(105%);
            }
          }

          @keyframes readyroomSplashFloat {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-7px) scale(1.015);
            }
          }

          @keyframes readyroomSplashGlow {
            0%, 100% {
              opacity: 0.28;
              transform: scale(1);
            }
            50% {
              opacity: 0.46;
              transform: scale(1.08);
            }
          }
        `}
      </style>

      {/* dekorasi background ala mobile */}
      <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-red-500/35 blur-3xl md:h-72 md:w-72" />
      <div className="pointer-events-none absolute -left-20 bottom-[-90px] h-56 w-56 rounded-full bg-red-400/25 blur-3xl md:h-80 md:w-80" />

      <div className="pointer-events-none absolute right-[-46px] top-[-52px] h-32 w-32 rounded-full bg-red-500/35 md:h-52 md:w-52" />
      <div className="pointer-events-none absolute bottom-[-45px] left-[-38px] h-36 w-36 rounded-full bg-red-500/25 md:h-56 md:w-56" />

      <div className="relative mx-auto flex w-full max-w-[360px] flex-col items-center px-6 text-center">
        <div
          className="absolute inset-x-10 top-8 h-28 rounded-full bg-red-500/20 blur-3xl"
          style={{ animation: "readyroomSplashGlow 2.2s ease-in-out infinite" }}
        />

        <div
          className="relative flex flex-col items-center"
          style={{ animation: "readyroomSplashFloat 2.8s ease-in-out infinite" }}
        >
          <div className="relative flex h-[74px] w-[74px] items-center justify-center rounded-[24px] bg-white shadow-[0_24px_70px_rgba(239,68,68,0.24)] md:h-[86px] md:w-[86px] md:rounded-[28px]">
            <div className="absolute inset-0 rounded-[24px] border border-white/70 md:rounded-[28px]" />

            <img
              src="/logo.png"
              alt="ReadyRoom"
              className="h-12 w-12 object-contain md:h-14 md:w-14"
              draggable={false}
            />
          </div>

          <h1 className="mt-5 text-[27px] font-black tracking-tight text-white md:text-[34px]">
            ReadyRoom
          </h1>

          <p className="mt-2 max-w-[280px] text-[11px] font-medium leading-relaxed text-white/78 md:text-sm">
            Booking Transit & Full Day lebih cepat
          </p>
        </div>

        <div className="mt-6 w-[145px] overflow-hidden rounded-full bg-white/12 p-[2px] md:mt-7 md:w-[170px]">
          <div className="relative h-[4px] overflow-hidden rounded-full bg-white/12">
            <div
              className="absolute inset-y-0 left-0 w-[72%] rounded-full bg-gradient-to-r from-red-500 via-white to-red-400"
              style={{ animation: "readyroomSplashBar 1.45s ease-in-out infinite" }}
            />
          </div>
        </div>

        <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/38 md:text-[11px]">
          Menyiapkan pengalaman terbaik
        </p>
      </div>
    </div>
  );
}