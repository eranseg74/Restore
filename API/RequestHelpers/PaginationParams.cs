namespace API.RequestHelpers
{
    public class PaginationParams
    {
        private const int MaxPageSize = 50;
        public int PageNumber { get; set; } = 1;
        private int _pageSize = 8; // If the client will not specify the page size we will default to 8
        public int PageSize
        {
            get => _pageSize;
            set => _pageSize = value > MaxPageSize ? MaxPageSize : value;
            // Same outcome different writting
            // get { return _pageSize; }
            // set { _pageSize = value > MaxPageSize ? MaxPageSize : value; }
        }

    }
}
