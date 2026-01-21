using API.Entities;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
    // We have to pass the options we get in the constructor to the DbContext class we inherit / derive from
    // A DbContext instance represents a session with the database and can be used to query and save instances of your entities. DbContext is a combination of the Unit Of Work and Repository patterns.
    // The following initializes a new instance of the DbContext class using the specified options. The DbContext.OnConfiguring(DbContextOptionsBuilder) method will still be called to allow further configuration of the options.
    public class StoreContext(DbContextOptions options) : DbContext(options)
    {
        // A DbSet<TEntity> can be used to query and save instances of TEntity. LINQ queries against a DbSet<TEntity> will be translated into queries against the database.
        // The results of a LINQ query against a DbSet<TEntity> will contain the results returned from the database and may not reflect changes made in the context that have not been persisted to the database. For example, the results will not contain newly added entities and may still contain entities that are marked for deletion.
        // Depending on the database being used, some parts of a LINQ query against a DbSet<TEntity> may be evaluated in memory rather than being translated into a database query.
        // DbSet<TEntity> objects are usually obtained from a DbSet<TEntity> property on a derived DbContext or from the DbContext.Set<TEntity>() method.
        public DbSet<Product> Products { get; set; }
    }
}
