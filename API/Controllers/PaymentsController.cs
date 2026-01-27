using API.Data;
using API.DTOs;
using API.Entities.OrderAggregate;
using API.Extensions;
using API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Stripe;

namespace API.Controllers
{
    public class PaymentsController(PaymentsService paymentsService, StoreContext context, IConfiguration configuration, ILogger<PaymentsController> logger) : BaseApiController
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

        [HttpPost("webhook")]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(Request.Body).ReadToEndAsync();
            try
            {
                var stripeEvent = ConstructStripeEvet(json);
                // The Object is the actual data that comes with the event. Depending on the event type, we can cast it to the appropriate Stripe object.
                // Object containing the API resource relevant to the event. For example, an invoice.created event will have a full invoice object (Invoice) as the value of the object key.
                if (stripeEvent.Data.Object is not PaymentIntent intent)
                {
                    return BadRequest("Invalid event data object");
                }

                if (intent.Status == "succeeded")
                {
                    await HandlePaymentIntentSucceeded(intent);
                }
                else
                {
                    await HandlePaymentIntentFailed(intent);
                }
                // The idea is that if we failed handling the payment we will try to update all the items quantity in the stock back to what they were before the order. From Stripe perspective. Stripe succeeded in creating the payment intent so we still sending Stripe the Ok result object
                return Ok();
            }
            catch (StripeException ex)
            {
                // Log the error and return a 500 status code if there is a Stripe exception. Since we cannot throw an exception from a webhook endpoint to Stripe, we log the error for further investigation and return to Stripe a 500 internal server error so we will be able to see it in the Stripe dashboard.
                logger.LogError(ex, "Stripe webhook error");
                return StatusCode(StatusCodes.Status500InternalServerError, "Webhook error");
            }
            // Catching any other unexpected exceptions and logging them, then returning a 500 status code.
            catch (Exception ex)
            {
                logger.LogError(ex, "An unexpected error has occured");
                return StatusCode(StatusCodes.Status500InternalServerError, "Unexpected error");
            }
        }

        private async Task HandlePaymentIntentFailed(PaymentIntent intent)
        {
            var order = await context.Orders.Include(x => x.OrderItems).FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id) ?? throw new Exception("Order not found");
            foreach (var item in order.OrderItems)
            {
                var productItem = await context.Products.FindAsync(item.ItemOrdered.ProductId) ?? throw new Exception("Problem updating order stock");
                productItem.QuantityInStock += item.Quantity;
            }
            order.OrderStatus = OrderStatus.PaymentFailed;
            await context.SaveChangesAsync();
        }

        private async Task HandlePaymentIntentSucceeded(PaymentIntent intent)
        {
            var order = await context.Orders.Include(x => x.OrderItems).FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id) ?? throw new Exception("Order not found");
            // There is a possibility that a user will ad an item to the cart, duplicate the tab and add few more items to the cart. Then, return to the first tab which still contains 1 item and pay for it. The basket will still contain all the added items but the user paid only for one item. To handle this hack we compare the total price in the order to the Amount in the intent which is the amount of money that the user will be charged
            if (order.GetTotal() != intent.Amount)
            {
                order.OrderStatus = OrderStatus.PaymentMismatch;
            }
            else
            {
                order.OrderStatus = OrderStatus.PaymentReceived;
            }
            var basket = await context.Baskets.FirstOrDefaultAsync(x => x.PaymentIntentId == intent.Id);
            if (basket != null)
            {
                context.Baskets.Remove(basket);
            }
            await context.SaveChangesAsync();
        }

        // Helper method to construct Stripe event from the webhook payload. The purpose of this method is to validate the webhook signature and create a Stripe Event object.
        // If the signature is invalid, it logs an error and throws a StripeException.
        // The process involves reading the JSON payload from the request body, retrieving the signature from the request headers, and using the webhook secret from the configuration to validate the signature.
        // After payment is successful, stripe will send a webhook to our endpoint, which we need to handle appropriately. This method helps in constructing the event object for further processing. The method takes the JSON payload as input and returns the constructed Stripe Event object.
        private Event ConstructStripeEvet(string json)
        {
            try
            {
                // Constructing the Stripe event using the EventUtility class, which validates the signature and creates the event object. The signature is retrieved from the request headers, and the webhook secret is obtained from the configuration.
                return EventUtility.ConstructEvent(
                    json,
                    Request.Headers["Stripe-Signature"],
                    configuration["StripeSettings:WhSecret"]
                );
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Stripe webhook error - Failed to construct Stripe event");
                throw new StripeException("Invalid signature");
            }
        }
    }
}
