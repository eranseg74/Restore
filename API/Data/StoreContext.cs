using API.Entities;
using API.Entities.OrderAggregate;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    // We have to pass the options we get in the constructor to the DbContext class we inherit / derive from
    // A DbContext instance represents a session with the database and can be used to query and save instances of your entities. DbContext is a combination of the Unit Of Work and Repository patterns.
    // The following initializes a new instance of the DbContext class using the specified options. The DbContext.OnConfiguring(DbContextOptionsBuilder) method will still be called to allow further configuration of the options.
    public class StoreContext(DbContextOptions options) : IdentityDbContext<User>(options)
    {
        // A DbSet<TEntity> can be used to query and save instances of TEntity. LINQ queries against a DbSet<TEntity> will be translated into queries against the database.
        // The results of a LINQ query against a DbSet<TEntity> will contain the results returned from the database and may not reflect changes made in the context that have not been persisted to the database. For example, the results will not contain newly added entities and may still contain entities that are marked for deletion.
        // Depending on the database being used, some parts of a LINQ query against a DbSet<TEntity> may be evaluated in memory rather than being translated into a database query.
        // DbSet<TEntity> objects are usually obtained from a DbSet<TEntity> property on a derived DbContext or from the DbContext.Set<TEntity>() method.
        public required DbSet<Product> Products { get; set; }
        public required DbSet<Basket> Baskets { get; set; }
        // No need to create another DbSet for the BasketItem. When the DbSet for the Baskets is created it will see the following prop -> public List<BasketItem> Items { get; set; } = []; and because of that will create another DbSet for the BasketItems with one-to-many relationship. In addition, becuase of the navigation properties we defined in the BasketItem it will create the relationship between the Product and the BasketItem (public required Product Product { get; set; })

        public required DbSet<Order> Orders { get; set; }

        // Adding roles
        // If we want to add roles to our application we can do this by overriding the OnModelCreating function that provides default roles. It gives us the builder function to use for creating new default roles for our application. Note that if we do not provide an ID and a ConcurrencyStamp, the Identity framework will generate a different ID and ConcurrencyStamp on every system restart and that will causee errors!
        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);
            builder.Entity<IdentityRole>().HasData(
                new IdentityRole { Id = "cb39a4ad-6c01-4ef3-92e0-a0c8f65d2d09", ConcurrencyStamp = "Member", Name = "Member", NormalizedName = "MEMBER" },
                new IdentityRole { Id = "e43d3a62-38ac-4612-bc46-caca9df4a1b5", ConcurrencyStamp = "Admin", Name = "Admin", NormalizedName = "ADMIN" }
            );
        }
    }
}
