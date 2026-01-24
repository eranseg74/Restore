namespace API.RequestHelpers
{
    // This helper class will hold the parameters we want to forward to the client for UI usage
    public class PaginationMetatdata
    {
        public int TotalCount { get; set; } // Total amount of items
        public int PageSize { get; set; } // The maximum number of items that will be displayed in each page
        public int CurrentPage { get; set; } // The current page that is displayed
        public int TotalPages { get; set; } // The total number of pages given the total count and the page size
    }
}
