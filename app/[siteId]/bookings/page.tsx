import type { Metadata } from "next";
import { fetchSiteResponse, fetchBookingServices, fetchBookingFormFields, fetchBookingPaymentMethods } from "@/lib/api";
import { resolveColors } from "@/lib/colors";
import { t } from "@/lib/i18n";
import BookingForm from "@/components/booking-form";

export const revalidate = 60;

interface Props {
  params: Promise<{ siteId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { siteId } = await params;
  const siteResponse = await fetchSiteResponse(siteId);
  const data = siteResponse?.site_data;
  const siteName = data?.business?.name || data?.meta?.title || "Booking";
  return {
    title: `Boka tid - ${siteName}`,
    description: `Boka en tid hos ${siteName}`,
  };
}

export default async function BookingsPage({ params }: Props) {
  const { siteId } = await params;

  const [siteResponse, services, formFields, paymentMethods] = await Promise.all([
    fetchSiteResponse(siteId),
    fetchBookingServices(siteId),
    fetchBookingFormFields(siteId),
    fetchBookingPaymentMethods(siteId),
  ]);

  if (!siteResponse) return <div>Site not found</div>;

  const data = siteResponse.site_data;
  const colors = resolveColors(data);
  const lang = data?.meta?.language === "en" ? "en" : "sv";

  return (
    <div className="min-h-screen py-16 px-4" style={{ backgroundColor: colors.background, color: colors.text }}>
      <div className="max-w-3xl mx-auto pt-16">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: colors.text }}>
          {t("booking.title", lang)}
        </h1>
        <BookingForm
          siteId={siteId}
          services={services}
          formFields={formFields}
          paymentMethods={paymentMethods}
          colors={colors}
          lang={lang}
        />
      </div>
    </div>
  );
}
