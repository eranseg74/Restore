using API.Data;
using API.DTOs;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class PaymentsController(PaymentsService paymentsService, StoreContext context) : BaseApiController
    {
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<BasketDto>> CreateOrUpdatePaymentIntent()
        {
            // Getting the basket using the cookie
            var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);

            if (basket == null) // Defensive check on the basket
            {
                return BadRequest("Problem with the basket");
            }
            var intent = await paymentsService.CreateOrUpdatePaymentIntent(basket);
            if (intent == null) // Defensive check on the intent
            {
                return BadRequest("Problem creating payment intent");
            }
            // The created intent is what we get back from Stripe when creating a new intent. It contain an Id and a client secret for the client to communicate with Stripe
            basket.PaymentIntentId ??= intent.Id; // If there is no payment intent id, assign the created intent id.
            basket.ClientSecret ??= intent.ClientSecret; // If there is no client secret, assign the client secret in the created intent.

            if (context.ChangeTracker.HasChanges()) // Checking if there are changes in the context that needs to be saved. If so, save them. Otherwise, return the basket DTO
            {
                var result = await context.SaveChangesAsync() > 0;
                if (!result)
                {
                    return BadRequest("Problem updating basket with intent");
                }
            }
            return basket.ToDto();
        }
    }
}

// "clientSecret": "pi_3Stc7LKIMV5xVWCs0BzJ7KUW_secret_ua7MmgkZ0s2aLUfIHuKw5ncCu",
// "paymentIntentId": "pi_3Stc7LKIMV5xVWCs0BzJ7KUW"
