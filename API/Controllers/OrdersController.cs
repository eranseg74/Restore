using API.Data;
using API.DTOs;
using API.Entities;
using API.Entities.OrderAggregate;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Authorize]
    public class OrdersController(StoreContext context) : BaseApiController // We are injecting StoreContext via constructor 
    {
        [HttpGet]
        public async Task<ActionResult<List<OrderDto>>> GetOrders()
        {
            var orders = await context.Orders.ProjectToDto().Where(x => x.BuyerEmail == User.GetUsername()).ToListAsync();

            return orders;
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<OrderDto>> GetOrderDetails(int id)
        {
            var order = await context.Orders.ProjectToDto().Where(x => x.BuyerEmail == User.GetUsername() && x.Id == id).FirstOrDefaultAsync();
            if (order == null)
            {
                return NotFound();
            }
            return order;
        }

        [HttpPost]
        public async Task<ActionResult<Order>> CreateOrder(CreateOrderDto orderDto)
        {
            var basket = await context.Baskets.GetBasketWithItems(Request.Cookies["basketId"]);
            if (basket == null || basket.Items.Count == 0 || string.IsNullOrEmpty(basket.PaymentIntentId))
            {
                return BadRequest("Basket is empty or not found");
            }
            var items = CreateOrderItems(basket.Items);
            if (items == null)
            {
                return BadRequest("One or more items in your basket are no longer available in the desired quantity");
            }
            var subtotal = items.Sum(x => x.Price * x.Quantity);
            var deliveryFee = CalculateDeliveryFee(subtotal);

            var order = await context.Orders.Include(x => x.OrderItems).FirstOrDefaultAsync(x => x.PaymentIntentId == basket.PaymentIntentId);

            if (order == null) // new order
            {
                order = new Order
                {
                    OrderItems = items,
                    BuyerEmail = User.GetUsername(),
                    ShippingAddress = orderDto.ShippingAddress,
                    DeliveryFee = deliveryFee,
                    Subtotal = subtotal,
                    PaymentSummary = orderDto.PaymentSummary,
                    PaymentIntentId = basket.PaymentIntentId
                };
                context.Orders.Add(order);
            }
            else // Updating existing order
            {
                order.OrderItems = items; // This is the only thing that is updated
            }
            // context.Baskets.Remove(basket); // No need for that because it happens also on the PaymentController whe nthe payment is successful
            //Response.Cookies.Delete("basketId"); // No need for this either since we are deleting the cookie on the client side in the basket Api
            var result = await context.SaveChangesAsync() > 0;
            if (!result)
            {
                return BadRequest("Problem creating order");
            }
            return CreatedAtAction(nameof(CreateOrder), new { id = order.Id }, order.ToDto());
        }

        private static long CalculateDeliveryFee(long subtotal)
        {
            return subtotal > 10000 ? 0 : 500;
        }

        private static List<OrderItem>? CreateOrderItems(List<BasketItem> items)
        {
            var orderItems = new List<OrderItem>();
            foreach (var item in items)
            {
                if (item.Product.QuantityInStock < item.Quantity)
                {
                    return null;
                }
                orderItems.Add(new OrderItem
                {
                    Price = item.Product.Price,
                    Quantity = item.Quantity,
                    ItemOrdered = new ProductItemOrdered
                    {
                        ProductId = item.ProductId,
                        Name = item.Product.Name,
                        PictureUrl = item.Product.PictureUrl
                    }
                });
                item.Product.QuantityInStock -= item.Quantity;
            }
            return orderItems;
        }
    }
}
