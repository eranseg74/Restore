using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    // To update a product we need the same fields in the create product DTO and also the id, so we derive from the CreateProductDto + adding the Id primary key which will be used for updating
    public class UpdateProductDto
    {
        public int Id { get; set; }

        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(100, double.PositiveInfinity)]
        public long Price { get; set; } // Using long to match the price in Stripe. Otherwise we would use decimal for fraction

        public IFormFile? File { get; set; }

        [Required]
        public required string Type { get; set; }

        [Required]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [Range(0, 200)]
        public int QuantityInStock { get; set; }
    }
}
