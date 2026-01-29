namespace API.Entities
{
    public class Product
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Description { get; set; }
        public long Price { get; set; } // Using long to match the price in Stripe. Otherwise we would use decimal for fraction
        public required string PictureUrl { get; set; }
        public required string Type { get; set; }
        public required string Brand { get; set; }
        public int QuantityInStock { get; set; }
        public string? PublicId { get; set; }

    }
}
