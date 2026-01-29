using System;
using System.ComponentModel.DataAnnotations;

namespace API.DTOs
{
    public class CreateProductDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        [Range(100, double.PositiveInfinity)]
        public long Price { get; set; } // Using long to match the price in Stripe. Otherwise we would use decimal for fraction

        [Required]
        public IFormFile File { get; set; } = null!; // Since IFormFile is not nullable we need to placethe ! sign here

        [Required]
        public required string Type { get; set; }

        [Required]
        public string Brand { get; set; } = string.Empty;

        [Required]
        [Range(0, 200)]
        public int QuantityInStock { get; set; }
    }
}
