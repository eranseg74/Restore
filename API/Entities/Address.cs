using System.Text.Json.Serialization;

namespace API.Entities
{
    public class Address
    {
        [JsonIgnore] // This attribute is used to prevent the Id property from being included in JSON serialization and deserialization. This is useful when you want to hide certain properties from being exposed in API responses.
        public int Id { get; set; }
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
