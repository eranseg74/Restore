using API.Entities;
using Microsoft.AspNetCore.Http.HttpResults;
using Stripe;

namespace API.Services
{
    public class DiscountService
    {
        public DiscountService(IConfiguration config)
        {
            StripeConfiguration.ApiKey = config["StripeSettings:SecretKey"];
        }

        public async Task<AppCoupon?> GetCouponFromPromoCode(string code)
        {
            var promotionService = new PromotionCodeService();
            var options = new PromotionCodeListOptions
            {
                Code = code
            };
            var promotionCodes = await promotionService.ListAsync(options);
            var promotionCode = promotionCodes.FirstOrDefault();
            if (promotionCode != null && !string.IsNullOrEmpty(promotionCode.Promotion.CouponId))
            {
                var couponService = new CouponService();
                Coupon stripeCoupon = await couponService.GetAsync(promotionCode.Promotion.CouponId);
                var coupon = new AppCoupon
                {
                    Name = stripeCoupon.Name,
                    CouponId = stripeCoupon.Id,
                    AmountOff = stripeCoupon.AmountOff,
                    PercentOff = stripeCoupon.PercentOff,
                    PromotionCode = code
                };
                return coupon;
            }
            return null;
        }

        public async Task<long> CalculateDiscountFromAmount(AppCoupon appCoupon, long amount, bool removeDiscount = false)
        {
            var couponService = new CouponService();
            var stripeCoupon = await couponService.GetAsync(appCoupon.CouponId);
            if (!removeDiscount)
            {
                if (stripeCoupon.PercentOff.HasValue)
                {
                    return (long)Math.Round(amount * (stripeCoupon.PercentOff.Value / 100), MidpointRounding.AwayFromZero);
                }
                if (stripeCoupon.AmountOff.HasValue)
                {
                    return stripeCoupon.AmountOff.Value;
                }
            }
            return 0;
        }
    }
}
