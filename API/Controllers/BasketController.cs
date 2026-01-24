using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    public class BasketController(StoreContext context) : BaseApiController
    {
        [HttpGet]
        public async Task<ActionResult<BasketDto>> GetBasket()
        {
            // Since the basket has one or many basket items and each basket item is related to a product we want all of this data when fetching a basket. Just getting the basket will give us the basket properties without the related objects. This is why we use the Include functions
            var basket = await RetrieveBasket();
            if (basket == null)
            {
                return NoContent();
            }
            return basket.ToDto();
        }

        [HttpPost]
        // No need to specify that we are returning the BasketDto because we are returning it inside the CreatedAtActionResult object we created, but for info purpose we do
        public async Task<ActionResult<BasketDto>> AddItemToBasket(int productId, int quantity)
        {
            // Get basket
            var basket = await RetrieveBasket();
            // Create basket if the basket does exist
            basket ??= CreateBasket(); // The ??= sign checks if the left expression is null and if so, assigns it the right expression
            // Get product
            var product = await context.Products.FindAsync(productId);
            if (product == null) return BadRequest("Problem adding item to basket");
            // Add item to basket
            basket.AddItem(product, quantity);
            // Save changes. The SaveChangesAsync implements the UnitOfWork and the Repository pattern. The idea is that if some of the actions in this method fails, non of them will be executed. The execution is performed only in the SaveChangesAsync function. Up until then the ef only tracks the changes but does not execute them. The SaveChangesAsync method returns an integer that specifies the number of changes that were made in the DB so if a 0 is returned, this means that no changes were made.
            var result = await context.SaveChangesAsync() > 0;
            if (result) return CreatedAtAction(nameof(GetBasket), basket.ToDto()); // The CreatedAtAction creates a CreatedAtActionResult object that produces a StatusCodes.Status201Created response. Itreturns the created CreatedAtActionResult for the response. It also returns the location header of how to get the object that has been updated 
            return BadRequest("Problem updating basket");
        }

        [HttpDelete]
        public async Task<ActionResult<BasketDto>> RemoveBasketItem(int productId, int quantity)
        {
            // Get basket
            var basket = await RetrieveBasket();
            if (basket == null) return BadRequest("Problem retrieving the basket");
            // Remove the item or reduce its quantity
            basket.RemoveItem(productId, quantity);
            // Save changes
            var result = await context.SaveChangesAsync() > 0;
            if (result) return Ok();
            return BadRequest("Problem updating basket");
        }

        private Basket CreateBasket()
        {
            var basketId = Guid.NewGuid().ToString();
            var cookieOptions = new CookieOptions // We need the cookie options because we want to return this as a cookie
            {
                IsEssential = true, // Sometimes users shut down the cookies so we want to explicitly say that cookie is essential for the operation of our application
                Expires = DateTime.UtcNow.AddDays(30)
            };
            Response.Cookies.Append("basketId", basketId, cookieOptions);
            var basket = new Basket
            {
                BasketId = basketId
            };
            context.Baskets.Add(basket);
            return basket;
        }

        private async Task<Basket?> RetrieveBasket()
        {
            return await context.Baskets.Include(x => x.Items).ThenInclude(x => x.Product).FirstOrDefaultAsync(x => x.BasketId == Request.Cookies["basketId"]);
        }
    }
}
