using System.Text.Json;
using API.RequestHelpers;
using Microsoft.Net.Http.Headers;

namespace API.Extensions
{
    public static class HttpExtensions
    {
        // Currently when we get the products from the API we get them with the metadata in the response body which is ok. Here we also put this data in the header so the client will take it from there. This helper class defined the header properties that will be transferred to the client. Note that we are extending the HttpResponse by adding to it the pagination header
        public static void AddPaginationHeader(this HttpResponse response, PaginationMetatdata metatdata)
        {
            // Since we are not in an API controller we need to manually define the naming policy
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            response.Headers.Append("Pagination", JsonSerializer.Serialize(metatdata, options));
            // Since this is a new custom header we need to expose it. Otherwise it will not be recognized
            response.Headers.Append(HeaderNames.AccessControlExposeHeaders, "Pagination");
        }
    }
}
