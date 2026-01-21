using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    // Dependency Injection - When a new instance of the ProductsController is created which happens when it recieves an http request, it instanciate a new instance of the StoreContext. If the StoreContext would not have been defined as a service this would not work because we can only inject services
    public class ProductsController(StoreContext context) : ControllerBase
    {
        [HttpGet]
        // Using async tasks to query db is the best practice and should always implemented that way
        // Task - When we define async endpoint we need to delegate it into a task which goes and query the DB. In the meantime the main thread continues and does not wait for the Task to complete. Once the Task is complete and the data is fetched the data returns to the main thread and the Task is finished
        public async Task<ActionResult<List<Product>>> GetProducts()
        {
            return await context.Products.ToListAsync();
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            return product;
        }
    }
}
