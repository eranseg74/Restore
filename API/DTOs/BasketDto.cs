using System;

namespace API.DTOs
{
    public class BasketDto
    {
        // We create a sepaprate Basket Id and not use the Id because this is the property we want to send with our cookie and we want it to be a string GUID
        public required string BasketId { get; set; }
        public List<BasketItemDto> Items { get; set; } = [];
        public string? ClientSecret { get; set; }
        public string? PaymentIntentId { get; set; }
    }
}
