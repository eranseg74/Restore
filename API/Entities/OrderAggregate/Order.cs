using System.Runtime;

namespace API.Entities.OrderAggregate
{
    public class Order
    {
        public int Id { get; set; }

        // Required - Using this field we will be able to identify which orders are related to a specific user
        public required string BuyerEmail { get; set; }

        // The shipping address is going to be stored with the order (owned)
        public required ShippingAddress ShippingAddress { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public List<OrderItem> OrderItems { get; set; } = [];
        public long Subtotal { get; set; }
        public long DeliveryFee { get; set; }
        public long Discount { get; set; }

        // In theory this will come from the basket so we will always have it but we will leave it optional - forces us to write defensive code
        public required string PaymentIntentId { get; set; }
        public OrderStatus OrderStatus { get; set; } = OrderStatus.Pending;

        // Payment data should be available since this object will be created after a payment has been made
        public required PaymentSummary PaymentSummary { get; set; }

        public long GetTotal()
        {
            return Subtotal + DeliveryFee - Discount;
        }
    }
}
