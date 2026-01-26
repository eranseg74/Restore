using API.DTOs;
using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Extensions
{
    public static class BasketExtensions
    {
        public static BasketDto ToDto(this Basket basket) // means that we are extending the Basket entity
        {
            return new BasketDto
            {
                BasketId = basket.BasketId,
                ClientSecret = basket.ClientSecret,
                PaymentIntentId = basket.PaymentIntentId,
                // The following is a collection expression. It is like writing without the [.. ] and ending with .ToList(); 
                Items = [.. basket.Items.Select(x => new BasketItemDto
                {
                    ProductId = x.ProductId,
                    Name = x.Product.Name,
                    Price = x.Product.Price,
                    PictureUrl = x.Product.PictureUrl,
                    Brand = x.Product.Brand,
                    Type = x.Product.Type,
                    Quantity = x.Quantity,
                })]
                // The same as writing:
                /*
                Items = basket.Items.Select(x => new BasketItemDto
                {
                    ProductId = x.ProductId,
                    Name = x.Product.Name,
                    Price = x.Product.Price,
                    PictureUrl = x.Product.PictureUrl,
                    Brand = x.Product.Brand,
                    Type = x.Product.Type,
                    Quantity = x.Quantity,
                }).ToList();
                */
            };
        }
        public static async Task<Basket> GetBasketWithItems(this IQueryable<Basket> query, string? basketId)
        {
            return await query.Include(x => x.Items).ThenInclude(x => x.Product).FirstOrDefaultAsync(x => x.BasketId == basketId) ?? throw new Exception("Cannot get basket");
        }
    }

}
