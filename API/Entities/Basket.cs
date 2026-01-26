namespace API.Entities
{
    public class Basket
    {
        public int Id { get; set; }
        // We create a sepaprate Basket Id and not use the Id because this is the property we want to send with our cookie and we want it to be a string GUID
        public required string BasketId { get; set; }
        public List<BasketItem> Items { get; set; } = [];
        public string? ClientSecret { get; set; } // This is what the client will use this ClientSecret to communicate directly with Stripe (not through our API). We will have to create the client secret once we create the payment intent. Once the PaymentIntent is created Stripe will send us the payment intent which includes the client secret. We (the server) will send the client secret to the client so it will be able to directly communicate with stripe
        public string? PaymentIntentId { get; set; } // The idea here is to allow the user to make changes to his basket. We would have to update the Payment Intent according to these changes

        public void AddItem(Product product, int quantity)
        {
            if (product == null)
            {
                ArgumentNullException.ThrowIfNull(product);
            }
            if (quantity <= 0)
            {
                throw new ArgumentException("Quantity should be greater than zero", nameof(quantity));
            }
            var existingItem = FindItem(product.Id);
            if (existingItem == null)
            {
                Items.Add(new BasketItem
                {
                    Product = product,
                    Quantity = quantity
                });
            }
            else
            {
                existingItem.Quantity += quantity;
            }
        }

        public void RemoveItem(int productId, int quantity)
        {
            if (quantity <= 0)
            {
                throw new ArgumentException("Quantity should be greater than zero", nameof(quantity));
            }
            var item = FindItem(productId);
            if (item == null)
            {
                return;
            }
            item.Quantity -= quantity;
            if (item.Quantity <= 0)
            {
                Items.Remove(item);
            }
        }

        private BasketItem? FindItem(int productId)
        {
            return Items.FirstOrDefault(item => item.ProductId == productId);
        }
    }
}
