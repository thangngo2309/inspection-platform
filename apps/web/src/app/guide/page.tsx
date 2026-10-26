import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarCheck2,
  CalendarDays,
  CarFront,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  FileText,
  HelpCircle,
  Info,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Hướng dẫn đặt lịch đăng kiểm | Đăng Kiểm Hộ",
  description:
    "Hướng dẫn đặt lịch đăng kiểm xe, đăng ký dịch vụ nhận xe và tra cứu trạng thái booking tại Đăng Kiểm Hộ.",
};

const bookingSteps = [
  {
    number: "01",
    icon: CarFront,
    title: "Nhập thông tin phương tiện",
    description:
      "Cung cấp biển số, loại xe và các thông tin phương tiện theo biểu mẫu. Kiểm tra dữ liệu trước khi tiếp tục.",
    details: [
      "Biển số xe và loại xe",
      "Hãng xe, dòng xe, năm sản xuất nếu có",
      "Thông tin đăng kiểm và bảo hiểm nếu có",
    ],
  },
  {
    number: "02",
    icon: UserRound,
    title: "Nhập thông tin liên hệ",
    description:
      "Điền họ tên, số điện thoại và email nếu có để bộ phận phụ trách liên hệ xác nhận.",
    details: [
      "Họ và tên người liên hệ",
      "Số điện thoại đang sử dụng",
      "Email không bắt buộc",
    ],
  },
  {
    number: "03",
    icon: CalendarDays,
    title: "Chọn dịch vụ và lịch hẹn",
    description:
      "Chọn dịch vụ, trung tâm đăng kiểm, ngày thực hiện và khung giờ còn khả dụng.",
    details: [
      "Chọn dịch vụ cần sử dụng",
      "Chọn trung tâm và ngày đăng kiểm",
      "Chọn khung giờ còn suất",
    ],
  },
  {
    number: "04",
    icon: ClipboardCheck,
    title: "Gửi yêu cầu đặt lịch",
    description:
      "Kiểm tra lại các thông tin, nhấn Xác nhận đặt lịch và lưu mã booking được hệ thống cung cấp.",
    details: [
      "Kiểm tra thông tin đã nhập",
      "Xác nhận gửi yêu cầu",
      "Lưu mã booking để tra cứu",
    ],
  },
];

const lookupSteps = [
  "Truy cập trang Tra cứu lịch đăng kiểm.",
  "Nhập chính xác mã booking đã nhận sau khi đặt lịch.",
  "Nhập số điện thoại liên hệ đã sử dụng khi tạo booking.",
  "Nhấn Tra cứu lịch đăng kiểm để xem kết quả.",
];

const statuses = [
  {
    code: "pending_confirmation",
    label: "Chờ xác nhận",
    description: "Hệ thống đã ghi nhận yêu cầu. Lịch đang chờ được xác nhận.",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    code: "confirmed",
    label: "Đã xác nhận",
    description: "Lịch hẹn đã được xác nhận trên hệ thống.",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  {
    code: "assigned",
    label: "Đã phân công",
    description: "Đã có nhân viên được phân công phụ trách booking.",
    className: "bg-indigo-50 text-indigo-800 border-indigo-200",
  },
  {
    code: "in_progress",
    label: "Đang thực hiện",
    description: "Dịch vụ đang trong quá trình thực hiện.",
    className: "bg-sky-50 text-sky-800 border-sky-200",
  },
  {
    code: "completed",
    label: "Hoàn thành",
    description:
      "Công việc hỗ trợ của booking đã hoàn tất. Trạng thái này không đồng nghĩa xe đạt kiểm định.",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  {
    code: "cancelled",
    label: "Đã hủy",
    description: "Yêu cầu đặt lịch đã được hủy và không tiếp tục thực hiện.",
    className: "bg-red-50 text-red-800 border-red-200",
  },
  {
    code: "rejected",
    label: "Đã từ chối",
    description: "Yêu cầu không được tiếp nhận để thực hiện theo lịch đã gửi.",
    className: "bg-red-50 text-red-800 border-red-200",
  },
];

const faqs = [
  {
    question: "Tôi có cần đăng ký tài khoản để đặt lịch không?",
    answer:
      "Không. Bạn có thể đặt lịch trực tiếp trên website bằng cách nhập thông tin xe, người liên hệ và lựa chọn khung giờ phù hợp.",
  },
  {
    question: "Tại sao không thấy khung giờ còn trống?",
    answer:
      "Có thể trung tâm chưa công bố khung giờ phù hợp, lịch đã đóng nhận hoặc không còn đủ năng lực nhân viên phụ trách. Bạn có thể thử chọn ngày hoặc trung tâm khác.",
  },
  {
    question: "Đặt lịch thành công có phải là lịch đã được xác nhận?",
    answer:
      "Chưa. Sau khi gửi yêu cầu, hệ thống ghi nhận booking và giữ suất theo quy tắc hiện hành. Lịch cần tiếp tục được xác nhận theo quy trình điều phối.",
  },
  {
    question: "Có thể yêu cầu nhân viên nhận xe tận nơi không?",
    answer:
      "Có. Trong biểu mẫu đặt lịch, bạn chọn Yêu cầu nhân viên đến nhận xe và nhập địa chỉ nhận. Việc tiếp nhận thực tế sẽ được liên hệ và thống nhất trước.",
  },
  {
    question: "Tôi cần chuẩn bị giấy tờ gì?",
    answer:
      "Bạn nên chuẩn bị giấy tờ liên quan đến phương tiện, hồ sơ kiểm định và các chứng từ cần thiết theo trường hợp cụ thể. Nhân viên sẽ trao đổi danh mục cần bàn giao trước khi nhận xe.",
  },
  {
    question: "Tôi tra cứu booking bằng cách nào?",
    answer:
      "Truy cập menu Tra cứu lịch, nhập mã booking và số điện thoại đã dùng khi đặt lịch. Hệ thống sẽ trả thông tin trạng thái khi cả hai dữ liệu khớp.",
  },
  {
    question: "Phí dịch vụ có bao gồm phí kiểm định không?",
    answer:
      "Phí dịch vụ được thể hiện theo gói đã chọn. Các khoản kiểm định, bảo hiểm hoặc chi phí khác nếu phát sinh cần được thông báo riêng và rõ ràng.",
  },
  {
    question: "Dịch vụ có bảo đảm xe đạt đăng kiểm không?",
    answer:
      "Không. Đơn vị đăng kiểm có thẩm quyền quyết định kết quả kiểm định theo quy định. Đăng Kiểm Hộ chỉ hỗ trợ tiếp nhận, vận chuyển và các công việc hợp pháp theo thỏa thuận.",
  },
];

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <span className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
        {eyebrow}
      </span>
      <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

export default function GuidePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#08275a] via-blue-800 to-blue-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:py-20">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium">
              <BookOpen size={18} />
              Trung tâm hỗ trợ khách hàng
            </span>

            <h1 className="mt-6 text-3xl font-extrabold leading-tight tracking-tight sm:text-5xl">
              Hướng dẫn sử dụng
              <span className="block text-sky-200">Đăng Kiểm Hộ</span>
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-blue-100">
              Tìm hiểu cách đặt lịch đăng kiểm, yêu cầu nhận xe tận nơi và tra
              cứu tình trạng xử lý. Mọi thao tác đặt lịch cơ bản đều không yêu
              cầu đăng nhập.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-blue-800 transition hover:bg-blue-50"
              >
                Đặt lịch ngay
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/lookup"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Search size={18} />
                Tra cứu lịch
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK NAVIGATION */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              href: "#dat-lich",
              icon: CalendarCheck2,
              title: "Đặt lịch",
              text: "Hướng dẫn từng bước",
            },
            {
              href: "#nhan-xe",
              icon: Truck,
              title: "Nhận xe tận nơi",
              text: "Quy trình bàn giao",
            },
            {
              href: "#tra-cuu",
              icon: Search,
              title: "Tra cứu booking",
              text: "Kiểm tra trạng thái",
            },
            {
              href: "#cau-hoi",
              icon: HelpCircle,
              title: "Câu hỏi thường gặp",
              text: "Giải đáp thắc mắc",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.text}</p>
                </div>
                <ArrowRight
                  size={16}
                  className="ml-auto text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700"
                />
              </a>
            );
          })}
        </div>
      </section>

      {/* BOOKING GUIDE */}
      <section id="dat-lich" className="scroll-mt-24 px-4 py-14 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Hướng dẫn 01"
            title="Cách đặt lịch đăng kiểm xe"
            description="Thực hiện lần lượt các bước sau để gửi yêu cầu đặt lịch đăng kiểm trên hệ thống."
          />

          <div className="mt-9 grid gap-5 md:grid-cols-2">
            {bookingSteps.map((step) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.number}
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                      <Icon size={25} />
                    </div>
                    <span className="text-3xl font-extrabold text-slate-200">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-slate-950">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>

                  <div className="mt-5 space-y-2.5 border-t border-slate-100 pt-5">
                    {step.details.map((detail) => (
                      <div
                        key={detail}
                        className="flex items-start gap-2.5 text-sm text-slate-700"
                      >
                        <CheckCircle2
                          size={17}
                          className="mt-0.5 shrink-0 text-emerald-600"
                        />
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-7 flex flex-col items-start justify-between gap-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3">
              <Info size={21} className="mt-0.5 shrink-0 text-blue-700" />
              <p className="text-sm leading-6 text-blue-900">
                Sau khi tạo booking thành công, hãy lưu lại mã đặt lịch để theo
                dõi. Yêu cầu đã gửi chưa đồng nghĩa lịch được xác nhận.
              </p>
            </div>
            <Link
              href="/booking"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-bold text-white hover:bg-blue-800"
            >
              Đặt lịch
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {/* PICKUP GUIDE */}
      <section
        id="nhan-xe"
        className="scroll-mt-24 border-y border-slate-200 bg-white px-4 py-16 sm:px-6"
      >
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Hướng dẫn 02"
              title="Yêu cầu nhân viên nhận xe tận nơi"
              description="Khi đặt lịch, bạn có thể đăng ký sử dụng dịch vụ hỗ trợ nhận và đưa xe đến trung tâm đăng kiểm."
            />

            <div className="mt-7 space-y-5">
              {[
                {
                  title: "Chọn yêu cầu nhận xe",
                  text: "Tích chọn Yêu cầu nhân viên đến nhận xe trong biểu mẫu đặt lịch.",
                },
                {
                  title: "Cung cấp địa chỉ",
                  text: "Nhập địa chỉ nhận xe và địa chỉ bàn giao nếu khác địa điểm ban đầu.",
                },
                {
                  title: "Xác nhận phương án bàn giao",
                  text: "Bộ phận phụ trách liên hệ thống nhất thời gian, giấy tờ và điều kiện nhận xe.",
                },
                {
                  title: "Phối hợp thực hiện",
                  text: "Nhân viên tiếp nhận phương tiện, hỗ trợ đưa xe đi đăng kiểm và bàn giao theo thỏa thuận.",
                },
              ].map((item, index) => (
                <div key={item.title} className="flex gap-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] bg-gradient-to-br from-blue-50 to-sky-100 p-5 sm:p-9">
            <div className="rounded-2xl border border-blue-100 bg-white p-6 shadow-lg">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
                <div className="rounded-xl bg-blue-700 p-3 text-white">
                  <Truck size={25} />
                </div>
                <div>
                  <p className="font-bold text-slate-950">
                    Nhận và bàn giao phương tiện
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Thực hiện sau khi thống nhất với khách
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin size={20} className="mt-0.5 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Địa điểm nhận xe
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Theo địa chỉ khách đăng ký
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone size={20} className="mt-0.5 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Liên hệ trước khi thực hiện
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Xác nhận phương án và thời gian
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ShieldCheck size={20} className="mt-0.5 text-blue-700" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Bàn giao theo thỏa thuận
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Kiểm tra tình trạng xe và thông tin liên quan
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-amber-50 p-4 text-xs leading-6 text-amber-900">
                Không giao xe, chìa khóa hoặc giấy tờ cho người chưa được xác
                nhận là nhân viên phụ trách theo quy trình của đơn vị cung cấp
                dịch vụ.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LOOKUP GUIDE */}
      <section id="tra-cuu" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            eyebrow="Hướng dẫn 03"
            title="Cách tra cứu và theo dõi booking"
            description="Sau khi đặt lịch, khách có thể tra cứu trạng thái mà không cần đăng nhập."
          />

          <div className="mt-9 grid gap-7 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h3 className="text-lg font-bold text-slate-950">
                Các bước tra cứu
              </h3>

              <div className="mt-6 space-y-5">
                {lookupSteps.map((step, index) => (
                  <div key={step} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-blue-700">
                      {index + 1}
                    </div>
                    <p className="pt-1 text-sm leading-6 text-slate-700">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-7 rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold text-slate-500">
                  Ví dụ định dạng mã đặt lịch
                </p>
                <p className="mt-2 font-mono text-base font-bold tracking-wide text-slate-900">
                  DK-XXXXXXXXXXXXXXXX
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Đây chỉ là mẫu định dạng, không phải mã booking hợp lệ để tra
                  cứu.
                </p>
              </div>

              <Link
                href="/lookup"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-bold text-white transition hover:bg-blue-800"
              >
                <Search size={18} />
                Tra cứu booking
              </Link>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
              <h3 className="text-lg font-bold text-slate-950">
                Ý nghĩa các trạng thái
              </h3>
              <div className="mt-5 space-y-3">
                {statuses.map((status) => (
                  <div
                    key={status.code}
                    className="flex flex-col gap-2 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-start"
                  >
                    <span
                      className={`inline-flex shrink-0 self-start rounded-full border px-3 py-1 text-xs font-bold ${status.className}`}
                    >
                      {status.label}
                    </span>
                    <p className="text-xs leading-6 text-slate-600">
                      {status.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORTANT NOTES */}
      <section className="border-y border-slate-200 bg-blue-50/50 px-4 py-12 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: CalendarCheck2,
                title: "Lịch cần được xác nhận",
                description:
                  "Việc gửi yêu cầu thành công không đồng nghĩa trung tâm đã xác nhận lịch.",
              },
              {
                icon: FileText,
                title: "Chi phí rõ ràng",
                description:
                  "Phí dịch vụ và các khoản liên quan cần được thông báo theo thực tế.",
              },
              {
                icon: BadgeCheck,
                title: "Kết quả kiểm định độc lập",
                description:
                  "Kết luận đạt hoặc không đạt thuộc đơn vị kiểm định có thẩm quyền.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3">
                  <Icon size={24} className="mt-0.5 shrink-0 text-blue-700" />
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="cau-hoi" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionHeading
            eyebrow="Hỗ trợ"
            title="Câu hỏi thường gặp"
            description="Những thông tin cần biết khi sử dụng dịch vụ Đăng Kiểm Hộ."
          />

          <div className="mt-8 space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-slate-200 bg-white px-5 shadow-sm open:border-blue-200"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 py-5 font-semibold text-slate-900 [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <ChevronDown
                    size={19}
                    className="shrink-0 text-slate-500 transition group-open:rotate-180"
                  />
                </summary>
                <p className="border-t border-slate-100 pb-5 pt-4 text-sm leading-7 text-slate-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 sm:px-6">
        <div className="mx-auto max-w-7xl rounded-3xl bg-gradient-to-r from-blue-800 to-blue-600 px-6 py-12 text-white sm:px-10">
          <div className="flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
            <div className="max-w-2xl">
              <h2 className="text-2xl font-extrabold sm:text-3xl">
                Bạn đã sẵn sàng đặt lịch?
              </h2>
              <p className="mt-3 text-sm leading-7 text-blue-100">
                Chọn trung tâm, thời gian còn trống và gửi yêu cầu đăng kiểm
                ngay trên website.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-blue-800 hover:bg-blue-50"
              >
                Đặt lịch ngay
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/lookup"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-semibold text-white hover:bg-white/10"
              >
                Tra cứu lịch
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
