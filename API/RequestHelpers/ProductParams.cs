namespace API.RequestHelpers
{
    // We may want the pagination params on other objects and not just the product so we defined the pagination parameters in a dedicated class and derive them here
    public class ProductParams : PaginationParams
    {
        public string? OrderBy { get; set; }
        public string? SearchTerm { get; set; }
        public string? Brands { get; set; }
        public string? Types { get; set; }
    }
}
