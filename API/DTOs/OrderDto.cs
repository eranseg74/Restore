using API.Entities.OrderAggregate;

namespace API.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }

        // Required - Using this field we will be able to identify which orders are related to a specific user
        public required string BuyerEmail { get; set; }

        // The shipping address is going to be stored with the order (owned)
        public required ShippingAddress ShippingAddress { get; set; }
        public DateTime OrderDate { get; set; }
        public List<OrderItemDto> OrderItems { get; set; } = [];
        public long Subtotal { get; set; }
        public long DeliveryFee { get; set; }
        public long Discount { get; set; }
        public long Total { get; set; }
        public required string OrderStatus { get; set; }
        // Payment data should be available since this object will be created after a payment has been made
        public required PaymentSummary PaymentSummary { get; set; }
    }
}
