using System.ComponentModel.DataAnnotations.Schema;

namespace API.Entities
{
  // The name of the table the class is mapped to.
  // Initializes a new instance of the TableAttribute class using the specified name of the table.
  // When we ran the migration the table name in the DB was BasketItem.
  [Table("BasketItems")]
  public class BasketItem
  {
    public int Id { get; set; }
    public int Quantity { get; set; }

    // Navigation properties
    // The relationships are -> Each basket can contain many BasketItems (one-to-many). Each BasketItem is related to a single Product (one-to-one). Therefore, we do not have to create the same properties in the basket item as defined in the product. These are reffered as navigation properties.
    public int ProductId { get; set; }
    public required Product Product { get; set; } // A basket item must be related to a product so it is required
    // The following navigation properties are to fully define the relation between the Basket and the BasketItem. Without this the relation is defined only in the Basket entity and therefore will allow the creation of BasketItems without having a Basket defined (BasketId = table.Column<int>(type: "INTEGER", nullable: true) -> It is ok that the BasketId will be null -> not our purpose. Therefore we will define the relation also in this side)
    public int BasketId { get; set; }
    // When creating a BasketItem we must attach it to a Basket. The required will not work and the migration will fail because we do not have the Basket yet, so we define it as null. We add the ! sign because be definition the Basket is not nullable
    public Basket Basket { get; set; } = null!;
  }
}
