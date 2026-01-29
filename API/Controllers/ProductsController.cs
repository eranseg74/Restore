using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.RequestHelpers;
using API.Services;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    // Dependency Injection - When a new instance of the ProductsController is created which happens when it recieves an http request, it instanciate a new instance of the StoreContext. If the StoreContext would not have been defined as a service this would not work because we can only inject services
    public class ProductsController(StoreContext context, IMapper mapper, ImageService imageService) : BaseApiController
    {
        [HttpGet]
        // Using async tasks to query db is the best practice and should always implemented that way
        // Task - When we define async endpoint we need to delegate it into a task which goes and query the DB. In the meantime the main thread continues and does not wait for the Task to complete. Once the Task is complete and the data is fetched the data returns to the main thread and the Task is finished
        public async Task<ActionResult<List<Product>>> GetProducts([FromQuery] ProductParams productParams) // The name orderBy must match the key in the query string
        {
            // The idea is to build a query tree and place it in the query variable which is of type IQueryable. When the tree is ready only then we will query the DB using the ToListAsync function.
            // deffering the execution of the request. See the implementation in the ProductExtensions.cs file
            var query = context.Products.Sort(productParams.OrderBy).Search(productParams.SearchTerm).Filter(productParams.Brands, productParams.Types).AsQueryable(); // Note that the order in the filter is important

            var products = await PagedList<Product>.ToPagedList(query, productParams.PageNumber, productParams.PageSize);

            Response.AddPaginationHeader(products.Metatdata); // Adding the pagination metadata to the header using the HttpExtension we created

            // context.Products is also a query so it is Ok to write context.Products.ToListAsync. Since we want to add sorting / filtering / pagination we use this way
            // return await query.ToListAsync(); // No need to run this because we already fetching the desired data with the pagination properties from the ToPagedList function we implemented
            //return Ok(new { Items = products, products.Metatdata }); // Items is just the key which holds the products. We also add in the returned object the metadata
            // Since we added the pagination metadata to the header we can just return the products
            return products;
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

        [HttpGet("filters")]
        public async Task<IActionResult> GetFilters()
        {
            var brands = await context.Products.Select(x => x.Brand).Distinct().ToListAsync();
            var types = await context.Products.Select(x => x.Type).Distinct().ToListAsync();
            return Ok(new { brands, types });
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<ActionResult<Product>> CreateProduct(CreateProductDto productDto)
        {
            // Using the AutoMapper to map between entities and DTOs. If the name and the type of a propery matches between the objects, AutoMapper will map it automatically saving a lot of boilerplate code. Here we are mapping from productDto to a Product structure and assigning it to product in order to create a new product in our application
            var product = mapper.Map<Product>(productDto); // Mapping the givrn dto to a new Product

            if (productDto.File != null)
            {
                var imageResult = await imageService.AddImageAsync(productDto.File);
                if (imageResult.Error != null)
                {
                    return BadRequest(imageResult.Error.Message);
                }
                product.PictureUrl = imageResult.SecureUrl.AbsoluteUri; // The URL stored in Cloudinary
                product.PublicId = imageResult.PublicId;
            }
            context.Products.Add(product);

            var result = await context.SaveChangesAsync() > 0;
            if (result)
            {
                return CreatedAtAction(nameof(GetProduct), new { Id = product.Id }, product);
            }
            return BadRequest("Problem creating new product");
        }

        [Authorize(Roles = "Admin")]
        [HttpPut]
        public async Task<ActionResult> UpdateProduct(UpdateProductDto productDto)
        {
            var product = await context.Products.FindAsync(productDto.Id);
            if (product == null)
            {
                return NotFound();
            }
            // After finding the product in the DB, in this stage the product is tracked by entityframework. This way, when we map from the productDto to the product from the DB, all the changed fields will be saved to the DB on SaveChangeAsync
            mapper.Map(productDto, product);

            if (productDto.File != null)
            {
                var imageResult = await imageService.AddImageAsync(productDto.File);
                if (imageResult.Error != null)
                {
                    return BadRequest(imageResult.Error.Message);
                }
                if (!string.IsNullOrEmpty(product.PublicId))
                {
                    await imageService.DeleteImageAsync(product.PublicId);
                }
                product.PictureUrl = imageResult.SecureUrl.AbsoluteUri; // The URL stored in Cloudinary
                product.PublicId = imageResult.PublicId;
            }

            var result = await context.SaveChangesAsync() > 0;
            if (result)
            {
                return NoContent();
            }
            return BadRequest("Problem updating the product");
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id:int}")]
        public async Task<ActionResult> DeleteProduct(int id)
        {
            var product = await context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }
            if (!string.IsNullOrEmpty(product.PublicId))
            {
                await imageService.DeleteImageAsync(product.PublicId);
            }
            product.PictureUrl = "";
            product.PublicId = "";
            context.Products.Remove(product);
            var result = await context.SaveChangesAsync() > 0;
            if (result)
            {
                return Ok();
            }
            return BadRequest("Problem deleting the product");
        }
    }
}
