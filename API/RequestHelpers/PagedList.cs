using Microsoft.EntityFrameworkCore;

namespace API.RequestHelpers
{
    public class PagedList<T> : List<T> // We will use it for Product but can be used for anything else. We derive from List so we will have all the functionallity of List + the pagination information as well
    {
        public PagedList(List<T> items, int count, int pageNumber, int pageSize)
        {
            Metatdata = new PaginationMetatdata
            {
                TotalCount = count,
                PageSize = pageSize,
                CurrentPage = pageNumber,
                TotalPages = (int)Math.Ceiling(count / (double)pageSize)
            };
            AddRange(items);
        }

        public PaginationMetatdata Metatdata { get; set; }

        public static async Task<PagedList<T>> ToPagedList(IQueryable<T> query, int pageNumber, int pageSize)
        {
            var count = await query.CountAsync(); // Getting the number of products from the DB. Without it we cannot calculate the pagination
            var items = await query.Skip((pageNumber - 1) * pageSize).Take(pageSize).ToListAsync(); // Getting the items that will be displayed in the UI
            return new PagedList<T>(items, count, pageNumber, pageSize);
        }
    }
}
