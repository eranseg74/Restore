using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;

namespace API.Entities.OrderAggregate
{
    [Owned] // This attribute indicates that the ShippingAddress class is an owned entity type in Entity Framework Core. Owned entity types are types that do not have their own identity and are used to represent complex types within other entity types. This is useful for value objects like addresses that are conceptually part of another entity (e.g., an Order) and do not need to exist independently in the database.
    public class ShippingAddress
    {
        public required string Name { get; set; }
        public required string Line1 { get; set; }
        public string? Line2 { get; set; }
        public required string City { get; set; }
        public required string State { get; set; }

        [JsonPropertyName("postal_code")] // This attribute is used to specify the JSON property name when serializing and deserializing JSON data. It ensures that the PostalCode property is represented as "postal_code" in JSON format. Important for working with APIs that expect specific naming conventions like Stripe.
        public required string PostalCode { get; set; }
        public required string Country { get; set; }
    }
}
