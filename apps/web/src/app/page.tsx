import Link from "next/link";

import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarCheck2,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  Headphones,
  HelpCircle,
  MapPin,
  MapPinned,
  PhoneCall,
  Route,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  UserRoundCheck,
} from "lucide-react";

const benefits = [
  {
    icon: CalendarDays,
    title: "Đặt lịch trực tuyến",
    description:
      "Gửi yêu cầu đặt lịch đăng kiểm xe ngay trên website, không cần tạo tài khoản hay đăng nhập.",
  },
  {
    icon: Clock3,
    title: "Chủ động lựa chọn thời gian",
    description:
      "Xem các khung giờ còn khả dụng và lựa chọn thời gian phù hợp với kế hoạch của bạn.",
  },
  {
    icon: CarFront,
    title: "Hỗ trợ nhận và bàn giao xe",
    description:
      "Có thể đăng ký nhân viên đến nhận xe tại địa chỉ yêu cầu và phối hợp bàn giao sau khi thực hiện.",
  },
  {
    icon: Headphones,
    title: "Hỗ trợ trong quá trình thực hiện",
    description:
      "Theo dõi thông tin lịch hẹn và được hỗ trợ khi cần xác nhận, điều chỉnh yêu cầu.",
  },
];

const steps = [
  {
    number: "01",
    icon: CarFront,
    title: "Cung cấp thông tin xe",
    description:
      "Nhập biển số, loại xe, thông tin phương tiện và số điện thoại liên hệ.",
  },
  {
    number: "02",
    icon: CalendarCheck2,
    title: "Lựa chọn lịch đăng kiểm",
    description:
      "Chọn dịch vụ, trung tâm và khung giờ còn khả dụng trên hệ thống.",
  },
  {
    number: "03",
    icon: ClipboardCheck,
    title: "Gửi yêu cầu đặt lịch",
    description:
      "Xác nhận thông tin, nhận mã booking và chờ phản hồi xác nhận lịch.",
  },
  {
    number: "04",
    icon: UserRoundCheck,
    title: "Nhân viên hỗ trợ thực hiện",
    description:
      "Nhân viên được phân công liên hệ, phối hợp nhận xe và thực hiện dịch vụ theo yêu cầu đã thống nhất.",
  },
];

const faqs = [
  {
    question: "Tôi có cần đăng ký tài khoản để đặt lịch không?",
    answer:
      "Không. Bạn chỉ cần điền thông tin phương tiện, thông tin liên hệ và chọn lịch còn trống để gửi yêu cầu đặt lịch.",
  },
  {
    question: "Có thể yêu cầu nhân viên đến tận nơi nhận xe không?",
    answer:
      "Có. Khi đặt lịch, bạn có thể chọn yêu cầu nhận xe và nhập địa chỉ. Bộ phận phụ trách sẽ liên hệ để xác nhận phương án nhận và bàn giao xe.",
  },
  {
    question: "Gửi yêu cầu có đồng nghĩa với lịch đã được xác nhận không?",
    answer:
      "Chưa. Yêu cầu được hệ thống tiếp nhận trước, sau đó cần được xác nhận theo khả năng phục vụ thực tế và quy trình phối hợp với trung tâm đăng kiểm.",
  },
  {
    question: "Phí đăng kiểm hộ được tính như thế nào?",
    answer:
      "Phí hỗ trợ được hiển thị theo dịch vụ khi bạn đặt lịch. Các khoản phí kiểm định, bảo hiểm hoặc phát sinh nếu có cần được thông báo riêng, rõ ràng trước khi thực hiện.",
  },
  {
    question: "Đăng kiểm hộ có bảo đảm xe đạt kiểm định không?",
    answer:
      "Không. Việc kiểm định và kết luận kết quả thuộc thẩm quyền của đơn vị đăng kiểm theo quy định. Dịch vụ chỉ hỗ trợ các công việc trong phạm vi hợp pháp.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
  center = false,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-blue-700">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
        {eyebrow}
      </span>

      <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default function CustomerHomePage() {
  return (
    <main className="overflow-hidden bg-white">
      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="relative isolate overflow-hidden bg-[#08275a] text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 85% 20%, rgba(37,99,235,.42), transparent 50%), radial-gradient(ellipse at 15% 90%, rgba(14,165,233,.18), transparent 45%)",
          }}
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-[500px] w-[500px] rounded-full border border-white/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-12 top-16 h-[340px] w-[340px] rounded-full border border-white/10"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-blue-100 backdrop-blur">
              <ShieldCheck size={16} />
              Dịch vụ hỗ trợ đăng kiểm xe trực tuyến
            </div>

            <h1 className="mt-7 text-4xl font-extrabold leading-[1.15] tracking-tight sm:text-5xl lg:text-[56px]">
              Đặt lịch đăng kiểm
              <span className="mt-1 block text-[#75bcff]">thuận tiện hơn,</span>
              chủ động hơn.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-blue-100/90">
              Chọn thời gian đăng kiểm phù hợp, gửi yêu cầu trực tuyến và đăng
              ký dịch vụ hỗ trợ nhận xe, đưa xe đến trung tâm đăng kiểm theo
              lịch được xác nhận.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-800 shadow-lg shadow-blue-950/15 transition hover:-translate-y-0.5 hover:bg-blue-50"
              >
                <CalendarCheck2 size={19} />
                Đặt lịch đăng kiểm
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/lookup"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                <Search size={18} />
                Tra cứu lịch đã đặt
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-blue-100">
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-300" />
                Không cần đăng nhập
              </span>
              <span className="inline-flex items-center gap-2">
                <CheckCircle2 size={17} className="text-emerald-300" />
                Chủ động chọn khung giờ
              </span>
            </div>
          </div>

          {/* HERO VISUAL */}
          <div className="relative mx-auto w-full max-w-lg">
            <div className="absolute -inset-5 rounded-[36px] bg-sky-400/10 blur-3xl" />

            <div className="relative overflow-hidden rounded-[28px] border border-white/20 bg-white p-5 text-slate-900 shadow-2xl shadow-black/25 sm:p-7">
              <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                    <CalendarDays size={25} />
                  </div>

                  <div>
                    <p className="text-base font-extrabold text-slate-900">
                      Đặt lịch đăng kiểm
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Các bước đặt lịch trực tuyến
                    </p>
                  </div>
                </div>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  Trực tuyến
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {[
                  {
                    icon: CarFront,
                    title: "Thông tin phương tiện",
                    description: "Biển số, loại xe và thông tin liên hệ",
                  },
                  {
                    icon: MapPinned,
                    title: "Trung tâm và dịch vụ",
                    description: "Lựa chọn địa điểm đăng kiểm",
                  },
                  {
                    icon: CalendarCheck2,
                    title: "Ngày và khung giờ",
                    description: "Chọn lịch còn khả dụng",
                  },
                ].map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-blue-700 shadow-sm">
                        <Icon size={21} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold">{item.title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>
                      </div>

                      <span className="text-xs font-bold text-slate-400">
                        0{index + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              <Link
                href="/booking"
                className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
              >
                Bắt đầu đặt lịch
                <ArrowRight size={18} />
              </Link>

              <p className="mt-4 text-center text-xs text-slate-500">
                Không cần tạo tài khoản
              </p>
            </div>

            <div className="absolute -bottom-5 -left-5 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-3 text-slate-900 shadow-xl sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <ShieldCheck size={22} />
              </div>

              <div>
                <p className="text-sm font-bold">Quy trình minh bạch</p>
                <p className="text-xs text-slate-500">
                  Xác nhận trước khi thực hiện
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* TRUST STRIP */}
      {/* ================================================= */}

      <section className="border-b border-slate-100 bg-slate-50">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-6 sm:grid-cols-3 sm:px-6">
          {[
            {
              icon: BadgeCheck,
              title: "Thông tin rõ ràng",
              text: "Xác nhận lịch và dịch vụ",
            },
            {
              icon: Route,
              title: "Hỗ trợ tận nơi",
              text: "Theo địa chỉ khách yêu cầu",
            },
            {
              icon: PhoneCall,
              title: "Phối hợp trực tiếp",
              text: "Liên hệ trong quá trình hỗ trợ",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-center gap-3 sm:justify-center"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <Icon size={20} />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-900">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500">{item.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================= */}
      {/* BENEFITS */}
      {/* ================================================= */}

      <section className="mx-auto max-w-7xl px-4 py-18 sm:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Tiện ích dịch vụ"
          title="Một cách thuận tiện hơn để đặt lịch đăng kiểm"
          description="Giảm thao tác tìm kiếm lịch và thuận tiện hơn trong việc phối hợp nhận, bàn giao phương tiện."
          center
        />

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;

            return (
              <div
                key={benefit.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-900/5"
              >
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                  <Icon size={25} />
                </div>

                <h3 className="mt-6 text-lg font-bold text-slate-950">
                  {benefit.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================================================= */}
      {/* PROCESS */}
      {/* ================================================= */}

      <section className="bg-[#f5f8fd] py-18 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeading
            eyebrow="Quy trình thực hiện"
            title="Đặt lịch đơn giản chỉ với 4 bước"
            description="Toàn bộ quá trình bắt đầu bằng một yêu cầu trực tuyến. Việc thực hiện sẽ được phối hợp theo lịch đã xác nhận."
            center
          />

          <div className="relative mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Icon size={24} />
                    </div>

                    <span className="text-3xl font-extrabold text-slate-200">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-base font-bold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-7 py-3.5 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              Đặt lịch đăng kiểm ngay
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* PICKUP SERVICE */}
      {/* ================================================= */}

      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-18 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-50 to-sky-100 p-6 sm:p-10">
          <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-blue-200/40 blur-2xl" />

          <div className="relative rounded-2xl border border-blue-100 bg-white p-6 shadow-xl shadow-blue-900/5">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-700 text-white">
                <Truck size={25} />
              </div>

              <div>
                <p className="font-bold text-slate-950">Dịch vụ đăng kiểm hộ</p>
                <p className="mt-1 text-xs text-slate-500">
                  Hỗ trợ nhận và bàn giao xe
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              {[
                "Tiếp nhận thông tin và xác nhận yêu cầu",
                "Thống nhất thời gian, địa điểm nhận xe",
                "Nhân viên tiếp nhận và đưa xe đến trung tâm",
                "Phối hợp bàn giao xe sau khi thực hiện",
              ].map((text) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check size={15} strokeWidth={3} />
                  </div>

                  <p className="text-sm leading-6 text-slate-700">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-3 rounded-xl bg-blue-50 p-4">
              <MapPin size={20} className="shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-blue-900">
                Giai đoạn triển khai ban đầu tập trung tại khu vực Đà Nẵng.
              </p>
            </div>
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Hỗ trợ nhận xe tận nơi"
            title="Bận công việc? Để chúng tôi hỗ trợ đưa xe đi đăng kiểm."
            description="Bạn có thể gửi yêu cầu nhân viên đến địa chỉ nhận xe, phối hợp thực hiện việc đưa xe đến trung tâm đăng kiểm và bàn giao lại xe theo phương án đã thống nhất."
          />

          <div className="mt-7 space-y-4">
            {[
              "Nhập địa chỉ nhận xe khi tạo booking",
              "Nhân viên liên hệ và xác nhận thông tin",
              "Phối hợp bàn giao xe và giấy tờ cần thiết",
              "Theo dõi yêu cầu qua mã đặt lịch",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 text-sm font-medium text-slate-700"
              >
                <CheckCircle2 size={19} className="shrink-0 text-blue-700" />
                {item}
              </div>
            ))}
          </div>

          <Link
            href="/booking"
            className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-blue-700 transition hover:text-blue-900"
          >
            Đăng ký dịch vụ hỗ trợ
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* ================================================= */}
      {/* SERVICE AREA */}
      {/* ================================================= */}

      <section className="border-y border-slate-100 bg-slate-50">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-9 sm:px-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
              <MapPinned size={24} />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Khu vực triển khai dịch vụ
              </h3>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Đăng Kiểm Hộ triển khai giai đoạn đầu tại Đà Nẵng. Các trung tâm
                và khung giờ có thể đặt sẽ hiển thị theo dữ liệu khả dụng trên
                hệ thống.
              </p>
            </div>
          </div>

          <Link
            href="/booking"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300"
          >
            Kiểm tra lịch còn trống
            <ChevronRight size={17} />
          </Link>
        </div>
      </section>

      {/* ================================================= */}
      {/* FAQ */}
      {/* ================================================= */}

      <section className="mx-auto max-w-5xl px-4 py-18 sm:px-6 lg:py-24">
        <SectionHeading
          eyebrow="Giải đáp thắc mắc"
          title="Câu hỏi thường gặp"
          description="Một số thông tin cần biết trước khi gửi yêu cầu đặt lịch đăng kiểm."
          center
        />

        <div className="mt-10 space-y-3">
          {faqs.map((faq) => (
            <details
              key={faq.question}
              className="group rounded-2xl border border-slate-200 bg-white px-5 py-1 transition open:border-blue-200 open:bg-blue-50/30 sm:px-6"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-sm font-bold text-slate-900 marker:hidden sm:text-base [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-3">
                  <HelpCircle size={19} className="shrink-0 text-blue-700" />
                  {faq.question}
                </span>

                <ChevronRight
                  size={20}
                  className="shrink-0 text-slate-400 transition-transform group-open:rotate-90"
                />
              </summary>

              <p className="pb-5 pl-8 text-sm leading-7 text-slate-600">
                {faq.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ================================================= */}
      {/* FINAL CTA */}
      {/* ================================================= */}

      <section className="px-4 pb-16 sm:px-6 lg:pb-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[28px] bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-12 text-white sm:px-12 lg:py-16">
          <div className="absolute -right-20 -top-24 h-80 w-80 rounded-full border-[60px] border-white/5" />

          <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-blue-100">
                <Sparkles size={18} />
                Sẵn sàng đặt lịch?
              </div>

              <h2 className="mt-4 text-3xl font-extrabold leading-tight sm:text-4xl">
                Chủ động hơn với lịch đăng kiểm của bạn.
              </h2>

              <p className="mt-4 text-sm leading-7 text-blue-100 sm:text-base">
                Chỉ cần điền thông tin xe và lựa chọn lịch phù hợp. Không cần
                đăng nhập để gửi yêu cầu.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/booking"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-800 transition hover:bg-blue-50"
              >
                Đặt lịch ngay
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/lookup"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Tra cứu booking
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================= */}
      {/* COMPLIANCE NOTE */}
      {/* ================================================= */}

      <section className="border-t border-slate-100 bg-slate-50 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-7xl items-start gap-3 text-xs leading-6 text-slate-500">
          <FileCheck2 size={18} className="mt-0.5 shrink-0 text-slate-400" />

          <p>
            Đăng Kiểm Hộ cung cấp dịch vụ hỗ trợ tiếp nhận, vận chuyển và phối
            hợp đưa phương tiện đến trung tâm đăng kiểm theo yêu cầu khách hàng.
            Lịch hẹn phụ thuộc vào xác nhận và khả năng tiếp nhận của các bên
            liên quan. Việc kiểm định và kết luận kết quả được thực hiện bởi đơn
            vị có thẩm quyền theo quy định pháp luật.
          </p>
        </div>
      </section>
    </main>
  );
}
